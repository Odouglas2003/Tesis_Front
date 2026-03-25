"use client";
import React, { useEffect, useMemo } from "react";
import Navbar from "@/components/navbar/pages";
import SettingsPanel from "@/components/configuration/SettingsPanel/SettingsPanel";
import { Box } from "@mui/material";
import { useAuthRole } from "@/app/hooks/useAuthRole";
import { useRouter } from "next/navigation";

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

  if (loading) {
    return null;
  }

  if (isManager) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p>No tenés permisos para ver esta página.</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full" style={{ marginBottom: "220px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 100,
        }}
      >
        <Navbar />
      </Box>
      <SettingsPanel />
    </div>
  );
}
