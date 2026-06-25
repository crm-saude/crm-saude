"use client";

import { useRouter } from "next/navigation";

export default function UpgradeCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mx-auto mb-4">
          😕
        </div>
        <h1 className="text-lg font-medium text-gray-900 mb-2">
          Upgrade cancelado
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Você pode fazer o upgrade a qualquer momento.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Voltar ao dashboard
        </button>
      </div>
    </div>
  );
}
