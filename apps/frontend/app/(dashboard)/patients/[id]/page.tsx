"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { usePlan } from "@/lib/plan-context";
import { UpgradeBlock } from "@/app/components/UpgradeBlock";

const STATUS_LABELS: Record<string, string> = {
  LEAD: "Lead",
  CONTACT: "Em contato",
  SCHEDULED: "Consulta agendada",
  IN_TREATMENT: "Em tratamento",
  INACTIVE: "Inativo",
};

const STATUS_COLORS: Record<string, string> = {
  LEAD: "bg-emerald-50 text-emerald-700",
  CONTACT: "bg-blue-50 text-blue-700",
  SCHEDULED: "bg-amber-50 text-amber-700",
  IN_TREATMENT: "bg-purple-50 text-purple-700",
  INACTIVE: "bg-gray-100 text-gray-500",
};

const INTERACTION_LABELS: Record<string, string> = {
  NOTE: "Anotação",
  CALL: "Ligação",
  MESSAGE: "Mensagem",
  EMAIL: "E-mail",
};

const INTERACTION_ICONS: Record<string, string> = {
  NOTE: "📝",
  CALL: "📞",
  MESSAGE: "💬",
  EMAIL: "✉️",
};

export default function PatientProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [newInteraction, setNewInteraction] = useState({
    type: "NOTE",
    content: "",
  });
  const [savingInteraction, setSavingInteraction] = useState(false);

  const { isPro } = usePlan();

  async function load() {
    try {
      const res = await api.get(`/patients/${id}`);
      setPatient(res.data);
      setStatus(res.data.status);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    await api.put(`/patients/${id}`, { status: newStatus });
  }

  async function handleAddInteraction(e: React.FormEvent) {
    e.preventDefault();
    if (!newInteraction.content.trim()) return;
    setSavingInteraction(true);
    try {
      await api.post("/interactions", {
        ...newInteraction,
        patientId: id,
      });
      setNewInteraction({ type: "NOTE", content: "" });
      load();
    } finally {
      setSavingInteraction(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Carregando...
      </div>
    );

  if (!patient)
    return (
      <div className="text-center py-20 text-gray-400 text-sm">
        Paciente não encontrado.
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          ← Voltar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Coluna esquerda — dados do paciente */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium text-lg">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-base font-medium text-gray-900">
                  {patient.name}
                </h1>
                <p className="text-xs text-gray-400">
                  Cadastrado em {formatDate(patient.createdAt)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {patient.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-gray-300">📞</span> {patient.phone}
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-gray-300">✉️</span> {patient.email}
                </div>
              )}
              {patient.origin && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-gray-300">📍</span> via {patient.origin}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Status</h2>
            <div className="space-y-2">
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleStatusChange(value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    status === value
                      ? STATUS_COLORS[value] + " font-medium"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {status === value && "✓ "}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tarefas vinculadas */}
          {patient.tasks?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-medium text-gray-900 mb-3">
                Tarefas
              </h2>
              <div className="space-y-2">
                {patient.tasks.map((task: any) => (
                  <div key={task.id} className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                        task.done
                          ? "border-emerald-400 bg-emerald-400"
                          : "border-gray-300"
                      }`}
                    >
                      {task.done && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <span
                      className={`text-sm ${task.done ? "line-through text-gray-300" : "text-gray-700"}`}
                    >
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coluna direita — histórico */}
        <div className="col-span-2">
          {isPro ? (
            <div className="space-y-4">
              {/* Nova interação */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-medium text-gray-900 mb-3">
                  Registrar interação
                </h2>
                <form onSubmit={handleAddInteraction} className="space-y-3">
                  <div className="flex gap-2">
                    {Object.entries(INTERACTION_LABELS).map(
                      ([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setNewInteraction((i) => ({ ...i, type: value }))
                          }
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            newInteraction.type === value
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {INTERACTION_ICONS[value]} {label}
                        </button>
                      ),
                    )}
                  </div>
                  <textarea
                    value={newInteraction.content}
                    onChange={(e) =>
                      setNewInteraction((i) => ({
                        ...i,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Descreva a interação..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={
                        savingInteraction || !newInteraction.content.trim()
                      }
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {savingInteraction ? "Salvando..." : "Registrar"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Histórico */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-medium text-gray-900 mb-4">
                  Histórico de interações
                </h2>
                {patient.interactions?.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    Nenhuma interação registrada ainda.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {patient.interactions?.map((interaction: any) => (
                      <div key={interaction.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                          {INTERACTION_ICONS[interaction.type]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-500">
                              {INTERACTION_LABELS[interaction.type]} ·{" "}
                              {interaction.user?.name}
                            </span>
                            <span className="text-xs text-gray-300">
                              {formatDate(interaction.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                            {interaction.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200">
              <UpgradeBlock message="Histórico de interações disponível no plano Pro" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
