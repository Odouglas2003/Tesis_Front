"use client";

import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import Credentials from "@/components/configuration/credentials/Credentials";
import Record from "@/components/configuration/NotificationHistory/notificationHistory";
import DesingAndTables from "@/components/configuration/Desing&Tables/Desing&Tables";
import Journey from "../JourneySettings/Journey";
import JobsPage from "../JobsSettings/Jobs";
import ClientPage from "../ClientSettings/Client";
import SkillsPage from "../SkillsSettings/Skills";
import ExportData from "../ExportData/pageExportData";
import RestoreCollaborator from "../RestoreCollaborator/RestoreCollaborator";
import { useAppTheme } from "@/app/ThemeProviderClient";

interface Section {
  title: string;
  options: { label: string; component?: React.FC }[];
}

const sections: Section[] = [
  {
    title: "Parámetros",
    options: [
      { label: "ABM de Clientes", component: ClientPage },
      { label: "ABM de Habilidades", component: SkillsPage },
      { label: "ABM de Puestos de Trabajo", component: JobsPage },
      { label: "ABM de Jornadas de Trabajo", component: Journey },
      { label: "Diseño y Tablas", component: DesingAndTables },
      { label: "ABM de Colaboradores", component: RestoreCollaborator },
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
    options: [{ label: "Importar Datos", component: ExportData }],
  },
];

export default function SettingsPanel() {
  const { colors } = useAppTheme();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Parámetros": true,
  });
  const [selectedComponent, setSelectedComponent] = useState<React.FC | null>(
    () => DesingAndTables
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleOptionClick = (component?: React.FC) => {
    if (component) {
      setSelectedComponent(() => component);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Box
        sx={{
          width: "310px",
          backgroundColor: colors.card,
          borderRadius: "20px",
          boxShadow: "0 18px 45px rgba(18,48,77,0.08)",
          border: "1px solid rgba(18,48,77,0.08)",
          p: 2,
          marginLeft: "3.5%",
          marginRight: "4%",
          height: "725px",
        }}
      >
        {sections.map((section) => (
          <Box key={section.title} mb={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onClick={() => toggleSection(section.title)}
            >
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Poppins",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: colors.primary,
                }}
              >
                {section.title}
              </Typography>
              {expandedSections[section.title] ? (
                <ExpandLess sx={{ color: colors.primary }} />
              ) : (
                <ExpandMore sx={{ color: colors.primary }} />
              )}
            </Box>
            {expandedSections[section.title] && (
              <Box mt={1}>
                {section.options.map((option) => (
                  <Typography
                    key={option.label}
                    variant="body2"
                    sx={{
                      fontFamily: "Poppins",
                      fontSize: "16px",
                      color:
                        selectedComponent === option.component
                          ? colors.secondary
                          : colors.primary,
                      fontWeight:
                        selectedComponent === option.component ? "bold" : "normal",
                      cursor: "pointer",
                      py: 0.5,
                      transition: "color .2s ease",
                    }}
                    onClick={() => handleOptionClick(option.component)}
                  >
                    {option.label}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          height: "100%",
          display: "flex",
          width: "68.5%",
          alignItems: "flex-start",
        }}
      >
        {selectedComponent && React.createElement(selectedComponent)}
      </Box>
    </Box>
  );
}
