"use client";

import React, { useEffect, useState } from "react";
import { ExchangeApi } from "@/lib/api/clients/exchange";
import { apiClient } from "@/lib/api/client-api";
import type { ExchangeableSteamKeyDto } from "@/lib/api/types/exchange";

export default function ExchangePage() {
  const [exchangeableKeys, setExchangeableKeys] = useState<ExchangeableSteamKeyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exchangingId, setExchangingId] = useState<string | null>(null);
  const [exchangeResult, setExchangeResult] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchKeys = async () => {
      setLoading(true);
      setError(null);
      try {
        const api = new ExchangeApi(apiClient);
        const keys = await api.getExchangeableSteamKeys();
        setExchangeableKeys(keys);
      } catch {
        setError("Failed to load exchangeable keys.");
      } finally {
        setLoading(false);
      }
    };
    fetchKeys();
  }, []);

  const handleExchange = async (keyId: string) => {
    setExchangingId(keyId);
    setExchangeResult((prev) => ({ ...prev, [keyId]: "" }));
    try {
      const api = new ExchangeApi(apiClient);
      const result = await api.exchangeCreditsForSteamKey(keyId);
      if (result.success) {
        setExchangeResult((prev) => ({ ...prev, [keyId]: `Exchanged for ${result.credits} credits!` }));
        setExchangeableKeys((prev) => prev.filter((k) => k.id !== keyId));
      } else {
        setExchangeResult((prev) => ({ ...prev, [keyId]: "Exchange failed." }));
      }
    } catch {
      setExchangeResult((prev) => ({ ...prev, [keyId]: "Exchange failed." }));
    } finally {
      setExchangingId(null);
    }
  };

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-2">Digiphile Exchange</h1>
      <p className="text-center text-gray-500 mb-10">
        Trade games from your inventory for credits that can be used to acquire premium games & bundles.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inventory Section */}
        <section className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-2">Your inventory</h2>
          <p className="mb-2">3 Games</p>
          <div className="flex gap-2 mb-4">
            {/* Game covers - replace with dynamic images */}
            <img src="/images/hero-background.jpg" alt="Game 1" className="w-20 h-28 object-cover rounded" />
            <img src="/images/hero-background.jpg" alt="Game 2" className="w-20 h-28 object-cover rounded" />
            <img src="/images/hero-background.jpg" alt="Game 3" className="w-20 h-28 object-cover rounded" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-900 text-white px-3 py-1 rounded-full text-xs font-semibold">WCreds.</span>
            <span className="font-bold text-lg">100</span>
          </div>
          <p className="text-sm mb-1">
            <span className="font-semibold text-red-600">*</span> Select inventory items only to convert to credits
          </p>
          <div className="bg-gray-800 text-green-400 px-4 py-2 rounded mb-2 font-semibold text-center">
            -190 Credits Convertible
          </div>
          <p className="text-xs text-gray-400">Working Time 3 Weeks max</p>
        </section>
        {/* Exchange Section */}
        <section className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-2">Use Credits for digiphile Exchange</h2>
          {loading ? (
            <div>Loading exchangeable games...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : exchangeableKeys.length === 0 ? (
            <div>No exchangeable games available.</div>
          ) : (
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {exchangeableKeys.map((key) => (
                <div key={key.id} className="flex flex-col items-center border rounded p-2 min-w-[120px]">
                  <img
                    src={key.steamGameMetadata?.screenshotUrlsJson ? JSON.parse(key.steamGameMetadata.screenshotUrlsJson)[0] : "/images/hero-background.jpg"}
                    alt={key.productTitle}
                    className="w-24 h-32 object-cover rounded mb-2"
                  />
                  <div className="font-semibold text-center text-sm mb-1">{key.productTitle}</div>
                  <div className="text-xs text-gray-500 text-center mb-1">{key.packageName}</div>
                  <div className="text-xs text-gray-500 text-center mb-1">{key.publisherName}</div>
                  <div className="text-xs text-gray-700 text-center mb-1">
                    Cost:{" "}
                    <span className="text-red-600 font-bold">{key.creditsRequired} Credits</span>
                  </div>
                  <button
                    style={{ position: "relative", zIndex: 9999 }}
                    className="mt-2 bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800 transition text-xs disabled:opacity-60"
                    onClick={() => {
                      console.log('Clicked Exchange for', key.id);
                      handleExchange(key.id);
                    }}
                  >
                    {exchangingId === key.id ? "Exchanging..." : "Exchange"}
                  </button>
                  {exchangeResult[key.id] && (
                    <div className="text-xs text-green-600 mt-1">{exchangeResult[key.id]}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
