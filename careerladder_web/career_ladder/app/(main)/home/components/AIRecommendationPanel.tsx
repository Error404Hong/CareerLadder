"use client"

import { useState } from "react"
import { Sparkles, SendHorizonal, Bot } from "lucide-react"

const SUGGESTIONS = [
    "Find jobs matching my skills",
    "Suggest projects for a CS student",
    "What companies are hiring remotely?",
]

export function AIRecommendationPanel() {
    const [input, setInput] = useState("")

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 flex items-center gap-2.5 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
                    <Sparkles size={13} className="text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-none">AI Recommendations</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Powered by CareerLadder AI</p>
                </div>
                <span className="ml-auto text-xs font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                    Beta
                </span>
            </div>

            <div className="p-5 flex flex-col gap-4">
                {/* Bot bubble */}
                <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot size={12} className="text-indigo-500" />
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl rounded-tl-none px-3 py-2.5 border border-slate-100">
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Hi! I can help you find the best opportunities based on your profile and preferences. What are you looking for?
                        </p>
                    </div>
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide px-0.5">Try asking</p>
                    {SUGGESTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setInput(s)}
                            className="text-left text-xs text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-lg px-3 py-2 transition-all duration-150"
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-300 focus-within:bg-white transition-all duration-150">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1 text-xs bg-transparent text-slate-700 placeholder-slate-400 outline-none"
                        onKeyDown={(e) => { if (e.key === "Enter") setInput("") }}
                    />
                    <button
                        onClick={() => setInput("")}
                        className="w-6 h-6 rounded-lg bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center transition-colors shrink-0 disabled:opacity-40"
                        disabled={!input.trim()}
                    >
                        <SendHorizonal size={11} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    )
}
