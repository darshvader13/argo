import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { auth } from "@/auth";
import { UserManager } from "@/lib/user";
import { CountryCode, Products } from "plaid";

export async function POST() {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await UserManager.createUser(session.user.email, session.user.name || undefined);

    try {
        const createTokenResponse = await plaidClient.linkTokenCreate({
            user: {
                client_user_id: user.id,
            },
            client_name: "Argo AI Financial Helper",
            products: ["auth", "transactions", "investments"] as Products[],
            country_codes: ["US"] as CountryCode[],
            language: "en",
        });

        return NextResponse.json(createTokenResponse.data);
    } catch (error) {
        console.error("Error creating link token:", error);
        if (error instanceof Error && 'response' in error) {
            console.error("Plaid error details:", (error as any).response?.data);
        }
        return NextResponse.json({ error: "Failed to create link token" }, { status: 500 });
    }
}
