"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { Vacancie, Employee } from "@/types/interface";
import { useAppTheme } from "@/app/ThemeProviderClient";
import { UI, cardSx } from "@/theme/appPalette";
import { formatDate as formatDateUtil } from "@/utils/utils";

interface Props {
  searchTerm: string;
  vacanciesProp: Vacancie[];
  collaboratorProp: Employee[];
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  abierta: { bg: "#E3F1FB", color: "#154A7D", label: "Abierta" },
  "en proceso": { bg: "#FEF3C7", color: "#7C4A03", label: "En proceso" },
  finalizada: { bg: "#E9EEF3", color: "#32475B", label: "Finalizada" },
};

const formatDate = (value: Date | string | null | undefined) => (value ? formatDateUtil(value) || "Sin definir" : "Sin definir");

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography component="dt" sx={{ fontSize: "0.75rem", fontWeight: 600, color: UI.muted }}>
        {label}
      </Typography>
      <Typography component="dd" sx={{ m: 0, fontSize: "0.875rem", fontWeight: 600, color: UI.ink }} noWrap title={value}>
        {value}
      </Typography>
    </Box>
  );
}

export default function CardsVacantes({ searchTerm, vacanciesProp }: Props) {
  const { colors } = useAppTheme();

  const [filteredVacancies, setFilteredVacancies] = useState<Vacancie[]>(vacanciesProp);

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

  if ((searchTerm ?? "").trim() && filteredVacancies.length === 0) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography sx={{ color: UI.muted }}>
          No se encontraron resultados para &quot;{searchTerm.trim()}&quot;.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(auto-fill, minmax(340px, 1fr))" },
        gap: 2,
      }}
    >
      {filteredVacancies.map((vacante) => {
        const statusStyle = STATUS_STYLES[(vacante.status ?? "").trim().toLowerCase()];
        const skills = (Array.isArray(vacante.skills) ? vacante.skills : [])
          .map((skill) => {
            const raw = skill as unknown as { name?: string; technologyName?: string; technologyId?: { name?: string } | string };
            if (typeof raw.technologyId === "object" && raw.technologyId?.name) return raw.technologyId.name;
            return raw.name ?? raw.technologyName ?? "";
          })
          .filter(Boolean);

        return (
          <Link
            key={vacante.id}
            href={`/pages/detail/VacanciesDetail/${vacante.id}`}
            style={{ textDecoration: "none", color: "inherit", display: "block" }}
          >
            <Box
              component="article"
              sx={{
                ...cardSx,
                backgroundColor: colors?.card || "#FFFFFF",
                height: "100%",
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 1.75,
                transition: "border-color .2s ease, box-shadow .2s ease",
                "&:hover": { borderColor: UI.borderStrong, boxShadow: "0 4px 14px rgba(15,34,51,0.08)" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography component="h2" sx={{ fontSize: "1.0625rem", fontWeight: 700, color: UI.ink, lineHeight: 1.3 }}>
                    {vacante.vacancieName}
                  </Typography>
                  <Typography sx={{ fontSize: "0.8125rem", color: UI.muted }} noWrap>
                    {vacante.projectId?.name || "Sin proyecto asignado"}
                  </Typography>
                </Box>
                {statusStyle && (
                  <Box
                    component="span"
                    sx={{
                      px: 1.25,
                      py: 0.4,
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                    }}
                  >
                    {statusStyle.label}
                  </Box>
                )}
              </Box>

              {vacante.description && (
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: UI.inkSoft,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {vacante.description}
                </Typography>
              )}

              {skills.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {skills.slice(0, 5).map((skill) => (
                    <Box
                      component="span"
                      key={skill}
                      sx={{
                        px: 1.25,
                        py: 0.4,
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: UI.track,
                        color: UI.inkSoft,
                      }}
                    >
                      {skill}
                    </Box>
                  ))}
                </Box>
              )}

              <Box
                component="dl"
                sx={{
                  m: 0,
                  mt: "auto",
                  pt: 1.75,
                  borderTop: `1px solid ${UI.border}`,
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "12px 16px",
                }}
              >
                <Fact label="Seniority" value={vacante.seniority || "Sin definir"} />
                <Fact label="Horas requeridas" value={`${vacante.time ?? 0} h`} />
                <Fact label="Fecha de pedido" value={formatDate(vacante.orderDate)} />
                <Fact label="Fecha de inicio" value={formatDate(vacante.startDate)} />
                <Fact label="Project Manager" value={vacante.manager_name || "Sin asignar"} />
              </Box>
            </Box>
          </Link>
        );
      })}
    </Box>
  );
}
