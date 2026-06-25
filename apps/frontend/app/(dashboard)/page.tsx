"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function DashboardPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, tRes] = await Promise.all([
          api.get("/patients"),
          api.get("/tasks/today"),
        ]);
        setPatients(pRes.data);
        setTasks(tRes.data);
      } catch {
        // redireciona se não autenticado
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const metrics = [
    {
      label: "Pacientes ativos",
      value: patients.filter((p) => p.status === "IN_TREATMENT").length,
    },
    {
      label: "Novos leads",
      value: patients.filter((p) => p.status === "LEAD").length,
    },
    {
      label: "Consultas agendadas",
      value: patients.filter((p) => p.status === "SCHEDULED").length,
    },
    { label: "Tarefas hoje", value: tasks.length },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Carregando...
      </div>
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Visão geral da sua clínica</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{m.label}</p>
            <p className="text-2xl font-medium text-gray-900">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-medium text-gray-900 mb-4">
          Tarefas do dia
        </h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma tarefa para hoje.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-4 h-4 rounded border border-gray-300 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {task.title}
                  </p>
                  {task.patient && (
                    <p className="text-xs text-gray-500">{task.patient.name}</p>
                  )}
                </div>
                {task.urgent && (
                  <span className="ml-auto text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                    Urgente
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
