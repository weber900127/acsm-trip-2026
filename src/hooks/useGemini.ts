import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DayPlan } from '../data/itinerary';

interface Message {
    role: 'user' | 'model';
    text: string;
}

export function useGemini() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = async (apiKey: string, prompt: string, itineraryContext: DayPlan[]) => {
        if (!apiKey) {
            setError('請輸入 API Key');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Add user message immediately
            const newUserMsg: Message = { role: 'user', text: prompt };
            setMessages(prev => [...prev, newUserMsg]);

            const genAI = new GoogleGenerativeAI(apiKey);
            const modelName = "gemini-pro";
            console.log("Using Gemini Model:", modelName);
            const model = genAI.getGenerativeModel({ model: modelName });

            // Construct system prompt with itinerary context
            const systemPrompt = `
You are a helpful travel assistant for the 'ACSM Trip 2026'.
Here is the current itinerary data in JSON format:
${JSON.stringify(itineraryContext, null, 2)}

Please answer the user's questions based on this itinerary.
- Be concise and friendly.
- If the user asks about time, location, or details, refer to the JSON data.
- If the answer is not in the data, offer general travel advice for San Francisco, Salt Lake City, or San Diego.
- Reply in Traditional Chinese (繁體中文).
            `;

            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "了解，我是您的旅遊助手。請隨時問我關於行程的問題！" }],
                    },
                    // Convert previous messages to Gemini format
                    ...messages.map(m => ({
                        role: m.role,
                        parts: [{ text: m.text }]
                    }))
                ],
            });

            const result = await chat.sendMessage(prompt);
            const response = result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: 'model', text }]);
        } catch (err: any) {
            console.error("Gemini API Error:", err);
            setError(err.message || '發生錯誤，請檢查 API Key 或網路連線');
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = () => {
        setMessages([]);
        setError(null);
    };

    return {
        messages,
        loading,
        error,
        sendMessage,
        clearHistory
    };
}
