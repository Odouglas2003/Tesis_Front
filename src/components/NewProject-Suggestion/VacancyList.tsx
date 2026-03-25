"use client";
import { Box, Typography, Card, Stack, Grid2 } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { VacanciePayload } from "@/types/interface";

interface Props {
  vacancies: VacanciePayload[];
  onDelete: (vacancie: VacanciePayload) => void;
}

export default function VacancyList({ vacancies, onDelete }: Props) {
  if (!vacancies.length) return null;
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "18px",
          color: "#006899",
          mb: 1,
        }}
      >
        Vacantes activas
      </Typography>

      <Grid2 container spacing={2} sx={{ mb: 2 }}>
        {vacancies.map((v, index) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={v.vacancieName + index}>
            <Card
              sx={{
                p: 2,
                width: "289px",
                height: "162px",
                borderRadius: "10px",
                bgcolor: "#CDCDCD",
                position: "relative",
              }}
            >
              <Info label="Rol" value={v.vacancieName} />
              <Info label="Seniority" value={v.seniority} />
              <Info
                label="Tecnologías "
                value={v.skills.map((skill) => skill.name).join(", ")}
              />
              <Info label="Horas asignadas" value={String(v.time)} />

              <Stack sx={{ marginTop: "13px" }} alignItems={"flex-end"}>
                <DeleteIcon
                  fontSize="inherit"
                  sx={{
                    color: "#D61010",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                  }}
                  onClick={() => onDelete(v)}
                />
              </Stack>
            </Card>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" gap={1} mb={"0.5px"}>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "16px",
          color: "#002338",
        }}
      >
        {label}:
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
