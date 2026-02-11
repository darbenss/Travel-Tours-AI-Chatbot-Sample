"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { ChatWindow } from "@/components/chat/chat-window";

export function FloatingActionButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Chat Window - Always rendered for session persistence */}
            <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />

            {/* FAB Button */}
            <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4 group">
                {/* Label tooltip — hidden when chat is open */}
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2, duration: 0.5 }}
                        className="bg-white text-gray-900 px-4 py-2 rounded-full shadow-lg text-sm font-medium border border-[#D4AF37]/20 hidden md:block"
                    >
                        Chat with us ✨
                    </motion.div>
                )}

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    animate={
                        !isOpen
                            ? {
                                boxShadow: [
                                    "0 0 0 0 rgba(212, 175, 55, 0.7)",
                                    "0 0 0 20px rgba(212, 175, 55, 0)",
                                ],
                            }
                            : {}
                    }
                    transition={{
                        boxShadow: {
                            repeat: Infinity,
                            duration: 2,
                        },
                    }}
                    className="bg-[#D4AF37] text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-[#b8962e] transition-colors"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <X className="h-6 w-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="chat"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <MessageCircle className="h-6 w-6 fill-current" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </>
    );
}
