"use client";
import { Box, Typography } from "@mui/material";
import { formatDate } from "@/utils/utils";
import { ProjectPayload } from "@/types/interface";
import { UI, cardSx } from "@/theme/appPalette";

type ProjectHeaderProps = {
  project: ProjectPayload;
};

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <>
      <Box component="section" sx={{ ...cardSx, p: { xs: 2.5, md: 3.5 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: UI.blue }}>
            Resultado optimizado por IA
          </Typography>
          <Typography
            component="h1"
            sx={{ fontSize: { xs: "1.4rem", md: "1.625rem" }, fontWeight: 700, letterSpacing: "-0.02em", color: UI.ink, lineHeight: 1.2 }}
          >
            {project.name}
          </Typography>
          {project.description && (
            <Typography sx={{ fontSize: "0.9375rem", color: UI.muted, maxWidth: 760 }}>
              {project.description}
            </Typography>
          )}
        </Box>
        <Box
          component="dl"
          sx={{
            m: 0,
            pt: 2.5,
            borderTop: `1px solid ${UI.border}`,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px 24px",
          }}
        >
          <Info label="Cliente" value={project.client || "Sin definir"} />
          <Info label="Manager" value={project.managerName || project.manager_name || "Sin asignar"} />
          <Info label="Fecha de inicio" value={formatDate(project.startDate)} />
          <Info label="Fecha de fin" value={formatDate(project.endDate)} />
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography component="h2" sx={{ fontSize: "1.125rem", fontWeight: 700, color: "text.primary" }}>
          Staff sugerido
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
          Elegí un candidato por rol, o creá una vacante si ninguno te convence.
        </Typography>
      </Box>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography component="dt" sx={{ fontSize: "0.75rem", fontWeight: 600, color: UI.muted }}>
        {label}
      </Typography>
      <Typography component="dd" sx={{ m: 0, fontSize: "0.875rem", fontWeight: 600, color: UI.ink }}>
        {value}
      </Typography>
    </Box>
  );
}
