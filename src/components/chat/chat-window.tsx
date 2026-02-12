"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send, X, Bot, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';

const QUICK_ACTIONS = [
    { label: "🌟 Paket Populer", message: "Tampilkan paket tour populer kami" },
    { label: "🏖️ Liburan Pantai", message: "Saya cari destinasi pantai yang indah" },
    { label: "❄️ Musim Dingin Eropa", message: "Saya ingin trip musim dingin ke Eropa" },
];

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    parts?: any[];
}

// Helper to safely parse JSON tool results
const safeParse = (str: string) => {
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
};

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => Math.random().toString(36).substring(7)); // Simple session ID

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    useEffect(() => {
        if (!isLoading && isOpen) {
            // Focus only when open + idle
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isLoading, isOpen]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input
        };

        // Optimistic update
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    sessionId: sessionId // Send session ID for continuity
                })
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const data = await response.json();

            // data should be { id, role, content, ... }
            const assistantMsg: Message = {
                id: data.id || Date.now().toString(),
                role: "assistant",
                content: data.content
            };

            setMessages(prev => [...prev, assistantMsg]);

        } catch (error) {
            console.error("Chat error:", error);
            // Optional: Add error message to chat
        } finally {
            setIsLoading(false);
        }
    };

    // Quick action handler
    const handleQuickAction = (message: string) => {
        setInput(message);
        // Automatically submit logic
        submitMessage(message);
    };

    const submitMessage = async (text: string) => {
        if (isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    sessionId: sessionId
                })
            });

            if (!response.ok) throw new Error("Failed");
            const data = await response.json();

            const assistantMsg: Message = {
                id: data.id || Date.now().toString(),
                role: "assistant",
                content: data.content
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };


    // Custom Message Renderer (Simplified for manual fetch)
    const renderMessageContent = (message: Message) => {
        // We handle plain markdown text primarily now.
        // If Python returns [CARDS], we can still split.

        const rawContent = message.content;
        const hasCardsMarker = rawContent.includes("[CARDS]");

        // Helper to render a text bubble
        const TextBubble = ({ text }: { text: string }) => (
            <div className={`px-4 py-3 text-sm leading-relaxed rounded-2xl ${message.role === "user"
                ? "bg-[#D4AF37] text-white rounded-br-none"
                : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none prose prose-sm max-w-none text-gray-800"
                }`}>
                {message.role === "user" ? (
                    <div>{text}</div>
                ) : (
                    <ReactMarkdown
                        components={{
                            strong: ({ node, ...props }) => <span className="font-bold text-[#002147]" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-2 space-y-1" {...props} />,
                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-[#002147] mt-3 mb-2" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-base font-bold text-[#002147] mt-3 mb-2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-[#002147] mt-2 mb-1" {...props} />,
                        }}
                    >
                        {text}
                    </ReactMarkdown>
                )}
            </div>
        );

        // NOTE: ToolCards logic relied on 'tool-invocation' parts which we don't have yet from Python simple API.
        // We only have text content. So we skip ToolCards for now unless we implement parsing from text.
        // If Python returns [CARDS]...[CARDS], we could try to parse, but currently Python backend output is standard MD.

        return (
            <div className="flex flex-col gap-2 w-full">
                <TextBubble text={rawContent} />
            </div>
        );
    };


    return (
        <motion.div
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            variants={{
                open: { opacity: 1, scale: 1, y: 0, display: "flex" },
                closed: { opacity: 0, scale: 0.9, y: 20, transitionEnd: { display: "none" } }
            }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"
        >
            {/* Header */}
            <div className="bg-[#002147] px-5 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">UpRev Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-white/60 text-xs">Online</span>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white rounded-full h-8 w-8 hover:bg-white/10">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50/50">

                {/* 1. Static Initial Welcome Bubble (ALWAYS VISIBLE) */}
                <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-[#002147] flex items-center justify-center shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-[#D4AF37]" />
                    </div>
                    <div className="max-w-[85%] space-y-3">
                        <div className="px-4 py-3 text-sm leading-relaxed rounded-2xl bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none">
                            Halo! Mau liburan ke mana hari ini? ✈️🌍
                        </div>
                    </div>
                </div>

                {/* Quick Actions (Only show when empty) */}
                {messages.length === 0 && (
                    <div className="flex flex-wrap gap-2 justify-center px-4 py-2 mt-4">
                        {QUICK_ACTIONS.map((action) => (
                            <button
                                key={action.label}
                                onClick={() => handleQuickAction(action.message)}
                                className="text-xs px-3 py-2 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-colors"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Dynamic Messages */}
                {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        {message.role === "assistant" && (
                            <div className="w-8 h-8 rounded-full bg-[#002147] flex items-center justify-center shrink-0 mt-1">
                                <Bot className="h-4 w-4 text-[#D4AF37]" />
                            </div>
                        )}

                        <div className={`max-w-[85%] space-y-3 ${message.role === "user" ? "items-end flex flex-col" : ""}`}>
                            {renderMessageContent(message)}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-2 ml-11">
                        <div className="bg-white rounded-full px-3 py-2 shadow-sm border border-gray-100 flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tanya soal liburan..."
                    className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-sm border-transparent focus:bg-white focus:border-[#D4AF37] focus:ring-0 transition-all outline-none"
                    disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-full bg-[#D4AF37] hover:bg-[#b8962e] shrink-0">
                    <Send className="h-4 w-4 text-white" />
                </Button>
            </form>
        </motion.div>
    );
}
