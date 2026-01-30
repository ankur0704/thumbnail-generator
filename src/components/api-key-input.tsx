import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { IconKey, IconCheck, IconTrash } from "@tabler/icons-react";

export const ApiKeyInput = () => {
    const [apiKey, setApiKey] = useState("");
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const savedKey = localStorage.getItem("google_gemini_api_key");
        if (savedKey) {
            setApiKey(savedKey);
            setIsSaved(true);
        }
    }, []);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem("google_gemini_api_key", apiKey.trim());
            setIsSaved(true);
        }
    };

    const handleClear = () => {
        localStorage.removeItem("google_gemini_api_key");
        setApiKey("");
        setIsSaved(false);
    };

    return (
        <div className="fixed top-6 right-6 z-100 flex items-center gap-2 bg-white dark:bg-neutral-900 p-2 rounded-full shadow-lg ring-1 ring-black/5 border border-neutral-200 dark:border-neutral-800 transition-all duration-300">
            <div className="flex items-center gap-2 px-3 py-1.5">
                <IconKey className="w-4 h-4 text-neutral-500" />
                <input
                    type="password"
                    placeholder="Enter Gemini API Key"
                    value={isSaved ? "••••••••••••••••" : apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isSaved}
                    className="bg-transparent border-none focus:ring-0 text-sm w-40 text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400"
                />
            </div>
            {isSaved ? (
                <button
                    onClick={handleClear}
                    className="p-1.5 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                    title="Clear API Key"
                >
                    <IconTrash className="w-4 h-4" />
                </button>
            ) : (
                <button
                    onClick={handleSave}
                    disabled={!apiKey.trim()}
                    className="p-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-50 transition-all"
                    title="Save API Key"
                >
                    <IconCheck className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
