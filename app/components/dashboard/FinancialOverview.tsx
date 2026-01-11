"use client";

import { useEffect, useState } from "react";
import ChatInterface from "./ChatInterface";

interface Account {
    account_id: string;
    balances: {
        available: number;
        current: number;
        iso_currency_code: string;
    };
    name: string;
    type: string;
}

interface Transaction {
    transaction_id: string;
    amount: number;
    date: string;
    name: string;
    merchant_name?: string;
    category?: string[];
}

export default function FinancialOverview() {
    const [data, setData] = useState<{ accounts: Account[]; transactions: Transaction[]; investments?: any } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accountsRes, transactionsRes, investmentsRes] = await Promise.all([
                    fetch('/api/plaid/accounts'),
                    fetch('/api/plaid/transactions?days=30'),
                    fetch('/api/plaid/investments')
                ]);

                if (accountsRes.ok && transactionsRes.ok && investmentsRes.ok) {
                    const accountsData = await accountsRes.json();
                    const transactionsData = await transactionsRes.json();
                    const investmentsData = await investmentsRes.json();

                    setData({
                        accounts: accountsData.accounts,
                        transactions: transactionsData.transactions,
                        investments: investmentsData.investments
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-white animate-pulse">Loading financial data...</div>;
    if (!data) return null;

    return (
        <div className="space-y-8 w-full">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.accounts.map((account) => (
                    <div key={account.account_id} className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                        <div className="text-sm text-zinc-400 uppercase tracking-wider mb-2">{account.type} - {account.name}</div>
                        <div className="text-3xl font-bold text-white">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: account.balances.iso_currency_code || 'USD' }).format(account.balances.current)}
                        </div>
                        <div className="text-sm text-zinc-500 mt-1">Available: {new Intl.NumberFormat('en-US', { style: 'currency', currency: account.balances.iso_currency_code || 'USD' }).format(account.balances.available || 0)}</div>
                    </div>
                ))}
            </div>

            <div className="w-full">
                <ChatInterface transactions={data.transactions} accounts={data.accounts} investments={data.investments} />
            </div>
        </div>
    );
}
