import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ConversationManager } from "@/lib/conversation";
import { UserManager } from "@/lib/user";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await UserManager.getUser(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const slug = await params;
    const conversationId = slug.id;

    try {
        const messages = await ConversationManager.getMessages(user.id, conversationId);
        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Fetch messages error:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await UserManager.getUser(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const slug = await params;
    const conversationId = slug.id;
    const { messages } = await request.json();

    try {
        await ConversationManager.saveMessages(user.id, conversationId, messages);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Save messages error:", error);
        return NextResponse.json({ error: "Failed to save messages" }, { status: 500 });
    }
}
