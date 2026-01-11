import Link from "next/link";
import { signIn } from "@/auth";

export default function Hero() {
    return (
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
            {/* Background Elements */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
                <div className="h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
            </div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex max-w-4xl flex-col items-center gap-6">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                    <span className="mr-2 flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                    Now integrating with Plaid
                </div>

                <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
                    Master Your Money with <br />
                    <span className="text-gradient-green">Intelligent AI</span>
                </h1>

                <p className="max-w-2xl text-lg text-zinc-400 sm:text-xl leading-relaxed">
                    Argo connects securely to your bank via Plaid and uses advanced Generative AI to analyze habits, find savings, and forecast your financial future.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                    <form
                        action={async () => {
                            "use server";
                            await signIn("google");
                        }}
                    >
                        <button
                            type="submit"
                            className="group relative inline-flex h-12 w-full sm:w-auto items-center justify-center overflow-hidden rounded-full bg-primary px-8 font-semibold text-black transition-all hover:bg-emerald-400 hover:scale-105"
                        >
                            <span className="relative z-10">Start Your Trial</span>
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </button>
                    </form>

                    <Link
                        href="#features"
                        className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50 px-8 font-semibold text-zinc-300 backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-white"
                    >
                        See How It Works
                    </Link>
                </div>


            </div>
        </section>
    );
}
