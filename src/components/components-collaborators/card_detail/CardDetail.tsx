"use client";

import {
  Grid2,
  Box,
  Card,
  Divider,
  Typography,
  Avatar,
  Button,
  Tooltip,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import BadgeIcon from "@mui/icons-material/Badge";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Employee, ProjectNew } from "@/types/interface";
import { formatDate, formatId } from "@/utils/utils";

import { useAuthRole, isEmployeeUnderManager } from "@/app/hooks/useAuthRole";
import { useAppTheme } from "@/app/ThemeProviderClient";
import CollaboratorHistory from "./CollaboratorHistory"
import {
  fetchProjects,
} from "@/services/api";

export default function CollaboratorDetail({
  colabProp,
}: {
  colabProp: Employee;
}) {
  const router = useRouter();
  const { colors } = useAppTheme();

  const { isAdmin, isManager, currentUserName } = useAuthRole();

  const [projects, setProjects] = useState<ProjectNew[]>([]);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await fetchProjects();
        setProjects(Array.isArray(p) ? p : []);
      } catch {
        setProjects([]);
      }
    })();
  }, []);

  const isManageable = (emp: Employee) => {
    if (isAdmin) return true;
    if (!(isManager && currentUserName)) return false;
    try {
      return isEmployeeUnderManager(emp, currentUserName as string, projects);
    } catch {
      return false;
    }
  };

  const canManage = useMemo(
    () => isManageable(colabProp),
    [isAdmin, isManager, currentUserName, projects, colabProp]
  );

  const handleBack = () => {
    router.push("/pages/collaborators");
  };


  const donutData = (colabProp?.Proyectos ?? []).map((proy) => ({
    name:
      typeof proy.projectId === "object" && proy.projectId?.name
        ? proy.projectId.name
        : String(proy.projectId),
    value: proy.horasAsignadas,
  }));
  const jornadaName =
    typeof colabProp.jornadaId === "object" && (colabProp.jornadaId)?.name
      ? (colabProp.jornadaId).name
      : String(colabProp.jornadaId ?? "");

  const COLORS = ["#7DB3FF", "#1CE6C1", "#0066FF", "#FFB347", "#FF6961"];

  return (
    <>
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
              sx={{ width: "30px", height: "30px", color: "#002338" }}
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
            <Box sx={{ display: "flex", flexDirection: "column", mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    src={colabProp.image ? colabProp.image : "/anonimo.jpeg"}
                    alt={`${colabProp.first_name} ${colabProp.last_name}`}
                    sx={{
                      width: 200,
                      height: 200,
                      mr: 4,
                      fontSize: 40,
                      bgcolor: "#e0e0e0",
                    }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: { xs: 24, md: "40px" },
                        fontFamily: "Poppins",
                        fontWeight: 600,
                        color: "#002338",
                      }}
                    >
                      {colabProp.first_name} {colabProp.last_name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: 20, md: "22px" },
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        color: "#0087FF",
                        mb: 1,
                      }}
                    >
                      {Array.isArray(colabProp.roles)
                        ? colabProp.roles
                          .map((role) => `${role.rol} - ${role.seniority}`)
                          .join(" / ")
                        : colabProp.roles}
                    </Typography>
                    <Box display="flex" alignItems="center" sx={{ gap: 4 }}>
                      <Box alignItems="center" sx={{ mb: 1, gap: 4 }}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          sx={{ mb: 1, mt: 1 }}
                        >
                          <EmailIcon sx={{ fontSize: 20, color: "#002338" }} />
                          <Typography
                            sx={{
                              fontSize: { xs: 16, md: "18px" },
                              fontFamily: "Poppins",
                              fontWeight: 400,
                              color: "#002338",
                            }}
                          >
                            {colabProp.email}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <BadgeIcon sx={{ fontSize: 20, color: "#002338" }} />
                          <Typography
                            sx={{
                              fontSize: { xs: 16, md: "18px" },
                              fontFamily: "Poppins",
                              fontWeight: 500,
                              color: "#002338",
                            }}
                          >
                            {formatId(colabProp.dni)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box alignItems="center" sx={{ gap: 4 }}>
                        <Box alignItems="center" sx={{ gap: 4 }}>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            sx={{ mb: 1 }}
                          >
                            <CalendarTodayIcon
                              sx={{ fontSize: 18, color: "#002338" }}
                            />
                            <Typography
                              sx={{
                                fontSize: { xs: 15, md: "16px" },
                                fontFamily: "Poppins",
                                fontWeight: 400,
                                color: "#002338",
                              }}
                            >
                              Ingreso:{" "}
                              {colabProp.start_contrato
                                ? formatDate(colabProp.start_contrato)
                                : "N/A"}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            {jornadaName === "Part Time" && (
                              <AccessTimeIcon sx={{ color: "#002338" }} />
                            )}
                            {jornadaName === "Full Time" && (
                              <WorkIcon sx={{ color: "#002338" }} />
                            )}
                            {jornadaName === "Pasante" && (
                              <SchoolIcon sx={{ color: "#002338" }} />
                            )}
                            {jornadaName === "Especial 1: 120hr" && (
                              <WorkspacePremiumIcon sx={{ color: "#002338" }} />
                            )}
                            {jornadaName === "Especial 2: 60hr" && (
                              <StarHalfIcon sx={{ color: "#002338" }} />
                            )}
                            <Typography
                              sx={{
                                fontSize: { xs: 16, md: "18px" },
                                fontFamily: "Poppins",
                                fontWeight: 400,
                                color: "#002338",
                              }}
                            >
                              {jornadaName}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box alignItems="center" sx={{ gap: 4 }}>
                        <Box alignItems="center" sx={{ gap: 3 }}>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            sx={{ mb: 4.5 }}
                          >
                            <CalendarTodayIcon
                              sx={{ fontSize: 18, color: "#002338" }}
                            />
                            <Typography
                              sx={{
                                fontSize: { xs: 15, md: "16px" },
                                fontFamily: "Poppins",
                                fontWeight: 400,
                                color: "#002338",
                              }}
                            >
                              Caducidad:{" "}
                              {colabProp.fin_contrato
                                ? formatDate(colabProp.fin_contrato)
                                : "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: { xs: 16, md: "14px" },
                        fontFamily: "Poppins",
                        fontWeight: 400,
                        color: "#606060",
                      }}
                    >
                      Última vez editado por: {colabProp.last_edited_by}{" "}
                      {colabProp.last_edited_on
                        ? formatDate(colabProp.last_edited_on)
                        : ""}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <Tooltip
                    title={
                      canManage
                        ? "Editar"
                        : "No podés editar este colaborador"
                    }
                  >
                    <span>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon sx={{ color: "#002338" }} />}
                        disabled={!canManage}
                        onClick={() =>
                          router.push(`/pages/edit/employe/${colabProp.id}`)
                        }
                        sx={{
                          background: colors?.button || "#1CFFF9",
                          borderRadius: "20px",
                          padding: "12px 41px",
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 500,
                          fontSize: "20px",
                          height: "50px",
                          color: "#002338",
                          boxShadow: "none",
                          textTransform: "none",
                          "&:hover": {
                            background: "#1CFFF9",
                            boxShadow: "none",
                          },
                        }}
                      >
                        Editar
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
              </Box>

              <Divider sx={{ bgcolor: "#002338", mb: 3 }} />
            </Box>

            {colabProp ? (
              <Grid2 container spacing={4}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 5 }}>
                    <Typography
                      sx={{
                        fontSize: { xs: 18, md: "20px" },
                        fontWeight: 600,
                        color: "#002338",
                        mb: 2,
                      }}
                    >
                      Proyecto:
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 24 }}>
                      {Array.isArray(colabProp.Proyectos) &&
                        colabProp.Proyectos.length > 0 ? (
                        colabProp.Proyectos.map((proy, idx) => (
                          <li
                            key={idx}
                            style={{
                              fontSize: "18px",
                              fontFamily: "Poppins, sans-serif",
                              color: "#002338",
                              marginBottom: 8,
                              listStyleType: "disc",
                            }}
                          >
                            {[
                              typeof proy.projectId === "object" && proy.projectId?.name
                                ? proy.projectId.name
                                : String(proy.projectId),
                              proy.rol,
                              proy.seniority,
                            ]
                              .filter(Boolean)
                              .join(" - ")}
                          </li>
                        ))
                      ) : (
                        <li
                          style={{
                            fontSize: "18px",
                            fontFamily: "Poppins, sans-serif",
                            color: "#002338",
                          }}
                        >
                          Sin asignaciones
                        </li>
                      )}
                    </ul>
                  </Box>
                  <InfoRow
                    label="Tecnologías"
                    value={
                      Array.isArray(colabProp.tecnologias)
                        ? colabProp.tecnologias.join(", ")
                        : colabProp.tecnologias ?? ""
                    }
                  />
                  <InfoRow
                    label="Tiempo asignado"
                    value={
                      colabProp.horasAsignadas !== undefined && colabProp.horasAsignadas !== null
                        ? `${colabProp.horasAsignadas} h/semana`
                        : ""
                    }
                  />
                  <InfoRow
                    label="Desempeño"
                    value={colabProp.observacion ?? ""}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: 18, md: "20px" },
                        fontWeight: 600,
                        color: "#002338",
                        mb: 2,
                        textAlign: "center",
                      }}
                    >
                      Distribución en proyectos:
                    </Typography>
                    {donutData.length > 0 ? (
                      <ResponsiveContainer width="90%" height={330}>
                        <PieChart>
                          <Pie
                            data={donutData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={75}
                            outerRadius={100}
                            fill="#8884d8"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {donutData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <RTooltip />
                          <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontFamily: "Poppins",
                          color: "#666",
                          textAlign: "center",
                          mt: 4,
                        }}
                      >
                        No hay datos de proyectos para mostrar
                      </Typography>
                    )}
                  </Box>
                </Grid2>
              </Grid2>
            ) : (
              <Typography>
                No se encontraron detalles para este colaborador.
              </Typography>
            )}
            <Divider sx={{ my: 5, bgcolor: "#002338" }} />

            <Typography
              sx={{
                fontSize: { xs: 20, md: "24px" },
                fontWeight: 600,
                fontFamily: "Poppins",
                color: "#002338",
                mb: 3,
              }}
            >
              Último cambio
            </Typography>
            <CollaboratorHistory collaboratorId={colabProp.id} />
          </Card>
        </Grid2>
      </Grid2>

    </>
  );
}

interface InfoRowProps {
  label: string;
  value: string | number;
}
function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Typography
      sx={{
        fontSize: { xs: 18, md: "20px" },
        fontWeight: 400,
        fontFamily: "Poppins",
        color: "#002338",
        letterSpacing: "0px",
        marginBottom: "50px",
      }}
    >
      {label}:{" "}
      <Box component="span" sx={{ fontWeight: 400 }}>
        {value}
      </Box>
    </Typography>
  );
}
