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
                    <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
                        {/* Option 1: Plaid */}
                        <div className="flex flex-col gap-6">
                            <ConnectBankCard />
                        </div>

                        {/* Option 2: File Upload */}
                        <div className="flex flex-col gap-6">
                            <div className="rounded-2xl border border-white/10 bg-zinc-900/20 p-8 h-full">
                                <div className="mb-6 flex items-center justify-center">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-white/10">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-center mb-8">
                                    <h3 className="mb-2 text-2xl font-bold text-white">Upload Statement</h3>
                                    <p className="text-zinc-400">Drag and drop your PDF or CSV bank statements here.</p>
                                </div>

                                <FileDropzone />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
