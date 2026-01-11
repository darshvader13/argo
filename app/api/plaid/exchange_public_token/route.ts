import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { auth } from "@/auth";
import { UserManager } from "@/lib/user";

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { public_token } = await req.json();

    try {
        const response = await plaidClient.itemPublicTokenExchange({
            public_token,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        await UserManager.updateUser(session.user.email, {
            plaid_access_token: accessToken,
            plaid_item_id: itemId,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error exchanging public token:", error);
        return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
    }
}
