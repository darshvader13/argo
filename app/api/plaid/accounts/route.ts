import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { auth } from "@/auth";
import { UserManager } from "@/lib/user";

export async function GET() {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await UserManager.getUser(session.user.email);
    if (!user || !user.plaid_access_token) {
        return NextResponse.json({ error: "No bank connected" }, { status: 400 });
    }

    try {
        const accountsResponse = await plaidClient.accountsBalanceGet({
            access_token: user.plaid_access_token,
        });

        return NextResponse.json({
            accounts: accountsResponse.data.accounts
        });
    } catch (error) {
        console.error("Error fetching Plaid accounts:", error);
        return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
    }
}
