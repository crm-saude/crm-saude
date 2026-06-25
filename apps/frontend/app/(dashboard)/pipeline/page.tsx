"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { usePlan } from "@/lib/plan-context";
import { UpgradeBlock } from "@/app/components/UpgradeBlock";

const COLUMNS = [
  { key: "LEAD", label: "Novo contato", color: "bg-emerald-500" },
  { key: "CONTACT", label: "Em contato", color: "bg-blue-500" },
  { key: "SCHEDULED", label: "Consulta agendada", color: "bg-amber-500" },
  { key: "IN_TREATMENT", label: "Em tratamento", color: "bg-purple-500" },
  { key: "INACTIVE", label: "Inativo", color: "bg-gray-400" },
];

function PatientCard({
  patient,
  isDragging,
}: {
  patient: any;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: patient.id,
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing select-none transition-shadow ${isDragging ? "opacity-40" : "hover:shadow-sm"}`}
    >
      <p className="text-sm font-medium text-gray-900">{patient.name}</p>
      {patient.phone && (
        <p className="text-xs text-gray-400 mt-0.5">{patient.phone}</p>
      )}
      {patient.origin && (
        <p className="text-xs text-gray-300 mt-0.5">via {patient.origin}</p>
      )}
    </div>
  );
}

function Column({
  col,
  patients,
  activeId,
}: {
  col: (typeof COLUMNS)[0];
  patients: any[];
  activeId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-3 min-h-48 transition-colors ${isOver ? "bg-emerald-50 border-2 border-emerald-300 border-dashed" : "bg-gray-50"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${col.color}`} />
          <span className="text-xs font-medium text-gray-600">{col.label}</span>
        </div>
        <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
          {patients.length}
        </span>
      </div>

      <div className="space-y-2">
        {patients.map((p) => (
          <PatientCard key={p.id} patient={p} isDragging={activeId === p.id} />
        ))}
        {patients.length === 0 && (
          <p className="text-xs text-gray-300 text-center py-6">Vazio</p>
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const { isPro } = usePlan();
  const [kanban, setKanban] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activePatient, setActivePatient] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  async function load() {
    try {
      const res = await api.get("/patients/kanban");
      setKanban(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function findPatient(id: string) {
    for (const col of Object.values(kanban)) {
      const p = col.find((p: any) => p.id === id);
      if (p) return p;
    }
    return null;
  }

  function findColumn(patientId: string) {
    for (const [key, col] of Object.entries(kanban)) {
      if (col.find((p: any) => p.id === patientId)) return key;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    setActiveId(id);
    setActivePatient(findPatient(id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setActivePatient(null);

    if (!over) return;

    const patientId = active.id as string;
    const newStatus = over.id as string;
    const oldStatus = findColumn(patientId);

    if (!oldStatus || oldStatus === newStatus) return;

    // Atualiza localmente imediato
    setKanban((prev) => {
      const patient = prev[oldStatus].find((p: any) => p.id === patientId);
      if (!patient) return prev;
      return {
        ...prev,
        [oldStatus]: prev[oldStatus].filter((p: any) => p.id !== patientId),
        [newStatus]: [
          { ...patient, status: newStatus },
          ...(prev[newStatus] || []),
        ],
      };
    });

    // Persiste no backend
    api.put(`/patients/${patientId}`, { status: newStatus });
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
          <h1 className="text-lg font-medium text-gray-900">Pipeline</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200">
          <UpgradeBlock message="O Pipeline está disponível no plano Pro" />
        </div>
      </div>
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-900">Pipeline</h1>
        <p className="text-sm text-gray-500">
          Arraste os pacientes entre as colunas
        </p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-5 gap-3">
          {COLUMNS.map((col) => (
            <Column
              key={col.key}
              col={col}
              patients={kanban[col.key] || []}
              activeId={activeId}
            />
          ))}
        </div>

        <DragOverlay>
          {activePatient && (
            <div className="bg-white rounded-lg border border-emerald-300 shadow-lg p-3 cursor-grabbing w-48">
              <p className="text-sm font-medium text-gray-900">
                {activePatient.name}
              </p>
              {activePatient.phone && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {activePatient.phone}
                </p>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
