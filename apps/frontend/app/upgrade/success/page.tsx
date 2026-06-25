"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UpgradeSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => router.push("/"), 4000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-3xl mx-auto mb-4">
          🎉
        </div>
        <h1 className="text-lg font-medium text-gray-900 mb-2">
          Seja bem-vindo ao Pro!
        </h1>
        <p className="text-sm text-gray-500 mb-1">
          Seu plano foi ativado com sucesso.
        </p>
        <p className="text-xs text-gray-400">
          Redirecionando em alguns segundos...
        </p>
      </div>
    </div>
  );
}
