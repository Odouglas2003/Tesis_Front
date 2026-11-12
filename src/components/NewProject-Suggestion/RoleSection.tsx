"use client";
import React from "react";
import { Box, Typography, Button, Checkbox } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Position, Candidate } from "@/types/interface";
import { UI, cardSx } from "@/theme/appPalette";

interface Props {
  position: Position;
  onSelect: (position_id: string, candidate: Candidate) => void;
  onCreateVacancy: (position: Position) => void;
  time: string; // Horas semanales requeridas para la vacante
  seniorityLabel?: string; // Seniority tal como se eligió en el formulario
}

const WARNING_LABELS: Record<string, string> = {
  evaluacion_de_desempeno: "evaluación de desempeño",
  sueldo: "sueldo",
};

const initialsOf = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const chipSx = {
  px: 1.25,
  py: 0.4,
  borderRadius: "6px",
  fontSize: "0.75rem",
  fontWeight: 600,
  backgroundColor: UI.track,
  color: UI.inkSoft,
};

export default function RoleSection({
  position,
  onSelect,
  onCreateVacancy,
  time,
  seniorityLabel,
}: Props) {
  /* sugerido primero por si el back no lo devuelve en orden */
  const candidates = [...position.candidates].sort((a, b) => {
    if (
      (a.suggested_by_ia || a.is_user_suggestion) &&
      !(b.suggested_by_ia || b.is_user_suggestion)
    )
      return -1;

    if (
      !(a.suggested_by_ia || a.is_user_suggestion) &&
      (b.suggested_by_ia || b.is_user_suggestion)
    )
      return 1;

    return 0;
  });

  const hasSelection = candidates.some((c) => c.selected);

  return (
    <Box component="section" sx={{ ...cardSx, p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "8px 16px" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.25 }}>
          <Typography component="h3" sx={{ fontSize: "1.0625rem", fontWeight: 700, color: UI.ink }}>
            {position.role_requested} · {seniorityLabel || position.seniority_requested}
          </Typography>
          {position.technologies_requested.map((tech) => (
            <Box component="span" key={tech} sx={chipSx}>
              {tech}
            </Box>
          ))}
        </Box>
        <Typography sx={{ fontSize: "0.8125rem", color: UI.muted }}>
          <Box component="strong" sx={{ color: UI.ink }}>{time} h/semana</Box> requeridas
        </Typography>
      </Box>

      {position.vacancy_message && (
        <Typography sx={{ fontSize: "0.875rem", color: UI.inkSoft }}>{position.vacancy_message}</Typography>
      )}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ flex: "2 1 460px", minWidth: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {candidates.map((c) => {
            const warnings = (c.missing_data_warnings ?? []).map((w) => WARNING_LABELS[w] ?? w.replace(/_/g, " "));
            const inputId = `candidate-${position.position_id}-${c.id}`;
            return (
              <Box
                key={c.id}
                component="label"
                htmlFor={inputId}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  cursor: "pointer",
                  borderRadius: "10px",
                  border: c.selected ? `2px solid ${UI.blue}` : `1px solid ${UI.borderStrong}`,
                  m: c.selected ? 0 : "1px",
                  backgroundColor: c.selected ? "#F4F9FE" : "#FFFFFF",
                  transition: "border-color .2s ease, background-color .2s ease",
                  "&:hover": { borderColor: c.selected ? UI.blue : "#8FA3B6" },
                }}
              >
                <Checkbox
                  id={inputId}
                  checked={Boolean(c.selected)}
                  onChange={() => onSelect(position.position_id, c)}
                  sx={{ p: 0.5, color: "#8FA3B6", "&.Mui-checked": { color: UI.blue } }}
                />
                <Box
                  aria-hidden
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    backgroundColor: UI.avatarBg,
                    color: "#12304D",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {initialsOf(c.name)}
                </Box>
                <Box sx={{ flex: "1 1 200px", minWidth: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                    <Typography component="span" sx={{ fontSize: "0.9375rem", fontWeight: 700, color: UI.ink }}>
                      {c.name}
                    </Typography>
                    {(c.suggested_by_ia || c.is_user_suggestion) && (
                      <Box
                        component="span"
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: "999px",
                          backgroundColor: UI.blueSoft,
                          color: UI.blueSoftText,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {c.suggested_by_ia ? "Candidato sugerido por IA" : "Candidato sugerido"}
                      </Box>
                    )}
                  </Box>
                  {c.known_technologies.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      {c.known_technologies.map((tech) => (
                        <Box component="span" key={tech} sx={chipSx}>
                          {tech}
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Typography component="span" sx={{ fontSize: "0.8125rem", fontWeight: 600, color: UI.tealSoftText }}>
                    {c.availability_message}
                  </Typography>
                  {warnings.length > 0 && (
                    <Typography component="span" sx={{ fontSize: "0.75rem", color: UI.warnSoftText }}>
                      Faltan datos: {warnings.join(", ")}.
                    </Typography>
                  )}
                </Box>
                {typeof c.score === "number" && (
                  <Box
                    sx={{
                      flex: "0 0 auto",
                      pl: 2,
                      borderLeft: `1px solid ${UI.border}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.25,
                    }}
                  >
                    <Typography component="span" sx={{ fontSize: "0.75rem", fontWeight: 600, color: UI.muted }}>
                      Puntaje
                    </Typography>
                    <Typography
                      component="span"
                      sx={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1, color: UI.ink, fontVariantNumeric: "tabular-nums" }}
                    >
                      {c.score}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        <Button
          disabled={hasSelection}
          id="create-vacancy"
          onClick={() => onCreateVacancy(position)}
          sx={{
            flex: "1 1 220px",
            minHeight: 96,
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 0.75,
            border: "1.5px dashed #8FA3B6",
            borderRadius: "8px",
            color: UI.blue,
            fontSize: "0.875rem",
            fontWeight: 600,
            textTransform: "none",
            "&.Mui-disabled": { color: "#8FA3B6", borderColor: UI.border },
          }}
        >
          <AddCircleOutlineIcon />
          Crear vacante
        </Button>
      </Box>
    </Box>
  );
}
