"use client";

import { useState, useEffect } from "react";
import { connectClickBank, getClickBankCredentials } from "@/lib/api";

export default function ClickBankSettings() {
  const [nickname, setNickname] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(true);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Load saved credentials on component mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const creds = await getClickBankCredentials();
        if (creds.connected) {
          setNickname(creds.nickname);
          setApiKey(creds.api_key_full || ""); // Use full API key for form
          setConnected(true);
          setMessage("ClickBank account is connected");
        }
      } catch (error) {
        console.error("Failed to load ClickBank credentials:", error);
      } finally {
        setLoadingCredentials(false);
      }
    };

    loadCredentials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await connectClickBank(nickname, apiKey);
      setMessage(res.message || "ClickBank account connected successfully.");
      setConnected(true);
    } catch (err: any) {
      setMessage(err.message || "Failed to connect ClickBank account.");
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  if (loadingCredentials) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">🔗 Connect ClickBank</h2>
        {connected && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Connected
          </span>
        )}
      </div>
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
          className={`w-full text-white rounded-lg py-2 transition ${
            connected
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? "Saving..." : connected ? "Update Connection" : "Connect"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
}
