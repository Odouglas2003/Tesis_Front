"use client";

import { Grid2, Box, Card, Divider, Typography, Button, Tooltip } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/navigation";
import { ProjectNew } from "@/types/interface";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDate } from "@/utils/utils";
import { useAuthRole } from "@/app/hooks/useAuthRole";
import { useMemo } from "react";
import { useAppTheme } from "@/app/ThemeProviderClient";

export default function ProjectDetail({ project }: { project: ProjectNew }) {
  const router = useRouter();
  const { isAdmin, currentUser } = useAuthRole();
  const { colors } = useAppTheme();

  const handleBack = () => {
    router.push("/pages/projects");
  };

  const colaboradoresData = Array.isArray(project.assignedPersons)
    ? project.assignedPersons.map((person) => ({
      name: person.name,
      value: person.horasAsignadas,
    }))
    : [];

  const rolesGrouped = Array.isArray(project.assignedPersons)
    ? project.assignedPersons.reduce((acc, person) => {
      const rolKey = `${person.rol} - ${person.seniority}`;
      if (acc[rolKey]) {
        acc[rolKey] += person.horasAsignadas;
      } else {
        acc[rolKey] = person.horasAsignadas;
      }
      return acc;
    }, {} as Record<string, number>)
    : {};

  const rolesData = Object.entries(rolesGrouped).map(([roleName, hours]) => ({
    name: roleName,
    value: hours,
  }));

  // Helper totals
  const totalHorasColaboradores = colaboradoresData.reduce(
    (sum, p) => sum + (Number(p.value) || 0),
    0
  );

  const totalHorasRoles = rolesData.reduce((sum, r) => sum + (Number(r.value) || 0), 0);

  const COLORS = ["#7DB3FF", "#1CE6C1", "#0066FF", "#FFB347", "#FF6961"];

  const canEdit = useMemo(
    () => isAdmin || project.managerName === currentUser,
    [isAdmin, project.managerName, currentUser]
  );

  return (
    <Grid2
      container
      sx={{
        marginLeft: "55px",
        marginRight: "55px",
      }}
    >
      <Grid2 size={12}>
        <Grid2
          onClick={handleBack}
          sx={{
            width: "97px",
            height: "36px ",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <KeyboardArrowLeftIcon
            sx={{ width: "24px", height: "24px", color: "#002338" }}
          />
          <Typography
            sx={{
              textAlign: "center",
              color: "#002338",
              fontSize: "20px",
              fontFamily: "Poppins",
              fontWeight: 400,
            }}
          >
            Volver
          </Typography>
        </Grid2>
      </Grid2>

      <Grid2 size={12} mt={"30px"}>
        <Card
          elevation={6}
          sx={{
            width: { xs: "90%", md: "100%" },
            borderRadius: "20px",
            backgroundColor: "#FFFFFF",
            padding: "40px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 3,
              gap: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: { xs: "80px", md: "120px" },
                height: { xs: "80px", md: "120px" },
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: "#f5f5f5",
                border: "2px solid #e0e0e0",
              }}
            >
              {project.image ? (
                <img
                  src={project.image ? project.image : "/anonimo.jpeg"}
                  alt={`Imagen del proyecto ${project.name}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#f0f0f0",
                    color: "#999",
                    fontSize: { xs: "12px", md: "14px" },
                    textAlign: "center",
                    fontFamily: "Poppins",
                  }}
                >
                  Sin imagen
                </Box>
              )}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: { xs: 24, md: "40px" },
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  color: "#0087FF",
                  mb: 1,
                }}
              >
                {project.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 18, md: "20px" },
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  color: "#666",
                }}
              >
                {project.description}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 18, md: "18px" },
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  color: "#666",
                }}
              >
                Ultima vez editado por: {project.last_edited_by}{" "}
                {formatDate(project.last_edited_on)}
              </Typography>
            </Box>

            <Tooltip title={canEdit ? "Editar" : "No permitido"}>
              <span>
                <Button
                  variant="contained"
                  startIcon={<EditIcon sx={{ color: colors?.background || "#002338" }} />}
                  disabled={!canEdit}
                  onClick={() => router.push(`/pages/edit/project/${project.id}`)}
                  sx={{
                    backgroundColor: colors?.button || "#23FFDC",
                    borderRadius: "20px",
                    padding: "12px 41px",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 500,
                    fontSize: "20px",
                    height: "50px",
                    color: colors?.background || "#002338",
                    boxShadow: "none",
                    textTransform: "none",
                    transition: 'background-color .25s ease, opacity .25s ease',
                    '&:hover': {
                      backgroundColor: colors?.button || '#23FFDC',
                      opacity: 0.85,
                      boxShadow: 'none'
                    },
                    '&:active': {
                      backgroundColor: colors?.button || '#23FFDC',
                      opacity: 0.75,
                      boxShadow: 'none'
                    },
                    '&.Mui-disabled': {
                      background: '#E0E0E0',
                      color: '#9E9E9E',
                      boxShadow: 'none'
                    },
                  }}
                >
                  Editar
                </Button>
              </span>
            </Tooltip>
          </Box>

          <Divider sx={{ bgcolor: "#002338", mb: 4 }} />

          {project ? (
            <>
              <Grid2 container spacing={4} sx={{ mb: 4 }}>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <InfoRow label="Project Manager" value={project.managerName} />
                  <InfoRow label="Categoria" value={project.category} />
                  <InfoRow
                    label="Presupuesto"
                    value={
                      project.budget !== null && project.budget !== undefined && String(project.budget) !== ""
                        ? `$ ${Number(project.budget).toLocaleString("es-AR")}`
                        : "-"
                    }
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <InfoRow label="Cliente" value={project.client} />
                  <InfoRow
                    label="Fecha de Inicio"
                    value={formatDate(project.startDate)}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <InfoRow label="Estado" value={project.status} />
                  <InfoRow
                    label="Fecha de Fin"
                    value={formatDate(project.endDate)}
                  />
                </Grid2>
              </Grid2>

              {colaboradoresData.length > 0 && (
                <Grid2 container spacing={4} sx={{ mt: 2 }}>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: 18, md: "20px" },
                          fontWeight: 600,
                          color: "#002338",
                          mb: 2,
                          textAlign: "left",
                          width: "100%",
                        }}
                      >
                        Colaboradores:
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={colaboradoresData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={75}
                            outerRadius={100}
                            fill="#8884d8"
                          >
                            {colaboradoresData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <RTooltip
                            formatter={(value) => [
                              `${value} hrs`,
                              "Horas asignadas",
                            ]}
                          />
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            iconType="circle"
                            formatter={(value, entry) => (
                              <span
                                style={{ color: "#002338", fontSize: "14px" }}
                              >
                                {value}: {entry.payload?.value ?? 0} hrs
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <Box sx={{ width: '100%', mt: 2, textAlign: 'left' }}>
                        <Typography sx={{ color: '#002338', fontWeight: 600 }}>
                          Total horas asignadas: {totalHorasColaboradores} hrs
                        </Typography>
                      </Box>
                    </Box>
                  </Grid2>

                  {rolesData.length > 0 && (
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: 18, md: "20px" },
                            fontWeight: 600,
                            color: "#002338",
                            mb: 2,
                            textAlign: "left",
                            width: "100%",
                          }}
                        >
                          Roles:
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={rolesData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={75}
                              outerRadius={100}
                              fill="#8884d8"
                            >
                              {rolesData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <RTooltip
                              formatter={(value) => [
                                `${value} hrs`,
                                "Horas asignadas",
                              ]}
                            />
                            <Legend
                              layout="vertical"
                              verticalAlign="middle"
                              align="right"
                              iconType="circle"
                              formatter={(value, entry) => (
                                <span
                                  style={{ color: "#002338", fontSize: "14px" }}
                                >
                                  {value}: {entry.payload?.value ?? 0} hrs
                                </span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Grid2>
                  )}
                </Grid2>
              )}
            </>
          ) : (
            <Typography>
              No se encontraron detalles para este proyecto.
            </Typography>
          )}
        </Card>
      </Grid2>
    </Grid2>
  );
}

interface InfoRowProps {
  label: string;
  value: string | number | null;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Typography
      sx={{
        fontSize: { xs: 16, md: "18px" },
        fontWeight: 400,
        fontFamily: "Poppins",
        color: "#002338",
        letterSpacing: "0px",
        marginBottom: "16px",
      }}
    >
      <Box component="span" sx={{ fontWeight: 600 }}>
        {label}:
      </Box>{" "}
      {value !== null && value !== undefined ? value : "-"}
    </Typography>
  );
}
