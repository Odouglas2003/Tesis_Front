"use client";

import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import Credentials from "@/components/configuration/credentials/Credentials";
import Record from "@/components/configuration/NotificationHistory/notificationHistory";
import DesingAndTables from "@/components/configuration/Desing&Tables/Desing&Tables";
import Journey from "../JourneySettings/Journey";
import JobsPage from "../JobsSettings/Jobs";
import ClientPage from "../ClientSettings/Client";
import SkillsPage from "../SkillsSettings/Skills";
import ExportData from "../ExportData/pageExportData";
import RestoreCollaborator from "../RestoreCollaborator/RestoreCollaborator";
import { UI, cardSx } from "@/theme/appPalette";

interface Section {
  title: string;
  options: { label: string; component?: React.FC }[];
}

const sections: Section[] = [
  {
    title: "Parámetros",
    options: [
      { label: "Clientes", component: ClientPage },
      { label: "Habilidades", component: SkillsPage },
      { label: "Puestos de trabajo", component: JobsPage },
      { label: "Jornadas de trabajo", component: Journey },
      { label: "Diseño y tablas", component: DesingAndTables },
      { label: "Colaboradores", component: RestoreCollaborator },
    ],
  },
  {
    title: "Notificaciones",
    options: [{ label: "Ajustes", component: Record }],
  },
  {
    title: "Usuarios",
    options: [{ label: "Credenciales", component: Credentials }],
  },
  {
    title: "Importación de datos",
    options: [{ label: "Importar datos", component: ExportData }],
  },
];

export default function SettingsPanel() {
  const [selectedComponent, setSelectedComponent] = useState<React.FC | null>(
    () => DesingAndTables
  );

  const handleOptionClick = (component?: React.FC) => {
    if (component) {
      setSelectedComponent(() => component);
    }
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "flex-start" }}>
      <Box
        component="nav"
        aria-label="Configuración"
        sx={{
          ...cardSx,
          flex: "1 1 240px",
          maxWidth: { md: 280 },
          px: 1.5,
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2.25,
        }}
      >
        {sections.map((section) => (
          <Box key={section.title} sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
            <Typography
              sx={{ px: 1.5, pb: 0.75, fontSize: "0.75rem", fontWeight: 700, color: UI.muted }}
            >
              {section.title}
            </Typography>
            {section.options.map((option) => {
              const active = selectedComponent === option.component;
              return (
                <Box
                  key={option.label}
                  component="button"
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => handleOptionClick(option.component)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    minHeight: 40,
                    px: 1.5,
                    border: 0,
                    borderRadius: "8px",
                    textAlign: "left",
                    fontFamily: "inherit",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    fontWeight: active ? 700 : 500,
                    color: active ? UI.blueSoftText : UI.inkSoft,
                    backgroundColor: active ? UI.blueSoft : "transparent",
                    transition: "background-color .2s ease",
                    "&:hover": { backgroundColor: active ? UI.blueSoft : UI.surfaceMuted },
                  }}
                >
                  {option.label}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      <Box sx={{ flex: "999 1 560px", minWidth: 0 }}>
        {selectedComponent && React.createElement(selectedComponent)}
      </Box>
    </Box>
  );
}
