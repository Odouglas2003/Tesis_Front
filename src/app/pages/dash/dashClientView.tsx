"use client";
import React from "react";
import Dash from "@/components/component-dash/Dashboard";
import { DashboardData } from "@/types/interface";
import AppShell from "@/components/layout/AppShell";
export default function DashClientView({
  metrics,
}: {
  metrics: DashboardData;
}) {
  return (
    <AppShell
      title="Panel ejecutivo"
      description="Visibilidad centralizada sobre colaboradores, proyectos, vacantes y actividad operativa."
    >
      <Dash metricsProp={metrics} />
    </AppShell>
  );
}
