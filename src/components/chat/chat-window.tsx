"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send, X, Bot, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUICK_ACTIONS = [
    { label: "🌟 Paket Populer", message: "Tampilkan paket tour populer kami" },
    { label: "🏖️ Liburan Pantai", message: "Saya cari destinasi pantai yang indah" },
    { label: "❄️ Musim Dingin Eropa", message: "Saya ingin trip musim dingin ke Eropa" },
];

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
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
    const [input, setInput] = useState("");
    const [historyLoaded, setHistoryLoaded] = useState(false);

    const { messages, sendMessage, status, setMessages } = useChat({
        // Default API endpoint is /api/chat
    });

    const isLoading = status === "streaming" || status === "submitted";
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load conversation history on mount
    useEffect(() => {
        if (!historyLoaded) {
            fetch("/api/chat/history")
                .then((res) => res.json())
                .then((history) => {
                    if (history && history.length > 0) {
                        setMessages(history);
                    }
                    setHistoryLoaded(true);
                })
                .catch((err) => {
                    console.error("Failed to load history:", err);
                    setHistoryLoaded(true);
                });
        }
    }, [historyLoaded, setMessages]);

    // Auto-scroll logic
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, status, isOpen]);

    useEffect(() => {
        if (!isLoading && isOpen) {
            // Focus only when open + idle
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isLoading, isOpen]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            sendMessage({ text: input });
            setInput("");
        }
    };

    // Custom Message Renderer to handle [CARDS] split
    const renderMessageContent = (message: any) => {
        // Log for debugging
        if (message.role === 'assistant') {
            const partTypes = message.parts?.map((p: any) => p.type).join(', ');
            console.log(`[ChatWindow] Message ${message.id} parts: [${partTypes}]`);
        }

        // Combine ALL text parts into one string (fixing previous bug where only first part was used)
        const rawContent = message.parts
            ?.filter((p: any) => p.type === 'text')
            .map((p: any) => p.text)
            .join('') || (message.content || "");

        // Find the tool invocation (cards)
        const toolPart = message.parts?.find((p: any) => p.type === 'tool-invocation');

        const hasCardsMarker = rawContent.includes("[CARDS]");
        const toolInvocation = toolPart?.toolInvocation || toolPart;
        const hasToolResult = toolInvocation && toolInvocation.state === 'result';

        // Helper to render a text bubble
        const TextBubble = ({ text }: { text: string }) => (
            <div className={`px-4 py-3 text-sm leading-relaxed rounded-2xl ${message.role === "user"
                ? "bg-[#D4AF37] text-white rounded-br-none"
                : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none"
                }`}>
                <div dangerouslySetInnerHTML={{ __html: formatMessage(text) }} />
            </div>
        );

        // Helper to render Tool Cards
        const ToolCards = () => {
            // Handle loading state
            if (toolInvocation && toolInvocation.state !== 'result') {
                return (
                    <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 bg-gray-50 rounded-lg animate-pulse">
                        <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" />
                        Sedang mencarikan paket liburan terbaik...
                    </div>
                );
            }

            if (!hasToolResult) return null;
            const toolName = toolInvocation.toolName;
            const result = safeParse(toolInvocation.result);

            if ((toolName === 'searchTours' || toolName === 'getPopularTours') && Array.isArray(result)) {
                return (
                    <div className="w-full flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory px-1 -mx-1 scrollbar-thin scrollbar-thumb-gray-200 mt-2 mb-2">
                        {result.map((tour: any) => (
                            <div key={tour.id} className="min-w-[240px] w-[240px] bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden snap-center flex-shrink-0">
                                <div className="h-32 bg-gray-200 relative">
                                    {tour.imageUrl ? (
                                        <img src={tour.imageUrl} alt={tour.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-[#002147]">
                                        {tour.duration}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h5 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">{tour.title}</h5>
                                    <div className="flex items-center text-gray-500 text-xs mb-2">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span className="truncate">{tour.destination}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="text-[#D4AF37] font-bold text-sm">
                                            IDR {(tour.price / 1000000).toFixed(1)}M
                                        </div>
                                        <button
                                            onClick={() => sendMessage({ text: `Saya tertarik dengan ${tour.title}` })}
                                            className="text-xs bg-gray-900 text-white px-2 py-1 rounded hover:bg-[#D4AF37] transition-colors"
                                        >
                                            Detail
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }
            return null;
        };

        // SANDWICH LOGIC - Always split if marker is present
        if (hasCardsMarker) {
            const [intro, desc] = rawContent.split("[CARDS]");
            return (
                <div className="flex flex-col gap-2 w-full">
                    {intro.trim() && <TextBubble text={intro.trim()} />}
                    <ToolCards />
                    {desc.trim() && <TextBubble text={desc.trim()} />}
                </div>
            );
        }

        // STANDARD LOGIC (Text -> Cards)
        return (
            <div className="flex flex-col gap-2 w-full">
                {rawContent && <TextBubble text={rawContent} />}
                <ToolCards />
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
                                onClick={() => sendMessage({ text: action.message })}
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

function formatMessage(text: string) {
    if (!text) return "";
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br />");
}
