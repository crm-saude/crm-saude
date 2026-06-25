"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { usePlan } from "@/lib/plan-context";
import { UpgradeBlock } from "@/app/components/UpgradeBlock";

export default function TasksPage() {
  const { isPro } = usePlan();
  const [tasks, setTasks] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    patientId: "",
    dueDate: "",
    urgent: false,
  });

  async function load() {
    try {
      const [tRes, pRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/patients"),
      ]);
      setTasks(tRes.data);
      setPatients(pRes.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/tasks", {
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        patientId: form.patientId || null,
      });
      setShowModal(false);
      setForm({ title: "", patientId: "", dueDate: "", urgent: false });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string) {
    await api.patch(`/tasks/${id}/toggle`);
    load();
  }

  async function handleDelete(id: string) {
    await api.delete(`/tasks/${id}`);
    load();
  }

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  function formatDate(date: string) {
    if (!date) return null;
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function isOverdue(task: any) {
    if (!task.dueDate || task.done) return false;
    return new Date(task.dueDate) < new Date();
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Carregando...
      </div>
    );

  if (!isPro)
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-lg font-medium text-gray-900">Tarefas</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200">
          <UpgradeBlock message="As Tarefas estão disponíveis no plano Pro" />
        </div>
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-900">Tarefas</h1>
          <p className="text-sm text-gray-500">{pending.length} pendentes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nova tarefa
        </button>
      </div>

      <div className="space-y-6">
        {/* Pendentes */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">Pendentes</h2>
          </div>
          {pending.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">
              Nenhuma tarefa pendente 🎉
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {pending.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <button
                    onClick={() => handleToggle(task.id)}
                    className="w-5 h-5 rounded border-2 border-gray-300 hover:border-emerald-500 flex-shrink-0 mt-0.5 transition-colors"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {task.patient && (
                        <span className="text-xs text-gray-400">
                          {task.patient.name}
                        </span>
                      )}
                      {task.dueDate && (
                        <span
                          className={`text-xs ${isOverdue(task) ? "text-red-500 font-medium" : "text-gray-400"}`}
                        >
                          {isOverdue(task) ? "⚠ " : ""}
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.urgent && (
                      <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        Urgente
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-gray-300 hover:text-red-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Concluídas */}
        {done.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-400">
                Concluídas ({done.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {done.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 px-5 py-3 group"
                >
                  <button
                    onClick={() => handleToggle(task.id)}
                    className="w-5 h-5 rounded border-2 border-emerald-400 bg-emerald-400 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors"
                  >
                    <span className="text-white text-xs">✓</span>
                  </button>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 line-through">
                      {task.title}
                    </p>
                    {task.patient && (
                      <p className="text-xs text-gray-300 mt-0.5">
                        {task.patient.name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-gray-300 hover:text-red-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal nova tarefa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-base font-medium text-gray-900 mb-4">
              Nova tarefa
            </h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Título da tarefa"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />

              <select
                value={form.patientId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, patientId: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Sem paciente vinculado</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.urgent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, urgent: e.target.checked }))
                  }
                  className="w-4 h-4 accent-emerald-500"
                />
                <span className="text-sm text-gray-600">
                  Marcar como urgente
                </span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
