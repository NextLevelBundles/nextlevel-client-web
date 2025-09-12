"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SparklesIcon, HistoryIcon } from "lucide-react";
import { Dialog } from "@/shared/components/ui/dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { ExchangeApi } from "@/lib/api/clients/exchange";
import { apiClient } from "@/lib/api/client-api";

import type { ExchangeableSteamKeyDto } from "@/lib/api/types/exchange";
import type { SteamKeyAssignment } from "@/lib/api/types/steam-key";

export default function ExchangePage() {
  // Credits balance from API
  const [credits, setCredits] = useState<number>(0);
  const [exchangeableKeys, setExchangeableKeys] = useState<ExchangeableSteamKeyDto[]>([]);
  const [inventoryKeys, setInventoryKeys] = useState<SteamKeyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exchangingId, setExchangingId] = useState<string | null>(null);
  const [exchangeResult, setExchangeResult] = useState<Record<string, string>>({});

  // Add to Exchange dialog state
  const [addToExchangeDialog, setAddToExchangeDialog] = useState<{
    isOpen: boolean;
    keyId: string | null;
    isLoading: boolean;
    result: string;
  }>({ isOpen: false, keyId: null, isLoading: false, result: "" });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const api = new ExchangeApi(apiClient);
        // Fetch credits
        const creditsRes = await api.getCustomerCredits();
        setCredits(creditsRes.netCredits ?? 0);
        // Fetch exchangeable keys
        const keys = await api.getExchangeableSteamKeys();
        setExchangeableKeys(keys);
        // Fetch inventory keys
        const invKeys = await api.getToBeExchangeableSteamKeys();
        setInventoryKeys(invKeys);
      } catch {
        setError("Failed to load exchangeable keys or inventory.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleExchange = async (keyId: string) => {
    setExchangingId(keyId);
    setExchangeResult((prev) => ({ ...prev, [keyId]: "" }));
    try {
      const api = new ExchangeApi(apiClient);
      const result = await api.exchangeCreditsForSteamKey(keyId);
      if (result.success === true || typeof result.credits === "number") {
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

  // Add to Exchange handler
  const handleAddToExchange = (keyId: string) => {
    setAddToExchangeDialog({ isOpen: true, keyId, isLoading: false, result: "" });
  };

  const handleAddToExchangeConfirm = async () => {
    if (!addToExchangeDialog.keyId) return;
    setAddToExchangeDialog((prev) => ({ ...prev, isLoading: true, result: "" }));
    try {
      const api = new ExchangeApi(apiClient);
      // The API expects { SteamKeyAssignmentId }
      const result = await api.exchangeSteamKeyForCredits(addToExchangeDialog.keyId);
      if (result.success === true || typeof result.credits === "number") {
        setAddToExchangeDialog((prev) => ({ ...prev, isLoading: false, result: `Added to exchange for ${result.credits} credits!` }));
        setInventoryKeys((prev) => prev.filter((k) => k.id !== addToExchangeDialog.keyId));
      } else {
        setAddToExchangeDialog((prev) => ({ ...prev, isLoading: false, result: "Add to exchange failed." }));
      }
    } catch (err: any) {
      let msg = "Add to exchange failed.";
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }
      setAddToExchangeDialog((prev) => ({ ...prev, isLoading: false, result: msg }));
    }
  };

  return (
  <main className="max-w-[1600px] mx-auto py-8 px-6 md:px-12 lg:px-20 xl:px-32">
      {/* Credits Balance and Exchange History */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-primary">Credits:</span>
          <span className="text-2xl font-bold text-green-600">{credits}</span>
        </div>
        <a
          href="/customer/exchange-history"
          className="flex items-center gap-2 text-blue-700 hover:underline text-sm font-medium pointer-events-auto"
          style={{ zIndex: 30, position: 'relative' }}
        >
          <HistoryIcon className="h-4 w-4" />
          View Exchange History
        </a>
      </div>
      {/* Benefit Banner */}
      <div className="flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg py-3 px-4 mb-6 gap-2">
        <SparklesIcon className="h-5 w-5 text-primary" />
        <span className="text-sm text-gray-700 font-medium">Exchange unused games for credits and unlock premium titles & bundles!</span>
      </div>
      <h1 className="text-4xl font-bold text-center mb-2">Digiphile Exchange</h1>
      <p className="text-center text-gray-500 mb-10">
        Trade games from your inventory for credits that can be used to acquire premium games & bundles.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inventory Section */}
        <section className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-2">Your inventory</h2>
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[180px]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-2" />
              <span className="text-sm text-muted-foreground">Loading inventory...</span>
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : inventoryKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[180px] gap-3 relative" style={{ zIndex: 20 }}>
              <img src="/images/hero-background.jpg" alt="No games" className="w-24 h-24 opacity-40 mb-2" />
              <span className="font-medium text-gray-500">No games in inventory.</span>
              <Link href="/bundles" passHref legacyBehavior>
                <a className="mt-2 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 pointer-events-auto" style={{ zIndex: 30, position: 'relative' }}>Browse Bundles</a>
              </Link>
            </div>
          ) : (
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {inventoryKeys.map((key) => (
                <div key={key.id} className="flex flex-col items-center border rounded-lg p-3 min-w-[140px] bg-gradient-to-br from-blue-50 to-white shadow hover:shadow-lg transition group relative">
                  <img
                    src={key.steamGameMetadata?.screenshotUrlsJson ? JSON.parse(key.steamGameMetadata.screenshotUrlsJson)[0] : "/images/hero-background.jpg"}
                    alt={key.productTitle}
                    className="w-24 h-32 object-cover rounded mb-2 group-hover:scale-105 transition"
                  />
                  <div className="font-semibold text-center text-sm mb-1">{key.productTitle}</div>
                  <div className="text-xs text-gray-500 text-center mb-1">{key.packageName}</div>
                  <div className="text-xs text-gray-500 text-center mb-1">{key.publisherName}</div>
                  <div className="text-xs text-green-700 text-center mb-1 font-medium">
                    You will get: <span className="font-bold">{key.creditsRequired}</span> credits
                  </div>
                  <button
                    className="mt-2 bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800 transition text-xs disabled:opacity-60 shadow pointer-events-auto"
                    onClick={() => handleAddToExchange(key.id)}
                  >
                    Send to Exchange
                  </button>
                </div>
              ))}
              {/* Add to Exchange Confirmation Dialog */}
              <Dialog open={addToExchangeDialog.isOpen} onOpenChange={(open) => setAddToExchangeDialog((prev) => ({ ...prev, isOpen: open }))}>
                <DialogContent className="z-[100]">
                  <DialogHeader>
                    <DialogTitle>Send Game to Exchange?</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to send this Steam key to the exchange? You will receive credits and this action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  {addToExchangeDialog.result ? (
                    <div className="text-green-600 text-center py-2 font-semibold">{addToExchangeDialog.result}</div>
                  ) : (
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddToExchangeDialog({ isOpen: false, keyId: null, isLoading: false, result: "" })} disabled={addToExchangeDialog.isLoading}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddToExchangeConfirm} disabled={addToExchangeDialog.isLoading}>
                        {addToExchangeDialog.isLoading ? "Sending..." : "Confirm"}
                      </Button>
                    </DialogFooter>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}
        </section>
        {/* Exchange Section */}
        <section className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-2">Use Credits for digiphile Exchange</h2>
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[180px]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-2" />
              <span className="text-sm text-muted-foreground">Loading exchangeable games...</span>
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : exchangeableKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[180px] gap-3">
              <img src="/images/hero-background.jpg" alt="No games" className="w-24 h-24 opacity-40 mb-2" />
              <span className="font-medium text-gray-500">No exchangeable games available.</span>
            </div>
          ) : (
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {exchangeableKeys.map((key) => (
                <div key={key.id} className="flex flex-col items-center border rounded-lg p-3 min-w-[140px] bg-gradient-to-br from-purple-50 to-white shadow hover:shadow-lg transition group relative">
                  <img
                    src={key.steamGameMetadata?.screenshotUrlsJson ? JSON.parse(key.steamGameMetadata.screenshotUrlsJson)[0] : "/images/hero-background.jpg"}
                    alt={key.productTitle}
                    className="w-24 h-32 object-cover rounded mb-2 group-hover:scale-105 transition"
                  />
                  <div className="font-semibold text-center text-sm mb-1">{key.productTitle}</div>
                  <div className="text-xs text-gray-500 text-center mb-1">{key.packageName}</div>
                  <div className="text-xs text-gray-500 text-center mb-1">{key.publisherName}</div>
                  <div className="text-xs text-gray-700 text-center mb-1">
                    Cost: <span className="text-red-600 font-bold">{key.creditsRequired} Credits</span>
                  </div>
                  <button
                    style={{ position: "relative", zIndex: 9999 }}
                    className="mt-2 bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800 transition text-xs disabled:opacity-60 shadow"
                    onClick={() => handleExchange(key.id)}
                  >
                    {exchangingId === key.id ? "Exchanging..." : "Exchange"}
                  </button>
                  {exchangeResult[key.id] && (
                    <div className="text-xs text-green-600 mt-1 font-semibold">{exchangeResult[key.id]}</div>
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
