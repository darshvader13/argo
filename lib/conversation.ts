import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const ddbClient = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});

const TABLE_NAME = process.env.AWS_CONVERSATIONS_DDB_NAME || "";
const BUCKET_NAME = process.env.AWS_CONVERSATIONS_S3_NAME || "";
const ATTACHMENTS_BUCKET_NAME = process.env.AWS_ATTACHMENTS_BUCKET_NAME || BUCKET_NAME;

export interface ConversationMetadata {
    user_id: string;
    conversation_id: string;
    title: string;
    updated_at: string;
    attachment_ids?: string[];
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    text: string;
    type?: 'text' | 'chart';
    chartConfig?: any;
    timestamp: number;
    attachmentId?: string;
}

export class ConversationManager {
    static async createConversation(userId: string, conversationId: string, title: string): Promise<void> {
        if (!userId || !conversationId) throw new Error("Missing ID");

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                user_id: userId,
                conversation_id: conversationId,
                title,
                updated_at: new Date().toISOString(),
                attachment_ids: []
            }
        }));
    }

    static async listConversations(userId: string): Promise<ConversationMetadata[]> {
        const result = await docClient.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "user_id = :uid",
            ExpressionAttributeValues: {
                ":uid": userId
            },
            ScanIndexForward: false
        }));
        const conversations = (result.Items as ConversationMetadata[]) || [];

        return conversations.sort((a, b) => {
            const dateA = new Date(a.updated_at).getTime();
            const dateB = new Date(b.updated_at).getTime();
            return dateB - dateA;
        });
    }

    static async addAttachmentLink(userId: string, conversationId: string, attachmentId: string): Promise<void> {

        await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { user_id: userId, conversation_id: conversationId },
            UpdateExpression: "SET attachment_ids = list_append(if_not_exists(attachment_ids, :empty_list), :attr)",
            ExpressionAttributeValues: {
                ":attr": [attachmentId],
                ":empty_list": []
            }
        }));
    }

    static async saveMessages(userId: string, conversationId: string, messages: Message[]): Promise<void> {
        if (!BUCKET_NAME) throw new Error("S3 Bucket not configured");

        const isValid = await this.verifyOwnership(userId, conversationId);
        if (!isValid) throw new Error("Unauthorized Access");

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `${conversationId}.json`,
            Body: JSON.stringify(messages),
            ContentType: "application/json"
        });
        await s3Client.send(command);
    }

    static async getMessages(userId: string, conversationId: string): Promise<Message[]> {
        if (!BUCKET_NAME) throw new Error("S3 Bucket not configured");

        const isValid = await this.verifyOwnership(userId, conversationId);
        if (!isValid) {
            console.warn(`Unauthorized access attempt: User ${userId} tried to access ${conversationId}`);
            return [];
        }

        try {
            const command = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: `${conversationId}.json`
            });
            const response = await s3Client.send(command);
            const str = await response.Body?.transformToString();
            return str ? JSON.parse(str) : [];
        } catch (e: any) {
            if (e.name === 'NoSuchKey') return [];
            console.error("S3 Fetch Error:", e);
            throw e;
        }
    }

    private static async verifyOwnership(userId: string, conversationId: string): Promise<boolean> {
        const result = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                user_id: userId,
                conversation_id: conversationId
            }
        }));
        return !!result.Item;
    }

    static async getAttachment(key: string): Promise<{ body: string, contentType: string } | null> {
        if (!ATTACHMENTS_BUCKET_NAME) throw new Error("Attachments Bucket not configured");

        try {
            const command = new GetObjectCommand({
                Bucket: ATTACHMENTS_BUCKET_NAME,
                Key: key
            });
            const response = await s3Client.send(command);

            const byteArray = await response.Body?.transformToByteArray();
            if (!byteArray) return null;

            return {
                body: Buffer.from(byteArray).toString('base64'),
                contentType: response.ContentType || 'application/octet-stream'
            };
        } catch (e: any) {
            console.error("Attachment Fetch Error:", e);
            return null;
        }
    }

    static async uploadAttachment(key: string, body: Buffer | Uint8Array | string, contentType: string): Promise<void> {
        if (!ATTACHMENTS_BUCKET_NAME) throw new Error("Attachments Bucket not configured");

        await s3Client.send(new PutObjectCommand({
            Bucket: ATTACHMENTS_BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType: contentType
        }));
    }
}
