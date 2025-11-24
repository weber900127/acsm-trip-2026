import React, { useState } from 'react';
import { User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginModalProps {
    isOpen: boolean;
    onLogin: (name: string) => void;
    initialName?: string;
}

export default function LoginModal({ isOpen, onLogin, initialName = '' }: LoginModalProps) {
    const [name, setName] = useState(initialName);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onLogin(name.trim());
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                                <User size={32} />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-2">歡迎使用旅程規劃</h2>
                            <p className="text-gray-500 mb-6">請輸入您的暱稱，以便在協作時識別身分</p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="您的暱稱 (例如: Weber)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg text-center"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    開始使用
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
