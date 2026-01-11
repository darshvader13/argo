"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User as UserIcon, Paperclip, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import SpendingChart from "./SpendingChart";
import FileDropzone from "./FileDropzone";

interface Transaction {
    transaction_id: string;
    amount: number;
    date: string;
    name: string;
    category?: string[];
}

interface Account {
    name: string;
    balances: {
        current: number;
        iso_currency_code: string;
    };
}

interface Investment {
    holdings: any[];
    securities: any[];
}

interface ChatInterfaceProps {
    transactions: Transaction[];
    accounts: Account[];
    investments?: Investment;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    text: string;
    type?: 'text' | 'chart';
    chartConfig?: any;
    timestamp?: number;
    attachmentId?: string;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            }
        };
        reader.onerror = error => reject(error);
    });
};

export default function ChatInterface({ transactions, accounts, investments }: ChatInterfaceProps) {
    const [currentDays, setCurrentDays] = useState(30);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>(transactions);

    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<{ conversation_id: string; title: string }[]>([]);
    const [showSidebar, setShowSidebar] = useState(true);

    const [showUpload, setShowUpload] = useState(false);
    const [attachment, setAttachment] = useState<{ file: File, base64: string } | null>(null);

    useEffect(() => {
        setAllTransactions(transactions);
    }, [transactions]);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I analyze your finances. You can ask me to show your spending charts, check balances, list recent transactions, or review your portfolio.",
            text: "Hello! I analyze your finances. You can ask me to show your spending charts, check balances, list recent transactions, or review your portfolio.",
            type: 'text'
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetch('/api/chat/history')
            .then(res => res.json())
            .then(data => {
                if (data.conversations) {
                    setConversations(data.conversations);
                }
            })
            .catch(err => console.error("Failed to load history", err));
    }, []);

    useEffect(() => {
        if (conversationId && messages.length > 1) {
            const timeout = setTimeout(() => {
                fetch(`/api/chat/history/${conversationId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages })
                }).catch(err => console.error("Failed to auto-save", err));
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [messages, conversationId]);

    const loadConversation = async (id: string) => {
        try {
            const res = await fetch(`/api/chat/history/${id}`);
            const data = await res.json();
            if (data.messages) {
                setMessages(data.messages);
                setConversationId(id);
            }
        } catch (e) {
            console.error("Failed to load chat", e);
        }
    };

    const startNewChat = () => {
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content: "Hello! I analyze your finances. You can ask me to show your spending charts, check balances, list recent transactions, or review your portfolio.",
                text: "Hello! I analyze your finances. You can ask me to show your spending charts, check balances, list recent transactions, or review your portfolio.",
                type: 'text'
            }
        ]);
        setConversationId(null);
    };

    const handleSend = async () => {
        if (!input.trim() && !attachment) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input + (attachment ? `\n[Attached: ${attachment.file.name}]` : ""),
            text: input + (attachment ? ` \n[Attached: ${attachment.file.name}]` : ""),
            type: 'text',
            timestamp: Date.now()
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);

        const currentAttachment = attachment;
        setInput("");
        setAttachment(null);
        setShowUpload(false);
        setIsTyping(true);

        try {
            let activeConversationId = conversationId;
            if (!activeConversationId) {
                activeConversationId = crypto.randomUUID();
                setConversationId(activeConversationId);
                const title = userMessage.text.substring(0, 30) + "...";

                await fetch('/api/chat/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ conversationId: activeConversationId, title })
                });

                setConversations(prev => [{ conversation_id: activeConversationId!, title }, ...prev]);
            }

            let attachmentId = null;
            if (currentAttachment) {
                const formData = new FormData();
                formData.append('file', currentAttachment.file);
                formData.append('conversationId', activeConversationId);

                try {
                    const uploadRes = await fetch('/api/chat/upload', {
                        method: 'POST',
                        body: formData
                    });
                    const uploadData = await uploadRes.json();
                    if (uploadData.attachmentId) {
                        attachmentId = uploadData.attachmentId;

                        setMessages(prev => prev.map(m =>
                            m.id === userMessage.id ? { ...m, attachmentId: uploadData.attachmentId } : m
                        ));
                    }
                } catch (e) {
                    console.error("Upload failed", e);
                }
            }

            let activeTransactions = allTransactions;
            let reqDays = null;

            try {
                const daysRes = await fetch('/api/chat/extract_days', {
                    method: 'POST',
                    body: JSON.stringify({ message: userMessage.text })
                });
                const daysJson = await daysRes.json();
                reqDays = daysJson.days;

                if (reqDays && reqDays > 0) {
                    try {
                        setMessages(prev => [...prev, {
                            id: Date.now().toString() + '-loading',
                            role: 'assistant',
                            content: "Fetching transactions for requested period...",
                            text: "Fetching transactions for requested period...",
                            type: 'text',
                            timestamp: Date.now()
                        }]);

                        const txRes = await fetch(`/api/plaid/transactions?days=${reqDays}`);
                        const txData = await txRes.json();
                        if (txData.transactions) {
                            setAllTransactions(txData.transactions);
                            activeTransactions = txData.transactions;
                            setCurrentDays(reqDays);
                        }

                        setMessages(prev => prev.filter(m => !m.id.includes('-loading')));
                    } catch (e) {
                        console.error("Failed to fetch history", e);
                        const cutoff = new Date();
                        cutoff.setDate(cutoff.getDate() - reqDays);
                        activeTransactions = allTransactions.filter(t => new Date(t.date) >= cutoff);
                    }
                }
            } catch (e) {
                console.warn("Date extraction failed", e);
            }

            const context = currentAttachment ? {} : {
                transactions: activeTransactions.slice(0, 50),
                accounts,
                investments
            };

            let historyStart = 0;
            while (historyStart < newMessages.length && newMessages[historyStart].role !== 'user') {
                historyStart++;
            }
            const history = newMessages.slice(historyStart).map(m => ({
                role: m.role,
                content: m.text
            }));

            let latestMessageContent: any = input;

            if (currentAttachment) {
                const isPdf = currentAttachment.file.type === "application/pdf";
                const isCsv = currentAttachment.file.type.includes("csv") || currentAttachment.file.name.endsWith(".csv");

                if (isPdf) {
                    latestMessageContent = [
                        { type: "text", text: input || "Analyze this document." },
                        {
                            type: "document",
                            source: {
                                type: "base64",
                                media_type: "application/pdf",
                                data: currentAttachment.base64
                            }
                        }
                    ];
                } else if (isCsv) {
                    try {
                        const decodedText = atob(currentAttachment.base64);
                        latestMessageContent = [
                            { type: "text", text: input + "\n\nCSV Data:\n" + decodedText }
                        ];
                    } catch (e) {
                        latestMessageContent = input + " [Error reading CSV]";
                    }
                }
            } else {
                latestMessageContent = input;
            }

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: history,
                    latestMessageOverride: currentAttachment ? latestMessageContent : undefined,
                    context
                })
            });

            const data = await res.json();

            const chartMatch = data.reply.match(/<chart>([\s\S]*?)<\/chart>/);
            let chartConfig = null;
            let cleanReply = data.reply;

            if (chartMatch) {
                try {
                    chartConfig = JSON.parse(chartMatch[1]);
                    cleanReply = data.reply.replace(/<chart>[\s\S]*?<\/chart>/, '').trim();
                } catch (e) {
                    console.error("Failed to parse chart JSON", e);
                }
            }

            const botMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                type: chartConfig ? 'chart' : 'text',
                text: cleanReply,
                content: cleanReply,
                chartConfig: chartConfig,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                type: 'text',
                text: "Error connecting to Argo AI.",
                content: "Error connecting to Argo AI. Please try again."
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const renderMessage = (msg: Message) => {
        if (msg.role === 'assistant') {
            return (
                <div className="w-full">
                    <div className="prose prose-invert prose-sm max-w-none
                        prose-p:my-2 prose-p:leading-relaxed
                        prose-headings:font-semibold prose-headings:text-white
                        prose-strong:text-primary prose-strong:font-bold
                        prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4
                        prose-li:my-1
                        prose-code:text-primary prose-code:bg-zinc-800 prose-code:px-1 prose-code:rounded">
                        <ReactMarkdown>
                            {msg.text}
                        </ReactMarkdown>
                    </div>
                    {msg.chartConfig && <SpendingChart config={msg.chartConfig} />}
                </div>
            );
        }
        return msg.content;
    };

    return (
        <div className="flex h-[600px] w-full bg-zinc-900/30 border border-white/10 rounded-2xl overflow-hidden relative">
            {/* Upload Overlay */}
            {showUpload && (
                <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
                    <div className="w-full max-w-xl relative">
                        <button
                            onClick={() => setShowUpload(false)}
                            className="absolute -top-12 right-0 text-zinc-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <FileDropzone onFileSelect={async (file) => {
                            const base64 = await fileToBase64(file);
                            setAttachment({ file, base64 });
                            setShowUpload(false);
                        }} />
                    </div>
                </div>
            )}

            {/* Sidebar */}
            {showSidebar && (
                <div className="w-64 border-r border-white/10 bg-zinc-900/50 flex flex-col">
                    <div className="p-4 border-b border-white/10">
                        <button
                            onClick={startNewChat}
                            className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                            <span>+</span> New Chat
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {conversations.map(c => (
                            <button
                                key={c.conversation_id}
                                onClick={() => loadConversation(c.conversation_id)}
                                className={`w-full text-left p-3 rounded-lg text-sm truncate transition-colors ${c.conversation_id === conversationId ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                                    }`}
                            >
                                {c.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-zinc-900/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden text-zinc-400">
                            {/* Simple Hamburger */}
                            <div className="space-y-1">
                                <div className="w-4 h-0.5 bg-current"></div>
                                <div className="w-4 h-0.5 bg-current"></div>
                                <div className="w-4 h-0.5 bg-current"></div>
                            </div>
                        </button>
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Argo AI Assistant</h3>
                            <p className="text-xs text-zinc-400">Financial Analyst</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-primary/10 text-primary'}`}>
                                {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                                ? 'bg-primary text-black rounded-tr-sm'
                                : 'bg-zinc-800 text-zinc-100 rounded-tl-sm'
                                }`}>
                                {renderMessage(msg)}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Bot size={16} />
                            </div>
                            <div className="bg-zinc-800 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-zinc-900/50 border-t border-white/10">
                    {attachment && (
                        <div className="mb-2 flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-lg w-fit text-sm">
                            <Paperclip size={14} />
                            <span className="truncate max-w-[200px]">{attachment.file.name}</span>
                            <button onClick={() => setAttachment(null)} className="hover:text-red-400 ml-1"><X size={14} /></button>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowUpload(!showUpload)}
                            className={`p-3 rounded-xl transition-colors ${attachment ? 'bg-primary/20 text-primary' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                            title="Attach File"
                        >
                            <Paperclip size={20} />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={attachment ? "Ask about this file..." : "Ask about your spending..."}
                            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-zinc-600"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() && !attachment}
                            className="bg-primary text-black p-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
