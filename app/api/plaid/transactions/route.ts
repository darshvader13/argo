import { NextRequest, NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { auth } from "@/auth";
import { UserManager } from "@/lib/user";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await UserManager.getUser(session.user.email);
    if (!user || !user.plaid_access_token) {
        return NextResponse.json({ error: "No bank connected" }, { status: 400 });
    }

    const searchParams = req.nextUrl.searchParams;
    const daysParam = searchParams.get('days');
    let days = 30;
    if (daysParam) {
        const parsed = parseInt(daysParam);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 730) {
            days = parsed;
        }
    }

    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const endDate = new Date();

        const transactionsResponse = await plaidClient.transactionsGet({
            access_token: user.plaid_access_token,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
        });

        return NextResponse.json({
            transactions: transactionsResponse.data.transactions
        });
    } catch (error) {
        console.error("Error fetching Plaid transactions:", error);
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }
}
