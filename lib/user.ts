import crypto from 'crypto';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

export interface User {
    id: string;
    email: string;
    name?: string;
    plaid_access_token?: string;
    plaid_item_id?: string;
    cursor?: string;
}
const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-west-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.AWS_USERS_DDB_NAME || "";

export class UserManager {
    private static generateId(email: string): string {
        return crypto.createHash('sha256').update(email).digest('hex');
    }

    static async getUser(email: string): Promise<User | undefined> {
        const id = this.generateId(email);
        try {
            const command = new GetCommand({
                TableName: TABLE_NAME,
                Key: { id },
            });
            const response = await docClient.send(command);
            return response.Item as User | undefined;
        } catch (error) {
            console.error("DynamoDB Get Error:", error);
            return undefined;
        }
    }

    static async createUser(email: string, name?: string): Promise<User> {
        const existing = await this.getUser(email);
        if (existing) return existing;

        const id = this.generateId(email);
        const newUser: User = { id, email, name };

        try {
            await docClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: newUser,
                ConditionExpression: "attribute_not_exists(id)"
            }));
            return newUser;
        } catch (error: any) {
            if (error.name === 'ConditionalCheckFailedException') {
                const existing = await this.getUser(email);
                if (existing) return existing;
            }
            console.error("DynamoDB Create Error:", error);
            throw error;
        }
    }

    static async updateUser(email: string, data: Partial<User>): Promise<User> {
        const user = await this.getUser(email);
        if (!user) throw new Error("User not found via " + email);

        const updatedUser = { ...user, ...data };

        try {
            await docClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: updatedUser
            }));
            return updatedUser;
        } catch (error) {
            console.error("DynamoDB Update Error:", error);
            throw error;
        }
    }
}
