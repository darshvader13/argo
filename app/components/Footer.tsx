import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid gap-12 md:grid-cols-4 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
                            Argo<span className="text-primary">.ai</span>
                        </Link>
                        <p className="mt-4 max-w-sm text-sm text-zinc-500">
                            The intelligent financial assistant that helps you master your money securely.
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-semibold text-white">Product</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Security</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Integration</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-semibold text-white">Company</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-xs text-zinc-600">
                    <p>&copy; {new Date().getFullYear()} Argo AI Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
