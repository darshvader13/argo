"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface ChoiceCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    onClick?: () => void;
    href?: string;
    disabled?: boolean;
}

export default function ChoiceCard({ title, description, icon, onClick, href, disabled }: ChoiceCardProps) {
    const Content = (
        <div className={`group relative flex h-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/50 p-8 text-center transition-all hover:border-primary/50 hover:bg-zinc-900 hover:shadow-2xl hover:shadow-primary/5 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-white/10 group-hover:bg-primary/20 group-hover:scale-110 group-hover:ring-primary/50 transition-all duration-300">
                {icon}
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white group-hover:text-primary transition-colors">
                {title}
            </h3>
            <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors">
                {description}
            </p>
        </div>
    );

    if (href && !disabled) {
        return (
            <Link href={href} className="flex-1 w-full">
                {Content}
            </Link>
        );
    }

    return (
        <div onClick={disabled ? undefined : onClick} className="flex-1 w-full">
            {Content}
        </div>
    );
}
