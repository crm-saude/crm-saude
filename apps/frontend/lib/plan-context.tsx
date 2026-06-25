"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "./api";

type PlanContextType = {
  plan: "SOLO" | "CLINIC";
  patientCount: number;
  isPro: boolean;
  refresh: () => void;
};

const PlanContext = createContext<PlanContextType>({
  plan: "SOLO",
  patientCount: 0,
  isPro: false,
  refresh: () => {},
});

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<"SOLO" | "CLINIC">("SOLO");
  const [patientCount, setPatientCount] = useState(0);

  async function load() {
    try {
      const [clinicRes, patientsRes] = await Promise.all([
        api.get("/clinics/me"),
        api.get("/patients"),
      ]);
      setPlan(clinicRes.data.plan);
      setPatientCount(patientsRes.data.length);
    } catch {}
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <PlanContext.Provider
      value={{ plan, patientCount, isPro: plan === "CLINIC", refresh: load }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export const usePlan = () => useContext(PlanContext);
