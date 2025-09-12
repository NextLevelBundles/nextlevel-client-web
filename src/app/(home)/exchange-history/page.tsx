"use client";

import React, { useState, useEffect } from "react";
import { ExchangeHistoryApi } from "@/lib/api/clients/exchange-history";
import { apiClient } from "@/lib/api/client-api";
import type { ExchangeTransactionDto, ExchangeHistoryParams } from "@/lib/api/types/exchange-history";

export default function ExchangeHistoryPage() {
  const [transactions, setTransactions] = useState<ExchangeTransactionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = new ExchangeHistoryApi(apiClient);
      const params: ExchangeHistoryParams = {
        Page: page,
        PageSize: pageSize,
      };
      if (type) params.Type = Number(type);
      if (date) params.StartDate = date + "T00:00:00Z";
      // No direct search param in backend, but could be added if supported
      const res = await api.getExchangeHistory(params);
      setTransactions(res.transactions);
      setTotalPages(res.totalPages);
    } catch {
      setError("Failed to load exchange history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, date, page]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Exchange History</h1>

      {/* Filters Card */}
      <div className="bg-white dark:bg-card rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:gap-6 gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by game title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="0">Sent for Credits</option>
              <option value="1">Used Credits</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results Card */}
      <div className="bg-white dark:bg-card rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Results</h2>
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bundle</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Publisher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">No exchange history found.</td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-4 py-2 whitespace-nowrap flex items-center gap-2">
                        <img src={tx.steamGameMetadata?.headerImage || "/images/hero-background.jpg"} alt={tx.productTitle} className="w-8 h-8 rounded object-cover" />
                        <span>{tx.productTitle}</span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {tx.type === 0 ? (
                          <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">Sent for Credits</span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-800">Used Credits</span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{tx.creditAmount}</td>
                      <td className="px-4 py-2 whitespace-nowrap">${tx.productPrice}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{tx.isFromBundle ? `Yes (Tier: ${tx.tierPrice})` : "No"}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{tx.publisherName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
