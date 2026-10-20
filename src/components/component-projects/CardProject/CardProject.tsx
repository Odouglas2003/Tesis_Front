"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/types/interface";
import { Box, Grid2, Typography, Button, Tooltip } from "@mui/material";
import { useAppTheme } from "@/app/ThemeProviderClient";
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function CardsProjects({
  searchTerm,
  projectsProp,
}: {
  searchTerm: string;
  projectsProp: Project[];
}) {
  const [filteredProjects, setFilteredProjects] =
    useState<Project[]>(projectsProp);

  const [hoveredButton, setHoveredButton] = useState<number | null>(null);
  const router = useRouter();
  const { colors } = useAppTheme();

  useEffect(() => {
    const term = (searchTerm ?? "").trim().toLowerCase();

    if (!term) {
      setFilteredProjects(projectsProp);
      return;
    }

    const filter = projectsProp.filter((proyecto: Project) => {
      const name = proyecto.name || "";
      const normalizedProjectName = name.trim().toLowerCase();
      return normalizedProjectName.includes(searchTerm.toLowerCase());
    });
    setFilteredProjects(filter);
  }, [searchTerm, projectsProp]);

  const handleMouseEnter = (index: number) => {
    setHoveredButton(index);
  };

  const handleMouseLeave: () => void = () => {
    setHoveredButton(null);
  };

  if ((searchTerm ?? "").trim() && filteredProjects.length === 0) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography sx={{ fontFamily: "Poppins", color: "#5b6b7a" }}>
          No se encontraron resultados para &quot;{searchTerm.trim()}&quot;.
        </Typography>
      </Box>
    );
  }
  return (
    <Box display="flex" justifyContent="center" mt={2}>
      <Grid2 container spacing={3} justifyContent="space-between">
        {filteredProjects.map((proyecto, index) => {
          return (
            <Grid2
              key={index}
              justifyContent="center"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              sx={{
                width: "310px",
                height: "417px",
                // Usar el color card del theme para el fondo principal
                bgcolor: colors?.card || "#002338",
                borderRadius: "29px",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.1s ease",
                border: "1px solid #CDCDCD",
                boxShadow:
                  hoveredButton === index
                    ? "0px 8px 16px rgba(0, 0, 0, 0.4)"
                    : "none",
              }}
            >
              {hoveredButton === index ? (
                <Grid2
                  sx={{
                    marginTop: "40px",
                  }}
                >
                  <Box sx={{ marginTop: "65px" }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, textAlign: 'center' }}>                        {(() => {
                        const st = (proyecto.status || '')
                        if (st.includes('En curso')) {
                          return (
                            <Tooltip title={`Estado: ${proyecto.status}`} arrow>
                              <HourglassBottomIcon sx={{ color: '#FFD54F' }} />
                            </Tooltip>
                          );
                        }
                        if (st.includes('Finalizado')) {
                          return (
                            <Tooltip title={`Estado: ${proyecto.status}`} arrow>
                              <DoneAllIcon sx={{ color: '#4CAF50' }} />
                            </Tooltip>
                          );
                        }
                        if (st.includes('A iniciar')) {
                          return (
                            <Tooltip title={`Estado: ${proyecto.status}`} arrow>
                              <FiberManualRecordIcon sx={{ color: '#0087FF' }} />
                            </Tooltip>
                          );
                        }
                        return null;
                      })()}
                        <Typography
                          sx={{
                            fontSize: "24px",
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            color: "#FFFFFF",
                          }}
                        >
                          {proyecto.name}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "20px",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        // Solo el texto del cliente usa el color de texto del theme
                        color: colors?.text || "#23FFDC",
                        textAlign: "center",
                        transition: 'color .25s ease'
                      }}
                    >
                      {proyecto.client}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        color: "#FFFFFF",
                        textAlign: "center",
                        marginTop: "20px",
                      }}
                    >
                      Project Manager: {proyecto.managerName}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "18px",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        color: "#FFFFFF",
                        textAlign: "center",
                        marginTop: "20px",
                      }}
                    >
                      Staff Asignado:{" "}
                      {proyecto.assignedPersons
                        ? proyecto.assignedPersons.length
                        : 0}
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
                        bgcolor: colors?.button || '#0087FF',
                        borderRadius: '20px',
                        width: '100%',
                        height: '50px',
                        textTransform: 'none',
                        transition: 'background-color .25s ease, opacity .25s ease',
                        '&:hover': {
                          bgcolor: colors?.button || '#0087FF',
                          opacity: 0.85,
                        },
                        '&:active': {
                          bgcolor: colors?.button || '#0087FF',
                          opacity: 0.75,
                        },
                      }}
                      onClick={() => {
                        router.push(
                          `/pages/detail/project_detail/${proyecto.id}`
                        );
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "20px",
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          textAlign: "center",
                          color: colors?.background || '#002338',
                          lineHeight: "100%",
                        }}
                      >
                        Ver más
                      </Typography>
                    </Button>
                  </Box>
                </Grid2>
              ) : (
                <>
                  <Box
                    sx={{
                      bgcolor: "#fff",
                      position: "relative",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <img
                      src={proyecto.image || "/image-login.png"}
                      alt={proyecto.name || ""}
                    // layout="fill"
                    // objectFit="scale-down"
                    />
                  </Box>

                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      width: "100%",
                      height: "88.92px",
                      bgcolor: "#fff",
                      p: "14px 20px",
                      color: "#002338",
                      alignItems: "left",
                      textAlign: "left",
                      transition: "all 2s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0px -4px 4px rgba(0, 0, 0, 0.25)",
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'flex-start', gap: 1, maxWidth: '85%', textAlign: 'left' }}>
                        {(() => {
                          const st = (proyecto.status || '')
                          if (st.includes('En curso')) {
                            return (
                              <Tooltip title={`Estado: ${proyecto.status}`} arrow>
                                <HourglassBottomIcon sx={{ color: '#FFD54F' }} />
                              </Tooltip>
                            );
                          }
                          if (st.includes('Finalizado')) {
                            return (
                              <Tooltip title={`Estado: ${proyecto.status}`} arrow>
                                <DoneAllIcon sx={{ color: '#4CAF50' }} />
                              </Tooltip>
                            );
                          }
                          if (st.includes('A iniciar')) {
                            return (
                              <Tooltip title={`Estado: ${proyecto.status}`} arrow>
                                <FiberManualRecordIcon sx={{ color: '#0087FF' }} />
                              </Tooltip>
                            );
                          }
                          return null;
                        })()}
                        <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>{proyecto.name}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </Grid2>
          );
        })}
      </Grid2>
    </Box>
  );
}
