"use client";

import { useCallback, useState, useEffect } from "react";
import { usePlaidLink, PlaidLinkOnSuccess, PlaidLinkOptions } from "react-plaid-link";
import ChoiceCard from "./ChoiceCard";
import { useRouter } from "next/navigation";

export default function ConnectBankCard() {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const createLinkToken = async () => {
            const response = await fetch('/api/plaid/create_link_token', { method: 'POST' });
            const data = await response.json();
            setToken(data.link_token);
        };
        createLinkToken();
    }, []);

    const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token) => {
        setLoading(true);
        await fetch('/api/plaid/exchange_public_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_token }),
        });
        setLoading(false);

        router.refresh();
    }, [router]);

    const config: PlaidLinkOptions = {
        token,
        onSuccess,
    };

    const { open, ready } = usePlaidLink(config);

    return (
        <ChoiceCard
            title="Connect Bank"
            description="Securely sync your transactions and balances in real-time using Plaid."
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                </svg>
            }
            onClick={() => open()}
            disabled={!ready || loading}
        />
    );
}
