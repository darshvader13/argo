import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { auth } from "@/auth";
import { UserManager } from "@/lib/user";
import { Holding, Security } from "plaid";

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
        let holdings: Holding[] = [];
        let securities: Security[] = [];

        try {
            const investmentsResponse = await plaidClient.investmentsHoldingsGet({
                access_token: user.plaid_access_token,
            });
            holdings = investmentsResponse.data.holdings;
            securities = investmentsResponse.data.securities;
        } catch (e) {
            if (e instanceof Error && 'response' in e) {
                console.error("Plaid error details:", (e as any).response?.data);
            }
            console.warn("Investments fetch failed:", e);
        }

        return NextResponse.json({
            investments: { holdings, securities }
        });
    } catch (e) {
        console.error("Error fetching Plaid investments:", e);
        if (e instanceof Error && 'response' in e) {
            console.error("Plaid error details:", (e as any).response?.data);
        }
        return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 });
    }
}
