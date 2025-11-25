import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Settings, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGemini } from '../../hooks/useGemini';
import { DayPlan } from '../../data/itinerary';

interface AIChatWidgetProps {
    itinerary: DayPlan[];
}

export default function AIChatWidget({ itinerary }: AIChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    const { messages, loading, error, sendMessage, clearHistory } = useGemini();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load API Key from local storage
    useEffect(() => {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) setApiKey(storedKey);
        else setShowSettings(true);
    }, []);

    // Save API Key
    const handleSaveKey = (key: string) => {
        setApiKey(key);
        localStorage.setItem('gemini_api_key', key);
        setShowSettings(false);
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(apiKey, input, itinerary);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] mb-4 flex flex-col overflow-hidden border border-gray-200"
                    >
                        {/* Header */}
                        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Sparkles size={18} />
                                <h3 className="font-bold">AI 旅遊助手</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-1.5 hover:bg-indigo-500 rounded-full transition-colors"
                                    title="設定 API Key"
                                >
                                    <Settings size={16} />
                                </button>
                                <button
                                    onClick={clearHistory}
                                    className="p-1.5 hover:bg-indigo-500 rounded-full transition-colors"
                                    title="清除對話"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-indigo-500 rounded-full transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Settings (API Key) */}
                        {showSettings ? (
                            <div className="flex-1 p-6 bg-gray-50 flex flex-col justify-center">
                                <h4 className="font-bold text-gray-800 mb-2">設定 Gemini API Key</h4>
                                <p className="text-xs text-gray-500 mb-4">
                                    請輸入您的 Google Gemini API Key 以啟用 AI 功能。
                                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline ml-1">
                                        取得 Key
                                    </a>
                                </p>
                                <input
                                    type="password"
                                    placeholder="Paste API Key here..."
                                    className="w-full px-3 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                />
                                <button
                                    onClick={() => handleSaveKey(apiKey)}
                                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700"
                                >
                                    儲存並開始
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Chat Area */}
                                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
                                    {messages.length === 0 && (
                                        <div className="text-center text-gray-400 mt-10 text-sm">
                                            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>嗨！我是您的 AI 助手。</p>
                                            <p>您可以問我關於行程的任何問題！</p>
                                        </div>
                                    )}

                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user'
                                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                                                    }`}
                                            >
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}

                                    {loading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="text-center text-xs text-red-500 bg-red-50 p-2 rounded-lg">
                                            {error}
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="輸入訊息..."
                                        className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        disabled={loading}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={loading || !input.trim()}
                                        className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </motion.button>
        </div>
    );
}
