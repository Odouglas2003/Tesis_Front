"use client";

import {
  Box,
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
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Employee, ProjectNew } from "@/types/interface";
import { formatDate, formatId } from "@/utils/utils";

import { useAuthRole, isEmployeeUnderManager } from "@/app/hooks/useAuthRole";
import { UI, cardSx } from "@/theme/appPalette";
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

  const COLORS = ["#1D5FA0", "#14B8A6", "#C2410C", "#9DB4CA", "#7C4A03"];
  const totalHours = donutData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const fullName = `${colabProp.first_name ?? ""} ${colabProp.last_name ?? ""}`.trim();
  const initials = `${colabProp.first_name?.[0] ?? ""}${colabProp.last_name?.[0] ?? ""}`.toUpperCase();
  const rolesText = Array.isArray(colabProp.roles)
    ? colabProp.roles.map((role) => [role.rol, role.seniority].filter(Boolean).join(" · ")).join(" / ")
    : String(colabProp.roles ?? "");
  const techs = Array.isArray(colabProp.tecnologias)
    ? colabProp.tecnologias.filter(Boolean)
    : colabProp.tecnologias
      ? [String(colabProp.tecnologias)]
      : [];
  const contractEnd = colabProp.fin_contrato ? new Date(colabProp.fin_contrato) : null;
  const daysLeft =
    contractEnd && !Number.isNaN(contractEnd.getTime())
      ? Math.ceil((contractEnd.getTime() - Date.now()) / 86400000)
      : null;
  const contractAlert =
    daysLeft === null
      ? null
      : daysLeft < 0
        ? { label: "Contrato vencido", bg: "#FDE7DC", color: "#8A2F0A" }
        : daysLeft <= 30
          ? { label: "Contrato por vencer", bg: "#FEF3C7", color: "#7C4A03" }
          : null;
  const JornadaIcon =
    jornadaName === "Part Time"
      ? AccessTimeIcon
      : jornadaName === "Pasante"
        ? SchoolIcon
        : jornadaName === "Especial 1: 120hr"
          ? WorkspacePremiumIcon
          : jornadaName === "Especial 2: 60hr"
            ? StarHalfIcon
            : WorkIcon;
  const metaSx = { display: "flex", alignItems: "center", gap: 1, fontSize: "0.875rem", color: UI.inkSoft };
  const metaIconSx = { fontSize: 18, color: UI.muted };
  const h2Sx = { fontSize: "1rem", fontWeight: 700, color: UI.ink };

  return (
    <Box
      component="main"
      sx={{
        maxWidth: UI.maxWidth,
        mx: "auto",
        px: { xs: 2, md: 3 },
        pb: { xs: 5, md: 7 },
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      <Button
        onClick={handleBack}
        startIcon={<KeyboardArrowLeftIcon />}
        sx={{ alignSelf: "flex-start", minHeight: 44, color: UI.blue, fontWeight: 600, textTransform: "none", ml: -1 }}
      >
        Colaboradores
      </Button>

      <Box
        component="section"
        sx={{ ...cardSx, p: { xs: 2.5, md: 3.5 }, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 3 }}
      >
        <Avatar
          src={colabProp.image || undefined}
          alt=""
          sx={{ width: 88, height: 88, fontSize: 28, fontWeight: 700, bgcolor: UI.avatarBg, color: "#12304D" }}
        >
          {initials}
        </Avatar>
        <Box sx={{ flex: "1 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
            <Typography
              component="h1"
              sx={{ fontSize: { xs: "1.4rem", md: "1.625rem" }, fontWeight: 700, letterSpacing: "-0.02em", color: UI.ink, lineHeight: 1.2 }}
            >
              {fullName}
            </Typography>
            {contractAlert && (
              <Box
                component="span"
                sx={{ px: 1.1, py: 0.4, borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, backgroundColor: contractAlert.bg, color: contractAlert.color }}
              >
                {contractAlert.label}
              </Box>
            )}
          </Box>
          {rolesText && (
            <Typography sx={{ fontSize: "0.9375rem", fontWeight: 600, color: UI.blue }}>{rolesText}</Typography>
          )}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px 24px" }}>
            <Box sx={metaSx}>
              <EmailIcon sx={metaIconSx} />
              {colabProp.email}
            </Box>
            <Box sx={metaSx}>
              <BadgeIcon sx={metaIconSx} />
              {formatId(colabProp.dni)}
            </Box>
            {jornadaName && (
              <Box sx={metaSx}>
                <JornadaIcon sx={metaIconSx} />
                {jornadaName}
              </Box>
            )}
            <Box sx={metaSx}>
              <CalendarTodayIcon sx={metaIconSx} />
              Ingreso {colabProp.start_contrato ? formatDate(colabProp.start_contrato) : "N/A"}
            </Box>
            <Box sx={metaSx}>
              <CalendarTodayIcon sx={metaIconSx} />
              Caducidad {colabProp.fin_contrato ? formatDate(colabProp.fin_contrato) : "N/A"}
            </Box>
          </Box>
          <Typography sx={{ fontSize: "0.8125rem", color: UI.muted }}>
            Última vez editado por: {colabProp.last_edited_by}{" "}
            {colabProp.last_edited_on ? formatDate(colabProp.last_edited_on) : ""}
          </Typography>
        </Box>
        <Tooltip title={canManage ? "Editar" : "No podés editar este colaborador"}>
          <span>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              disabled={!canManage}
              onClick={() => router.push(`/pages/edit/employe/${colabProp.id}`)}
              sx={{
                minHeight: 44,
                px: 2,
                borderRadius: "8px",
                borderColor: UI.borderStrong,
                color: "#12304D",
                backgroundColor: "#FFFFFF",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { borderColor: "#8FA3B6", backgroundColor: UI.surfaceMuted },
              }}
            >
              Editar
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-start" }}>
        <Box sx={{ flex: "2 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box component="section" sx={{ ...cardSx, p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap" }}>
              <Typography component="h2" sx={h2Sx}>
                Proyectos asignados
              </Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: UI.muted }}>
                {colabProp.horasAsignadas !== undefined && colabProp.horasAsignadas !== null
                  ? `${colabProp.horasAsignadas} h/semana en total`
                  : ""}
              </Typography>
            </Box>
            {Array.isArray(colabProp.Proyectos) && colabProp.Proyectos.length > 0 ? (
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                {colabProp.Proyectos.map((proy, idx) => (
                  <Box
                    component="li"
                    key={idx}
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "8px 16px",
                      px: 2,
                      py: 1.75,
                      border: `1px solid ${UI.border}`,
                      borderRadius: "8px",
                    }}
                  >
                    <Box sx={{ flex: "1 1 260px", minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: UI.ink }}>
                        {typeof proy.projectId === "object" && proy.projectId?.name
                          ? proy.projectId.name
                          : String(proy.projectId)}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8125rem", color: UI.muted }}>
                        {[proy.rol, proy.seniority].filter(Boolean).join(" · ")}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: UI.ink, fontVariantNumeric: "tabular-nums" }}>
                      {proy.horasAsignadas ?? 0} h
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography sx={{ fontSize: "0.875rem", color: UI.muted }}>Sin asignaciones.</Typography>
            )}
          </Box>

          <Box component="section" sx={{ ...cardSx, p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography component="h2" sx={h2Sx}>
              Tecnologías
            </Typography>
            {techs.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {techs.map((tech) => (
                  <Box
                    component="span"
                    key={tech}
                    sx={{ px: 1.5, py: 0.6, borderRadius: "6px", backgroundColor: UI.track, color: UI.inkSoft, fontSize: "0.8125rem", fontWeight: 600 }}
                  >
                    {tech}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography sx={{ fontSize: "0.875rem", color: UI.muted }}>Sin tecnologías cargadas.</Typography>
            )}
          </Box>

          <Box component="section" sx={{ ...cardSx, p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography component="h2" sx={h2Sx}>
              Último cambio
            </Typography>
            <CollaboratorHistory collaboratorId={colabProp.id} />
          </Box>
        </Box>

        <Box sx={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box component="section" sx={{ ...cardSx, p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography component="h2" sx={h2Sx}>
              Distribución en proyectos
            </Typography>
            {donutData.length > 0 && totalHours > 0 ? (
              <>
                <Box aria-hidden sx={{ display: "flex", gap: "3px", height: 10, borderRadius: "999px", overflow: "hidden", backgroundColor: UI.track }}>
                  {donutData.map((entry, index) => (
                    <Box
                      key={`${entry.name}-${index}`}
                      sx={{ width: `${((Number(entry.value) || 0) / totalHours) * 100}%`, backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  ))}
                </Box>
                <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {donutData.map((entry, index) => (
                    <Box component="li" key={`${entry.name}-legend-${index}`} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "3px", backgroundColor: COLORS[index % COLORS.length], flexShrink: 0 }} />
                      <Typography component="span" sx={{ flex: 1, minWidth: 0, fontSize: "0.875rem", color: UI.inkSoft }}>
                        {entry.name}
                      </Typography>
                      <Typography component="span" sx={{ fontSize: "0.875rem", fontWeight: 700, color: UI.ink, fontVariantNumeric: "tabular-nums" }}>
                        {Math.round(((Number(entry.value) || 0) / totalHours) * 100)}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            ) : (
              <Typography sx={{ fontSize: "0.875rem", color: UI.muted }}>
                No hay datos de proyectos para mostrar.
              </Typography>
            )}
          </Box>

          <Box component="section" sx={{ ...cardSx, p: 3, display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography component="h2" sx={h2Sx}>
              Desempeño
            </Typography>
            <Typography sx={{ fontSize: "0.875rem", color: colabProp.observacion ? UI.ink : UI.muted }}>
              {colabProp.observacion ? colabProp.observacion : "Sin evaluación cargada."}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
