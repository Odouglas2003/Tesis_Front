"use client";
import { Box, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { VacanciePayload } from "@/types/interface";
import { UI, cardSx } from "@/theme/appPalette";

interface Props {
  vacancies: VacanciePayload[];
  onDelete: (vacancie: VacanciePayload) => void;
}

export default function VacancyList({ vacancies, onDelete }: Props) {
  if (!vacancies.length) return null;
  return (
    <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography component="h2" sx={{ fontSize: "1.125rem", fontWeight: 700, color: UI.ink }}>
        Vacantes activas
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(auto-fill, minmax(300px, 1fr))" },
          gap: 2,
        }}
      >
        {vacancies.map((v, index) => (
          <Box key={v.vacancieName + index} sx={{ ...cardSx, p: 2.5, display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Box component="dl" sx={{ m: 0, flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px 16px" }}>
              <Info label="Rol" value={v.vacancieName} />
              <Info label="Seniority" value={v.seniority} />
              <Info label="Tecnologías" value={v.skills.map((skill) => skill.name).join(", ")} />
              <Info label="Horas asignadas" value={String(v.time)} />
            </Box>
            <IconButton
              aria-label={`Quitar vacante ${v.vacancieName}`}
              onClick={() => onDelete(v)}
              sx={{ width: 40, height: 40, color: UI.danger }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
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
