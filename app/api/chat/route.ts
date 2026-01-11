import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { auth } from "@/auth";
import { ConversationManager } from "@/lib/conversation";
import { UserManager } from "@/lib/user";

const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, context, latestMessageOverride } = await req.json();

    const systemPrompt = `
You are Argo, an expert AI financial assistant. 
The current date is ${new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
You have access to the user's financial data (accounts, transactions, investments) in JSON format below.
Your goal is to answer the user's question clearly, concisely, and accurately based on this data.

User Data:
${JSON.stringify(context)}

Instructions:
- If the user asks for a chart, graph, or visualization:
    1. Analyze the data to determine the best chart type (bar, line, pie, area).
    2. Generate a JSON configuration for the chart inside a <chart> tag.
    3. The JSON must follow this structure:
       {
         "type": "bar" | "line" | "pie" | "area",
         "title": "Chart Title",
         "data": [
           { "label": "Label1", "value": 100, "color": "#10b981" },
           { "label": "Label2", "value": 200, "color": "#f43f5e" }
         ]
       }
    4. Provide a brief text summary alongside the chart.
- If the user asks for balances, sum them up accurately.
- If the user asks for portfolio details, summarize the holdings.
- Do not graph data in the future, unless the user explicitly asks for it.
- Be friendly and professional.
- Do not make up data not present in the JSON or the attached document.
- If an attachment is provided, prioritize its content over the JSON data.
- If the user attaches statements, first filter out any transactions that are not relevant to the user's question.
- Once the filtering is done, use the remaining transactions to answer the user's question.

When classifying vendors, look for partial matches and common variations:
- Credit card transactions often include internal codes, reference numbers, or location codes
- Match based on recognizable vendor names embedded in the description
- Common patterns:
  * "AMAZON MKTPL*" or "AMZN.COM" → Amazon
  * "SQ *" or "SQUARE *" → Square payment processor (check what follows for actual vendor)
  * "PAYPAL *" → PayPal (check what follows for actual vendor)
  * "TST* " → Toast POS system (check for restaurant name)
`;

    const formattedMessages = await Promise.all(messages.map(async (msg: any) => {
        if (msg.attachmentId) {
            const user = await UserManager.getUser(session.user?.email!);
            if (user) {
                const inferredConvoId = msg.attachmentId.split('/')[0];
                const meta = await ConversationManager.listConversations(user.id);
                const convo = meta.find(c => c.conversation_id === inferredConvoId);

                if (convo && convo.attachment_ids?.includes(msg.attachmentId)) {
                    const branding = await ConversationManager.getAttachment(msg.attachmentId);
                    if (branding) {
                        const isPdf = branding.contentType === "application/pdf";
                        const isCsv = branding.contentType.includes("csv") || msg.attachmentId.endsWith(".csv");

                        if (isPdf) {
                            return {
                                role: msg.role,
                                content: [
                                    { type: "text", text: msg.content || "Analyze this document." },
                                    {
                                        type: "document",
                                        source: {
                                            type: "base64",
                                            media_type: "application/pdf",
                                            data: branding.body
                                        }
                                    }
                                ]
                            };
                        } else if (isCsv) {
                            const decoded = Buffer.from(branding.body, 'base64').toString('utf-8');
                            return {
                                role: msg.role,
                                content: msg.content + "\n\nCSV Data:\n" + decoded
                            };
                        }
                    }
                }
            }
        }

        return {
            role: msg.role,
            content: msg.content
        };
    }));

    if (latestMessageOverride && formattedMessages.length > 0) {
        const lastMsg = formattedMessages[formattedMessages.length - 1];
        if (lastMsg.role === 'user') {
            lastMsg.content = latestMessageOverride;
        }
    }

    const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        system: systemPrompt,
        messages: formattedMessages,
    };

    try {
        const command = new InvokeModelCommand({
            modelId: process.env.AWS_BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20240620-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(payload),
        });

        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const reply = responseBody.content[0].text;

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Bedrock Error:", error);
        return NextResponse.json({
            reply: "I'm having trouble connecting to my brain (AWS Bedrock). Please check your credentials."
        });
    }
}
