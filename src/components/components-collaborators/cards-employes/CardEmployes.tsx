"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Employee } from "@/types/interface";
import { Box, Grid2, Typography, Button, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAppTheme } from "@/app/ThemeProviderClient";

interface Props {
  searchTerm: string;
  collaboratorProp: Employee[];
}
export default function CardsEmployes({
  searchTerm,
  collaboratorProp,
}: Props) {
  const { colors } = useAppTheme();
  const [filteredEmployee, setFilteredEmployee] = useState<Employee[]>([]);
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);
  const router = useRouter();
  useEffect(() => {
    const normalize = (s?: string | number) =>
      (s === undefined || s === null ? "" : String(s))
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim();

    type ProjectIdLike = { id?: string; _id?: string; name?: string; nombre?: string } | string;
    type ProjectEntry = { projectId?: ProjectIdLike; projectName?: string; name?: string };

    const empleadosTransformados: Employee[] = (collaboratorProp ?? []).map((item) => ({
      ...item,
      // guardo completos
      first_nameS: item.first_name,
      last_nameS: item.last_name,
      // muestro solo el primer nombre/apellido
      first_name: item.first_name?.split(" ")[0] || "",
      last_name: item.last_name?.split(" ")[0] || "",
    }));

    const term = normalize(searchTerm);

    if (!term) {
      setFilteredEmployee(empleadosTransformados);
      return;
    }

    const result = empleadosTransformados.filter((v) => {
      const byFullNombre = normalize(`${v.first_nameS ?? ""} ${v.last_nameS ?? ""}`).includes(term);
      const rolesText = (v.roles ?? [])
        .map((r) => `${r.rol ?? ""} ${r.seniority ?? ""}`)
        .join(" ");
      const byRoles = normalize(rolesText).includes(term);
      const projectNames = (Array.isArray(v.Proyectos) ? v.Proyectos : [])
        .map((p: ProjectEntry) => {
          const pid = p?.projectId;
          if (pid && typeof pid === "object") {
            // populated object
            return pid.name ?? pid.nombre ?? "";
          }
          if (typeof pid === "string") {
            return pid;
          }
          // fallback to auxiliary names
          return p.projectName ?? p.name ?? "";
        })
        .filter(Boolean)
        .join(" ");
      const byProyectos = normalize(projectNames).includes(term);

      // DNI
      const byDni = normalize(v.dni ?? "").includes(term);

      return byFullNombre || byRoles || byProyectos || byDni;
    });

    setFilteredEmployee(result);
  }, [collaboratorProp, searchTerm]);


  const handleMouseEnter = (index: number) => {
    setHoveredButton(index);
  };
  const handleMouseLeave: () => void = () => {
    setHoveredButton(null);
  };
  return (
    <Box display="flex" justifyContent="center" mt={1}>
      <Grid2 container spacing={3} justifyContent="space-between" >
        {filteredEmployee.map((empleado, index) => (
          <Grid2
            key={index}
            justifyContent="center"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            sx={{
              width: "247px",
              height: "318px",
              bgcolor: colors?.card || "#ffffff",
              borderRadius: "29px",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.493)",

              transition: "all 0.3s ease",
            }}
          >
            {hoveredButton === index ? (
              <Grid2
                sx={{
                  marginTop: "20px",
                  marginLeft: "10px",
                  marginRight: "10px",
                }}
              >
                <Box>
                  <Typography
                    textAlign="center"
                    sx={{
                      fontSize: "20px",
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      color: "#FFFFFF",
                    }}
                  >
                    {`${empleado.last_name} ${empleado.first_name} `}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "18px",
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      color: colors?.text || "#1CFFF9",
                      textAlign: "center",
                    }}
                  >
                    {empleado.roles && empleado.roles.length > 0
                      ? empleado.roles.map((r) => r.rol).join(" / ")
                      : ""}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      color: "#FFFFFF",
                      textAlign: "center",
                      marginTop: "5px",
                    }}
                  >
                    Proyectos:
                  </Typography>
                  <Box sx={{ height: "104px" }}>
                    {Array.isArray(empleado.Proyectos) && empleado.Proyectos.length > 0 ? (
                      empleado.Proyectos
                        .filter((p) => p.projectId && typeof p.projectId !== "string")
                        .map((p, idx) => {
                          const pr =
                            typeof p.projectId === "object" && p.projectId !== null
                              ? (p.projectId as { id?: string; _id?: string; name?: string })
                              : undefined;
                          const pid = pr?.id ?? pr?._id ?? `${empleado.id}-${idx}`;
                          const pname = pr?.name ?? "";

                          return (
                            <Typography
                              key={String(pid)}
                              sx={{
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                fontWeight: 500,
                                color: "#FFFFFF",
                                textAlign: "center",
                              }}
                            >
                              • {pname}
                            </Typography>
                          );
                        })
                    ) : (
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          color: "#FFFFFF",
                          textAlign: "center",
                        }}
                      >
                        No hay proyectos asignados
                      </Typography>
                    )}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      color: "#FFFFFF",
                      textAlign: "center",
                    }}
                  >
                    Horas asignadas: {`${empleado.horasAsignadas || 0}hs`}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "80%",
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: colors?.button || "#0087FF",
                      borderRadius: "20px",
                      marginTop: "20px",
                      width: "100%",
                      height: "40px",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "#23FFDC",
                      },
                      "&:active": {
                        bgcolor: "#23FFDC",
                      },
                    }}
                    onClick={() =>
                      router.push(
                        `/pages/detail/collaborator_detail/${empleado.id}`
                      )
                    }
                  >
                    <Typography
                      sx={{
                        fontSize: "18px",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        textAlign: "center",
                        color: "#002338",
                        lineHeight: "100%",
                      }}
                    >
                      Ver Perfil
                    </Typography>
                  </Button>
                </Box>
              </Grid2>
            ) : (
              <>
                <Box className="profile-pic">
                  <Image
                    src={empleado.image ? empleado.image : "/anonimo.jpeg"}
                    alt={`${empleado.last_name}${empleado.first_name}`}
                    layout="fill"
                    objectFit="cover"
                  />
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    height: "68px",
                    bgcolor: colors?.card || "#002338",
                    p: "5px 20px",
                    color: "white",
                    textAlign: "center",
                    transition: "all 2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <Typography variant="h6">
                    {empleado.last_name} {empleado.first_name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={colors?.text || "#23FFDC"}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      fontSize: "16px",
                      fontFamily: "Poppins",
                      fontWeight: 500,
                    }}
                  >
                    {empleado.roles?.[0]?.rol || ""}
                    {empleado.roles && empleado.roles.length > 1 && (
                      <Tooltip
                        title={
                          <Box>
                            {empleado.roles.slice(1).map((r, i) => (
                              <div key={i}>
                                Rol adicional: {r.rol} - {r.seniority}
                              </div>
                            ))}
                          </Box>
                        }
                        arrow
                        placement="top"
                      >
                        <span
                          style={{
                            background: "#0087FF",
                            color: "#fff",
                            borderRadius: "50%",
                            padding: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            marginLeft: "4px",
                            display: "inline-block",
                          }}
                        >
                          +{empleado.roles.length - 1}
                        </span>
                      </Tooltip>
                    )}
                  </Typography>
                </Box>
              </>
            )}
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
}
