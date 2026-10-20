"use client";
import { Box, Typography, Stack, Divider } from "@mui/material";
import { formatDate } from "@/utils/utils";

import { ProjectPayload } from "@/types/interface";

type ProjectHeaderProps = {
  project: ProjectPayload;
};

//export default function ProjectHeader(project: ProjectPayload) {
export default function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 600,
          fontSize: "24px",
          color: "#0087FF",
          mb: 1,
        }}
      >
        Resultado optimizado por IA
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} gap={4} flexWrap="wrap">
        <Info label="Nombre" value={project.name} />
        <Info label="Cliente" value={project.client} />
        <Info
          label="Manager"
          value={project.managerName || project.manager_name || "No Manager Assigned"}
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} gap={4} flexWrap="wrap">
        <Info label="Fecha de inicio" value={formatDate(project.startDate)} />
        <Info label="Fecha de fin" value={formatDate(project.endDate)} />
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        gap={4}
        flexWrap="wrap"
        mt={2}
      >
        <Info label="Descripcion" value={project.description} />
      </Stack>

      <Divider sx={{ my: 3, width: "100%" }} />

      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "18px",
          color: "#006899",
          mb: "4px",
        }}
      >
        Staff Sugerido
      </Typography>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 400,
          fontSize: "16px",
          color: "#002338",
          mb: "4px",
        }}
      >
        Por favor, selecciona los candidatos que mejor consideres según cada
        rol.
      </Typography>
    </Box>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" gap={1}>
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
