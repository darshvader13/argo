import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ConversationManager } from "@/lib/conversation";
import { UserManager } from "@/lib/user";

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const conversationId = formData.get("conversationId") as string;

        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
        if (!conversationId) return NextResponse.json({ error: "No conversation ID" }, { status: 400 });

        const user = await UserManager.getUser(session.user.email);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const attachmentId = `${conversationId}/${Date.now()}-${file.name}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        await ConversationManager.uploadAttachment(attachmentId, buffer, file.type);

        await ConversationManager.addAttachmentLink(user.id, conversationId, attachmentId);

        return NextResponse.json({ attachmentId });
    } catch (e) {
        console.error("Upload failed", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
