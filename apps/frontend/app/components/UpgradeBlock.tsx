"use client";

import { useState } from "react";
import api from "@/lib/api";

export function UpgradeBlock({ message }: { message: string }) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await api.post("/billing/checkout");
      window.location.href = res.data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 text-center px-6">
      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-2xl mb-4">
        🔒
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">{message}</p>
      <p className="text-xs text-gray-400 mb-6">
        Disponível no plano Pro — R$ 79/mês
      </p>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? "Redirecionando..." : "✦ Fazer upgrade para Pro"}
      </button>
      <p className="text-xs text-gray-300 mt-3">Cancele quando quiser</p>
    </div>
  );
}
