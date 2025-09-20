"use client";

import { useState } from "react";
import { connectClickBank } from "@/lib/api";

export default function ClickBankSettings() {
  const [nickname, setNickname] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await connectClickBank(nickname, apiKey);
      setMessage(res.message || "ClickBank account connected successfully.");
    } catch (err: any) {
      setMessage(err.message || "Failed to connect ClickBank account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">🔗 Connect ClickBank</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nickname</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Enter your ClickBank nickname"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Enter your API key"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition"
        >
          {loading ? "Connecting..." : "Connect"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
}
