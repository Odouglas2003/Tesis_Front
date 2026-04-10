"use client";

import React, { useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import SettingsPanel from "@/components/configuration/SettingsPanel/SettingsPanel";
import { useAuthRole } from "@/app/hooks/useAuthRole";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";

export default function ConfigurationClientView() {
  const router = useRouter();
  const { isManager, isAdmin } = useAuthRole();
  const loading = useMemo(
    () => isManager === undefined || isAdmin === undefined,
    [isManager, isAdmin]
  );

  useEffect(() => {
    if (isManager) {
      router.replace("/pages/dash");
    }
  }, [isManager, router]);

  if (loading || isManager) {
    return null;
  }

  if (!isAdmin) {
    return (
      <Box className="min-h-screen w-full flex items-center justify-center">
        <Typography>No tenes permisos para ver esta pagina.</Typography>
      </Box>
    );
  }

  return (
    <AppShell
      title="Configuración"
      description="Administra branding, catálogos, permisos y estructura operativa de la plataforma."
    >
      <SettingsPanel />
    </AppShell>
  );
}
