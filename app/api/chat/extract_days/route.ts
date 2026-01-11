import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { auth } from "@/auth";

const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();

    const prompt = `
    You are a helper API. Your job is to extract the time period in "number of days" from the user's message relative to today.
    
    Current Date: ${new Date().toISOString().split('T')[0]}

    Rules:
    - Return ONLY a valid JSON object: { "days": number | null }
    - If the user specifies a period (e.g., "last week", "last 3 months", "past year"), calculate the approximate days.
    - "Last week" = 7
    - "Last month" = 30
    - "Last year" = 365
    - If no specific time period is mentioned, return { "days": null }.
    - Do not output any other text or markdown formatting.

    User Message: "${message}"
    `;

    const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 100,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
    };

    try {
        const command = new InvokeModelCommand({
            modelId: process.env.AWS_BEDROCK_MODEL_ID,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(payload),
        });

        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const rawText = responseBody.content[0].text;

        let result = { days: null };
        try {
            const match = rawText.match(/\{.*\}/);
            if (match) {
                result = JSON.parse(match[0]);
            } else {
                result = JSON.parse(rawText);
            }
        } catch (e) {
            console.warn("Failed to parse days JSON", rawText);
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Bedrock Error:", error);
        return NextResponse.json({ days: null });
    }
}
