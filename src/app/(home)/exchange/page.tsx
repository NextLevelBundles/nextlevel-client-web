"use client";

import React, { useEffect, useState } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { ExchangeApi } from "@/lib/api/clients/exchange";
import { apiClient } from "@/lib/api/client-api";
import { SteamKeyApi } from "@/lib/api/clients/steam-key";
import type { ExchangeableSteamKeyDto } from "@/lib/api/types/exchange";
import type { SteamKeyAssignment } from "@/lib/api/types/steam-key";

export default function ExchangePage() {
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
    const fetchKeys = async () => {
      setLoading(true);
      setError(null);
      try {
        const api = new ExchangeApi(apiClient);
        const keys = await api.getExchangeableSteamKeys();
        setExchangeableKeys(keys);
        // Fetch inventory keys
        const steamKeyApi = new SteamKeyApi(apiClient);
        const invKeys = await steamKeyApi.getSteamKeys();
        setInventoryKeys(invKeys);
      } catch {
        setError("Failed to load exchangeable keys or inventory.");
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
      if (result.success) {
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
    <main className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-2">Digiphile Exchange</h1>
      <p className="text-center text-gray-500 mb-10">
        Trade games from your inventory for credits that can be used to acquire premium games & bundles.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inventory Section */}
        <section className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-2">Your inventory</h2>
          {loading ? (
            <div>Loading inventory...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : inventoryKeys.length === 0 ? (
            <div>No games in inventory.</div>
          ) : (
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {inventoryKeys.map((key) => (
                <div key={key.id} className="flex flex-col items-center border rounded p-2 min-w-[120px]">
                  <img
                    src={key.steamGameMetadata?.screenshotUrlsJson ? JSON.parse(key.steamGameMetadata.screenshotUrlsJson)[0] : "/images/hero-background.jpg"}
                    alt={key.productTitle}
                    className="w-24 h-32 object-cover rounded mb-2"
                  />
                  <div className="font-semibold text-center text-sm mb-1">{key.productTitle}</div>
                  <div className="text-xs text-gray-500 text-center mb-1">{key.productId}</div>
                  <div className="text-xs text-gray-500 text-center mb-1">{key.status}</div>
                  <button
                    style={{ position: "relative", zIndex: 9999 }}
                    className="mt-2 bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800 transition text-xs disabled:opacity-60"
                    onClick={() => handleAddToExchange(key.id)}
                  >
                    Add to exchange
                  </button>
                </div>
              ))}
              {/* Add to Exchange Confirmation Dialog */}
              <Dialog open={addToExchangeDialog.isOpen} onOpenChange={(open) => setAddToExchangeDialog((prev) => ({ ...prev, isOpen: open }))}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Key to Exchange?</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to add this Steam key to the exchange for <b>10 points</b>? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  {addToExchangeDialog.result ? (
                    <div className="text-green-600 text-center py-2">{addToExchangeDialog.result}</div>
                  ) : (
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddToExchangeDialog({ isOpen: false, keyId: null, isLoading: false, result: "" })} disabled={addToExchangeDialog.isLoading}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddToExchangeConfirm} disabled={addToExchangeDialog.isLoading}>
                        {addToExchangeDialog.isLoading ? "Adding..." : "Continue"}
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
