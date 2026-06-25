"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    try {
      const [sRes, cRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/clinics"),
      ]);
      setStats(sRes.data);
      setClinics(cRes.data);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handlePlanChange(clinicId: string, plan: string) {
    setUpdatingId(clinicId);
    try {
      await api.patch(`/admin/clinics/${clinicId}/plan`, { plan });
      load();
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleLogout() {
    await api.post("/auth/logout");
    router.push("/login");
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR");
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Carregando...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-sm">
            ♥
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900">CRM Saúde</span>
            <span className="ml-2 text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
              Admin
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Sair →
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-lg font-medium text-gray-900">Painel Admin</h1>
          <p className="text-sm text-gray-500">Visão geral do produto</p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 mb-1">Total de clínicas</p>
            <p className="text-3xl font-medium text-gray-900">
              {stats.totalClinics}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 mb-1">Plano Pro</p>
            <p className="text-3xl font-medium text-emerald-600">
              {stats.proClinics}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 mb-1">Plano Grátis</p>
            <p className="text-3xl font-medium text-gray-900">
              {stats.freeClinics}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 mb-1">Novos (7 dias)</p>
            <p className="text-3xl font-medium text-gray-900">
              {stats.recentClinics}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 mb-1">Total de pacientes</p>
            <p className="text-3xl font-medium text-gray-900">
              {stats.totalPatients}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 mb-1">Conversão grátis → pro</p>
            <p className="text-3xl font-medium text-gray-900">
              {stats.totalClinics > 0
                ? Math.round((stats.proClinics / stats.totalClinics) * 100)
                : 0}
              %
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 mb-1">MRR estimado</p>
            <p className="text-3xl font-medium text-emerald-600">
              R$ {(stats.proClinics * 79).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        {/* Lista de clínicas */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">
              Clínicas cadastradas
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium">Clínica</th>
                <th className="text-left px-5 py-3 font-medium">Responsável</th>
                <th className="text-left px-5 py-3 font-medium">Pacientes</th>
                <th className="text-left px-5 py-3 font-medium">Cadastro</th>
                <th className="text-left px-5 py-3 font-medium">Plano</th>
              </tr>
            </thead>
            <tbody>
              {clinics.map((clinic) => {
                const owner = clinic.users.find(
                  (u: any) => u.role === "OWNER" || u.role === "ADMIN",
                );
                return (
                  <tr
                    key={clinic.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {clinic.name}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-600">
                        {owner?.name || "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {owner?.email || ""}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-600">
                        {clinic._count.patients}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-600">
                        {formatDate(clinic.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={clinic.plan}
                        disabled={updatingId === clinic.id}
                        onChange={(e) =>
                          handlePlanChange(clinic.id, e.target.value)
                        }
                        className={`text-xs border rounded-lg px-2 py-1.5 outline-none transition-colors ${
                          clinic.plan === "CLINIC"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                      >
                        <option value="SOLO">Grátis</option>
                        <option value="CLINIC">Pro</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
