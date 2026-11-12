"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Project } from "@/types/interface";
import { Box, Typography, Tooltip } from "@mui/material";
import { useAppTheme } from "@/app/ThemeProviderClient";
import { UI, cardSx } from "@/theme/appPalette";
import { formatDate as formatDateUtil } from "@/utils/utils";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  activo: { bg: "#DDF5F1", color: "#0B5F58" },
  "en curso": { bg: "#DDF5F1", color: "#0B5F58" },
  planificacion: { bg: "#E9EEF3", color: "#32475B" },
  "a iniciar": { bg: "#E3F1FB", color: "#154A7D" },
  "en pausa": { bg: "#FEF3C7", color: "#7C4A03" },
  finalizado: { bg: "#E9EEF3", color: "#32475B" },
};

const normalize = (value?: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();

const formatDate = (value: Date | string | null | undefined) => (value ? formatDateUtil(value) || "Sin definir" : "Sin definir");

const initialsOf = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

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

export default function CardsProjects({
  searchTerm,
  projectsProp,
}: {
  searchTerm: string;
  projectsProp: Project[];
}) {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projectsProp);
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

  if ((searchTerm ?? "").trim() && filteredProjects.length === 0) {
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
      {filteredProjects.map((proyecto) => {
        const statusStyle = STATUS_STYLES[normalize(proyecto.status)] ?? { bg: "#E9EEF3", color: "#32475B" };
        const team = Array.isArray(proyecto.assignedPersons) ? proyecto.assignedPersons : [];
        const hours = team.reduce((sum, person) => sum + (Number(person.horasAsignadas) || 0), 0);
        const subtitle = [proyecto.client, proyecto.category].filter(Boolean).join(" · ");

        return (
          <Link
            key={proyecto.id}
            href={`/pages/detail/project_detail/${proyecto.id}`}
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
                gap: 2,
                transition: "border-color .2s ease, box-shadow .2s ease",
                "&:hover": { borderColor: UI.borderStrong, boxShadow: "0 4px 14px rgba(15,34,51,0.08)" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                {proyecto.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={proyecto.image}
                    alt=""
                    width={40}
                    height={40}
                    style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: `1px solid ${UI.border}` }}
                  />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography component="h2" sx={{ fontSize: "1.0625rem", fontWeight: 700, color: UI.ink, lineHeight: 1.3 }}>
                    {proyecto.name}
                  </Typography>
                  {subtitle && (
                    <Typography sx={{ fontSize: "0.8125rem", color: UI.muted }} noWrap>
                      {subtitle}
                    </Typography>
                  )}
                </Box>
                {proyecto.status && (
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
                    {proyecto.status}
                  </Box>
                )}
              </Box>

              <Box
                component="dl"
                sx={{ m: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px 16px" }}
              >
                <Fact label="Fase" value={proyecto.phase || "Sin definir"} />
                <Fact label="Project Manager" value={proyecto.managerName || "Sin asignar"} />
                <Fact label="Inicio" value={formatDate(proyecto.startDate)} />
                <Fact label="Fin" value={formatDate(proyecto.endDate)} />
              </Box>

              <Box
                sx={{
                  mt: "auto",
                  pt: 1.75,
                  borderTop: `1px solid ${UI.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", pl: team.length ? 0.75 : 0 }}>
                  {team.slice(0, 4).map((person) => (
                    <Tooltip key={person.id} title={`${person.name} · ${person.rol}`} arrow>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          ml: "-6px",
                          borderRadius: "50%",
                          border: "2px solid #FFFFFF",
                          backgroundColor: UI.avatarBg,
                          color: "#12304D",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {initialsOf(person.name)}
                      </Box>
                    </Tooltip>
                  ))}
                  <Typography component="span" sx={{ ml: team.length ? 1.25 : 0, fontSize: "0.8125rem", color: UI.muted }}>
                    {team.length === 1 ? "1 persona" : `${team.length} personas`}
                  </Typography>
                </Box>
                <Typography
                  component="span"
                  sx={{ fontSize: "0.8125rem", fontWeight: 700, color: UI.ink, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}
                >
                  {hours} h asignadas
                </Typography>
              </Box>
            </Box>
          </Link>
        );
      })}
    </Box>
  );
}
