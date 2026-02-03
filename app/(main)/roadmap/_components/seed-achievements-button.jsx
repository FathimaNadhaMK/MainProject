"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SeedAchievementsButton() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSeed = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/seed-achievements", {
                method: "POST",
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ success: false, error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <h3 className="text-yellow-400 font-bold mb-2">⚠️ Seed Achievements</h3>
            <p className="text-xs text-gray-400 mb-3">
                Click this button to add all 43 achievements to the database
            </p>
            <Button
                onClick={handleSeed}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600"
            >
                {loading ? "Seeding..." : "Seed Achievements"}
            </Button>
            {result && (
                <div className={`mt-3 p-2 rounded text-xs ${result.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {result.success ? `✅ ${result.message}` : `❌ Error: ${result.error}`}
                </div>
            )}
        </div>
    );
}
