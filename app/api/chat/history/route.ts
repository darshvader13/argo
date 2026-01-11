import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ConversationManager } from "@/lib/conversation";
import { UserManager } from "@/lib/user";

export async function GET(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await UserManager.getUser(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    try {
        const conversations = await ConversationManager.listConversations(user.id);
        return NextResponse.json({ conversations });
    } catch (error) {
        console.error("List history error:", error);
        return NextResponse.json({ error: "Failed to list history" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await UserManager.getUser(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { conversationId, title } = await req.json();

    try {
        await ConversationManager.createConversation(user.id, conversationId, title || "New Chat");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Create history error:", error);
        return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
    }
}
