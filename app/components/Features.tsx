export default function Features() {
    const features = [
        {
            title: "Smart Insights",
            description: "Our Generative AI analyzes your spending patterns to find hidden saving opportunities.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
            ),
        },
        {
            title: "Bank Level Security",
            description: "We use Plaid for secure, read-only access to your financial data. Your credentials are safe.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            title: "Future Forecasting",
            description: "Predict your net worth and upcoming expenses with our advanced predictive models.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
            ),
        },
    ];

    return (
        <section id="features" className="py-24 bg-black relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white mb-4">
                        Financial Clarity <br /> Powered by <span className="text-primary">Intelligence</span>
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Argo goes beyond simple categorization. It understands the context of your transactions.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group relative rounded-2xl border border-white/10 bg-secondary/50 p-8 transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-secondary hover:shadow-2xl hover:shadow-primary/5"
                        >
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-white/10 group-hover:bg-primary/20 group-hover:ring-primary/50 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-white group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
