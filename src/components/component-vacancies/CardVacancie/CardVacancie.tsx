"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Button, Grid2, Chip } from "@mui/material";
import { Vacancie, Employee } from "@/types/interface";
import { useRouter } from "next/navigation";
import { useAppTheme } from "@/app/ThemeProviderClient";


interface Props {
  searchTerm: string;
  vacanciesProp: Vacancie[];
  collaboratorProp: Employee[];
}

export default function CardsVacantes({
  searchTerm,
  vacanciesProp,
  collaboratorProp,
}: Props) {
  const router = useRouter();
  const { colors } = useAppTheme();

  const [filteredVacancies, setFilteredVacancies] =
    useState<Vacancie[]>(vacanciesProp);

  useEffect(() => {
    const term = (searchTerm ?? "").trim().toLowerCase();

    if (!term) {
      setFilteredVacancies(vacanciesProp);
      return;
    }

    const result = vacanciesProp.filter((v) => {
      const byVacName = (v.vacancieName ?? "").toLowerCase().includes(term);
      const bySeniority = (v.seniority ?? "").toLowerCase().includes(term);
      const byStatus = (v.status ?? "").toLowerCase().includes(term);

      return byVacName || bySeniority || byStatus;
    });

    setFilteredVacancies(result);
  }, [searchTerm, vacanciesProp]);

  const getStatusChipStyle = (statusRaw?: string) => {
    const status = (statusRaw ?? "").trim().toLowerCase();
    switch (status) {
      case "abierta":
        return { bg: "rgba(114,230,217,0.16)", color: colors?.primary || "#12304D", label: "Abierta" };
      case "en proceso":
        return { bg: "rgba(42,108,168,0.12)", color: colors?.primary || "#12304D", label: "En proceso" };
      case "finalizada":
        return { bg: "rgba(18,48,77,0.10)", color: colors?.primary || "#12304D", label: "Finalizada" };
      default:
        return null;
    }
  };
  if ((searchTerm ?? "").trim() && filteredVacancies.length === 0) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography sx={{ fontFamily: "Poppins", color: "#5b6b7a" }}>
          No se encontraron resultados para &quot;{searchTerm.trim()}&quot;.
        </Typography>
      </Box>
    );
  }
  return (
    <>
      <Box display="flex" justifyContent="center" mt={2}>
        <Grid2
          container
          spacing={3}
          justifyContent="space-between"
          columns={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
        >
          {filteredVacancies.map((vacante, idx) => {
            const managerNameRaw = String(vacante?.manager_name ?? "").trim();
            const managerKey = managerNameRaw.toLowerCase();

            const match = (collaboratorProp || []).find(
              (c) =>
                `${c?.first_name ?? ""} ${c?.last_name ?? ""}`
                  .trim()
                  .toLowerCase() === managerKey
            );

            const photo = match?.image;
            const displayPhoto = photo || "/anonimo.jpeg";
            const showPhoto = true;

            const chipStyle = getStatusChipStyle(vacante.status);
            const showChip = Boolean(chipStyle);
            return (
              <Grid2
                key={idx}
                sx={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
                display="flex"
                justifyContent="center"
              >
                <Grid2
                  container
                  direction="column"
                  justifyContent="space-between"
                  sx={{
                    width: "310px",
                    height: "336px",
                    bgcolor: colors?.card || "#FCFEFF",
                    borderRadius: "20px",
                    color: colors?.primary || "#12304D",
                    boxShadow: "0 18px 45px rgba(18,48,77,0.10)",
                    border: "1px solid rgba(18,48,77,0.08)",
                    position: "relative",
                    overflow: 'hidden',
                    // use internal padding so children (like the button) don't overflow
                    p: 0,
                  }}
                >
                  {/* CHIP de estado */}
                  {showChip && chipStyle && (
                    <Chip
                      label={chipStyle.label}
                      sx={{
                        position: "absolute",
                        top: "10px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        bgcolor: chipStyle.bg,
                        color: chipStyle.color,
                        fontFamily: "Poppins",
                        fontWeight: 600,
                        fontSize: "12px",
                        height: "20px",
                        zIndex: 1,
                      }}
                    />
                  )}
                  <Grid2
                    sx={{
                      pt: showChip ? "35px" : "18px",
                      px: "18px",
                      position: "relative",
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      boxSizing: 'border-box',
                      height: '100%',
                    }}
                  >
                    {/* main content grows and keeps the footer button at the bottom */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      <Typography
                      textAlign="center"
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        color: colors?.secondary || "#2A6CA8",
                        fontSize: "20px",
                        width: "100%",
                        lineHeight: "1.1",
                        marginBottom: "4px",
                      }}
                    >
                      {vacante.vacancieName}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        height: "56px",
                        alignItems: "center",
                      }}
                    >
                      {showPhoto && (
                        <Box
                          component="img"
                          src={displayPhoto}
                          alt="Profile"
                          sx={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: `2px solid ${colors?.accent || "#72E6D9"}`,
                          }}
                          loading="lazy"
                        />
                      )}
                    </Box>

                    <Typography
                      textAlign="center"
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "18px",
                        width: "255px",
                        color: colors?.primary || "#12304D",
                      }}
                    >
                      Proyecto: {vacante.projectId?.name || "No asignado"}
                    </Typography>
                    <Typography
                      textAlign="center"
                      mt={"10px"}
                      sx={{
                        fontSize: "18px",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        color: "rgba(18,48,77,0.78)",
                      }}
                    >
                      Horas requeridas: {vacante.time}
                    </Typography>
                    <Typography
                      textAlign="center"
                      mt={"10px"}
                      sx={{
                        fontSize: "18px",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        color: "rgba(18,48,77,0.78)",
                      }}
                    >
                      Seniority: {vacante.seniority}
                    </Typography>

                    </Box>

                    {/* footer with button - stays pinned to bottom */}
                    <Box sx={{ width: '100%', pb: '12px' }}>
                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: colors?.button || "#123B66",
                          borderRadius: "16px",
                          color: colors?.text || "#7DEBDC",
                          width: "100%",
                          height: "50px",
                          textTransform: "none",
                          "&:hover": {
                            bgcolor: colors?.primary || "#12304D",
                          },
                          "&:active": {
                            bgcolor: colors?.primary || "#12304D",
                          },
                        }}
                        onClick={() => {
                          router.push(
                            `/pages/detail/VacanciesDetail/${vacante.id}`
                          );
                        }}
                      >
                        <Typography
                          textAlign="center"
                          sx={{
                            fontSize: "18px",
                            color: colors?.text || "#7DEBDC",
                            fontFamily: "Poppins",
                            fontWeight: 600,
                          }}
                        >
                          Ver más
                        </Typography>
                      </Button>
                    </Box>
                  </Grid2>
                </Grid2>
              </Grid2>
            );
          })}
        </Grid2>
      </Box>
    </>
  );
}
