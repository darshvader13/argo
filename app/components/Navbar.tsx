import Link from "next/link";
import { signIn, signOut, auth } from "@/auth";

export default async function Navbar() {
    const session = await auth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
                    Argo<span className="text-primary">.ai</span>
                </Link>



                <div className="flex items-center gap-4">
                    {!session ? (
                        <>
                            <form
                                action={async () => {
                                    "use server";
                                    await signIn("google");
                                }}
                            >
                                <button
                                    type="submit"
                                    className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                                >
                                    Log in
                                </button>
                            </form>

                            <form
                                action={async () => {
                                    "use server";
                                    await signIn("google", { redirectTo: "/dashboard" });
                                }}
                            >
                                <button
                                    type="submit"
                                    className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-all border border-primary/20 hover:border-primary/50"
                                >
                                    Get Started
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="hidden sm:inline-block text-sm font-medium text-white hover:text-primary transition-colors"
                            >
                                Dashboard
                            </Link>
                            <span className="text-sm text-zinc-500 hidden md:inline-block">
                                |
                            </span>
                            <span className="text-sm text-zinc-400 hidden sm:inline-block">
                                {session.user?.name}
                            </span>
                            {session.user?.image && (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    className="w-8 h-8 rounded-full border border-white/10"
                                />
                            )}
                            <form
                                action={async () => {
                                    "use server";
                                    await signOut();
                                }}
                            >
                                <button type="submit" className="text-sm text-zinc-400 hover:text-white">
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
