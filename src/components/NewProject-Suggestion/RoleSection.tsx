"use client";
import React from "react";
import { Box, Typography, Grid2, Card, Stack, Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Position, Candidate } from "@/types/interface";

interface Props {
  position: Position;
  onSelect: (position_id: string, candidate: Candidate) => void;
  onCreateVacancy: (position: Position) => void;
  time: string; // Horas requeridas para la vacante
}

export default function RoleSection({
  position,
  onSelect,
  onCreateVacancy,
  time,
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
    <Box sx={{ mb: 4 }}>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 700,
          fontSize: "18px",
          color: "#002338",
          mb: "5px",
        }}
      >
        Rol:
      </Typography>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "16px",
          color: "#002338",
          mb: "10px",
        }}
      >
        {position.role_requested +
          " - " +
          position.seniority_requested +
          " - " +
          position.technologies_requested.join(", ") +
          " - " +
          time +
          " Horas requeridas"}
      </Typography>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "16px",
          color: "#002338",
          mb: "10px",
        }}
      >
        {position.vacancy_message}
      </Typography>

      <Grid2 container spacing={2}>
        {candidates.map((c) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={c.id}>
            <Card
              onClick={() => onSelect(position.position_id, c)}
              sx={{
                p: 2,
                width: "100%",
                height: "100%",
                maxWidth: "300px",
                maxHeight: "300px",
                cursor: "pointer",
                border: c.selected ? "2px solid #009ADA" : "1px solid #e0e0e0",
                bgcolor: "#F8F8F8",
                borderRadius: "10px",
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                {c.selected ? (
                  <CheckBoxIcon
                    sx={{ color: "#009ADA", width: "24px", height: "24px" }}
                  />
                ) : (
                  <CheckBoxOutlineBlankIcon
                    color="disabled"
                    sx={{ width: "24px", height: "24px" }}
                  />
                )}
              </Stack>

              <Info label="Colaborador:" value={c.name} />
              <Info
                label="Tecnología:"
                value={c.known_technologies.join(", ")}
              />
              <Info label={c.availability_message} value={""} />

              {c.suggested_by_ia && (
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#0087FF",
                  }}
                  mt={"0.5px"}
                >
                  Candidato sugerido por IA
                </Typography>
              )}

              {c.is_user_suggestion && (
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#0087FF",
                  }}
                  mt={"0.5px"}
                >
                  Candidato sugerido
                </Typography>
              )}
            </Card>
          </Grid2>
        ))}

        {/* tarjeta vacante */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Button
            disabled={hasSelection}
            sx={{
              width: "289px",
              height: "180px",
              p: 2,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              border: "1px dashed",
              cursor: "pointer",
              textTransform: "none",
              borderRadius: "10px",
            }}
            id="create-vacancy"
            onClick={() => onCreateVacancy(position)}
          >
            <AddCircleOutlineIcon
              fontSize="large"
              sx={{ color: hasSelection ? "#CDCDCD" : "#006899" }}
            />

            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "20px",
                color: hasSelection ? "#CDCDCD" : "#006899",
              }}
            >
              Crear vacante
            </Typography>
          </Button>
        </Grid2>
      </Grid2>
    </Box>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" gap={1} mb={"5px"}>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "16px",
          color: "#002338",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 300,
          fontSize: "16px",
          color: "#002338",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
