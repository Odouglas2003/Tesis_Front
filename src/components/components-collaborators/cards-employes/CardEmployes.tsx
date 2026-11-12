"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Employee } from "@/types/interface";
import Link from "next/link";
import { Box, Typography, Tooltip } from "@mui/material";
import { useAppTheme } from "@/app/ThemeProviderClient";
import { UI, cardSx } from "@/theme/appPalette";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Asignado: { bg: "#DDF5F1", color: "#0B5F58" },
  Subasignado: { bg: "#E3F1FB", color: "#154A7D" },
  "Sin asignación": { bg: "#E9EEF3", color: "#32475B" },
  Sobreasignado: { bg: "#FDE7DC", color: "#8A2F0A" },
};

interface Props {
  searchTerm: string;
  collaboratorProp: Employee[];
}

const getContractAlert = (endDate: Employee["fin_contrato"]) => {
  if (!endDate) return null;
  const contractEnd = new Date(endDate);
  if (Number.isNaN(contractEnd.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  contractEnd.setHours(23, 59, 59, 999);
  const daysLeft = Math.ceil(
    (contractEnd.getTime() - today.getTime()) / 86400000
  );

  if (daysLeft < 0) return { bg: "#FDE7DC", color: "#8A2F0A", label: "Contrato vencido" };
  if (daysLeft <= 30) return { bg: "#FEF3C7", color: "#7C4A03", label: "Contrato por vencer" };
  return null;
};

export default function CardsEmployes({
  searchTerm,
  collaboratorProp,
}: Props) {
  const { colors } = useAppTheme();
  const [filteredEmployee, setFilteredEmployee] = useState<Employee[]>([]);
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


  if ((searchTerm ?? "").trim() && filteredEmployee.length === 0) {
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
      {filteredEmployee.map((empleado) => {
        const contractAlert = getContractAlert(empleado.fin_contrato);
        const fullName = `${empleado.first_name ?? ""} ${empleado.last_name ?? ""}`.trim();
        const initials = `${empleado.first_name?.[0] ?? ""}${empleado.last_name?.[0] ?? ""}`.toUpperCase();
        const mainRole = empleado.roles?.[0];
        const extraRoles = (empleado.roles ?? []).slice(1);
        const techs = (Array.isArray(empleado.tecnologias) ? empleado.tecnologias : []).filter(
          (t) => typeof t === "string" && t.trim() && !/^[0-9a-f]{24}$/i.test(t)
        );
        const projectNames = (Array.isArray(empleado.Proyectos) ? empleado.Proyectos : [])
          .map((p) =>
            typeof p.projectId === "object" && p.projectId !== null
              ? ((p.projectId as { name?: string }).name ?? "")
              : ""
          )
          .filter(Boolean);
        const status = STATUS_STYLES[empleado.estado] ? empleado.estado : null;

        return (
          <Link
            key={empleado.id}
            href={`/pages/detail/collaborator_detail/${empleado.id}`}
            style={{ textDecoration: "none", color: "inherit", display: "block" }}
          >
            <Box
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
                <Box
                  sx={{
                    position: "relative",
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    overflow: "hidden",
                    flexShrink: 0,
                    backgroundColor: UI.avatarBg,
                    color: "#12304D",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {empleado.image ? (
                    <Image src={empleado.image} alt="" fill sizes="52px" style={{ objectFit: "cover" }} />
                  ) : (
                    initials
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: UI.ink, lineHeight: 1.3 }} noWrap>
                    {fullName}
                  </Typography>
                  <Typography sx={{ fontSize: "0.8125rem", color: UI.muted, display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {mainRole ? [mainRole.rol, mainRole.seniority].filter(Boolean).join(" · ") : "Sin rol asignado"}
                    </Box>
                    {extraRoles.length > 0 && (
                      <Tooltip
                        title={
                          <Box>
                            {extraRoles.map((r, i) => (
                              <div key={i}>
                                Rol adicional: {r.rol} - {r.seniority}
                              </div>
                            ))}
                          </Box>
                        }
                        arrow
                        placement="top"
                      >
                        <Box
                          component="span"
                          sx={{
                            px: 0.75,
                            borderRadius: "999px",
                            backgroundColor: UI.blueSoft,
                            color: UI.blueSoftText,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          +{extraRoles.length}
                        </Box>
                      </Tooltip>
                    )}
                  </Typography>
                </Box>
              </Box>

              {(techs.length > 0 || status || contractAlert) && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {status && (
                    <Box
                      component="span"
                      sx={{
                        px: 1.25,
                        py: 0.4,
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        backgroundColor: STATUS_STYLES[status].bg,
                        color: STATUS_STYLES[status].color,
                      }}
                    >
                      {status}
                    </Box>
                  )}
                  {contractAlert && (
                    <Box
                      component="span"
                      sx={{
                        px: 1.25,
                        py: 0.4,
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        backgroundColor: contractAlert.bg,
                        color: contractAlert.color,
                      }}
                    >
                      {contractAlert.label}
                    </Box>
                  )}
                  {techs.slice(0, 4).map((tech) => (
                    <Box
                      component="span"
                      key={tech}
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
                      {tech}
                    </Box>
                  ))}
                  {techs.length > 4 && (
                    <Box component="span" sx={{ px: 0.5, py: 0.4, fontSize: "0.75rem", fontWeight: 600, color: UI.muted }}>
                      +{techs.length - 4}
                    </Box>
                  )}
                </Box>
              )}

              <Box
                sx={{
                  mt: "auto",
                  pt: 1.75,
                  borderTop: `1px solid ${UI.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                  fontSize: "0.8125rem",
                }}
              >
                <Typography component="span" sx={{ fontSize: "inherit", color: UI.muted, minWidth: 0 }} noWrap>
                  {projectNames.length > 0 ? projectNames.join(" · ") : "Sin proyecto asignado"}
                </Typography>
                <Typography
                  component="span"
                  sx={{ fontSize: "inherit", fontWeight: 700, color: UI.ink, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}
                >
                  {empleado.horasAsignadas || 0} h asignadas
                </Typography>
              </Box>
            </Box>
          </Link>
        );
      })}
    </Box>
  );
}
