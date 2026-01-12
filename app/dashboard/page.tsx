import Navbar from "../components/Navbar";
import ConnectBankCard from "../components/dashboard/ConnectBankCard";
import FileDropzone from "../components/dashboard/FileDropzone";
import FinancialOverview from "../components/dashboard/FinancialOverview";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserManager } from "@/lib/user";

export default async function Dashboard() {
    const session = await auth();
    if (!session || !session.user?.email) redirect("/");

    const user = await UserManager.getUser(session.user.email);
    const isConnected = !!user?.plaid_access_token;

    return (
        <main className="min-h-screen bg-black text-foreground selection:bg-primary/30 selection:text-primary-foreground">
            <Navbar />

            <div className="container mx-auto px-6 pt-32 pb-20">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
                        Welcome back, <span className="text-primary">{session.user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-xl text-zinc-400">
                        {isConnected ? "Here is your financial overview." : "How would you like to add your financial data today?"}
                    </p>
                </div>

                {isConnected ? (
                    <FinancialOverview />
                ) : (
                    <div className="mx-auto max-w-5xl">
                        <div className="flex flex-col gap-6">
                            <ConnectBankCard />
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
