"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PlanProvider } from "@/lib/plan-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        await api.get("/patients?limit=1");
      } catch {
        router.push("/login");
      } finally {
        setChecking(false);
      }
    }
    checkAuth();
  }, []);

  async function handleLogout() {
    await api.post("/auth/logout");
    router.push("/login");
  }

  const navItems = [
    { href: "/", label: "Dashboard", icon: "⊞" },
    { href: "/patients", label: "Pacientes", icon: "👥" },
    { href: "/pipeline", label: "Pipeline", icon: "⬜" },
    { href: "/tasks", label: "Tarefas", icon: "✓" },
  ];

  if (checking)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Carregando...</p>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col py-5 fixed top-0 left-0 bottom-0">
        <div className="flex items-center gap-3 px-5 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-sm">
            ♥
          </div>
          <span className="text-sm font-medium text-gray-900">CRM Saúde</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 w-full transition-colors"
          >
            <span>↩</span> Sair
          </button>
        </div>
      </aside>

      <PlanProvider>
        <main className="ml-56 flex-1 p-6">{children}</main>
      </PlanProvider>
    </div>
  );
}
