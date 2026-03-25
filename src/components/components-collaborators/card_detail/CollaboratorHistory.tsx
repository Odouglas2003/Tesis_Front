// components/components-collaborators/CollaboratorHistory.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  Paper,
  Grid,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import SyncAltIcon from "@mui/icons-material/SyncAlt";

import { getHistoryBlocks } from "@/services/api";

/* ============================
   Tipos que devuelve el backend
   ============================ */
type Snap = {
  projectId: string;
  projectName?: string;
  role?: string | null;
  hoursAssigned?: number | null;
};
type Updated = { before: Snap; after: Snap };
type ChangedBy = {
  _id?: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
} | null;

type HistoryBlock = {
  changeId?: string | null;
  changedBy?: ChangedBy;
  timestamp?: string | Date;
  dateKey?: string;
  previous: Snap[];
  next: Snap[];
  added: Snap[];
  removed: Snap[];
  updated: Updated[];
};

type ApiResponse = { status: "success" | "error"; history: HistoryBlock[] };

/* ================
   Utils + helpers
   ================ */
const initials = (n: string): string =>
  n
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => (x[0] ? x[0].toUpperCase() : ""))
    .join("");

const safe = (s?: string): string => (s && s.trim() ? s : "—");

const whenStr = (ts?: string | Date): string =>
  ts ? new Date(ts).toLocaleString("es-AR") : "";

/* Estilos reutilizables */
const UI = {
  card: {
    p: 2.5,
    borderRadius: "18px",
    bgcolor: "#F8FAFC",
    boxShadow: "0 4px 10px rgba(15,23,42,.06)",
  },
  panel: {
    p: 1.25,
    borderRadius: "14px",
    bgcolor: "#fff",
    border: "1px solid #E6EAF0",
  },
  section: (bg: string, border: string) => ({
    p: 1,
    borderRadius: "10px",
    bgcolor: bg,
    border: `1px solid ${border}`,
  }),
};

/* Badge mini */
function Tag({
  icon,
  children,
  tone = "neutral",
  outlined = false,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  tone?: "neutral" | "success" | "info";
  outlined?: boolean;
}) {
  const palette = {
    neutral: { bg: "#EEF2F6", bd: "#E1E8F0", fg: "#334155" },
    success: { bg: "#ECFDF5", bd: "#C8F2E3", fg: "#166534" },
    info: { bg: "#EFF6FF", bd: "#C7DBFF", fg: "#1e3a8a" },
  }[tone];

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.25,
        borderRadius: "999px",
        fontSize: 12,
        fontWeight: 600,
        bgcolor: outlined ? "transparent" : palette.bg,
        color: palette.fg,
        border: outlined ? `1px solid ${palette.bd}` : "1px solid transparent",
        lineHeight: 1.8,
      }}
    >
      {icon}
      {children}
    </Box>
  );
}

/* =========================
   Componente principal (UI)
   ========================= */
export default function CollaboratorHistory({
  collaboratorId,
}: {
  collaboratorId: string;
}) {
  const [blocks, setBlocks] = useState<HistoryBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res: ApiResponse = await getHistoryBlocks(collaboratorId);
        if (!mounted) return;
        const list = Array.isArray(res?.history) ? res.history : [];
        list.sort(
          (a, b) =>
            new Date(a.timestamp ?? 0).getTime() -
            new Date(b.timestamp ?? 0).getTime()
        );
        setBlocks(list);
      } catch {
        setBlocks([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [collaboratorId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress sx={{ color: "#002338" }} />
      </Box>
    );
  }

  if (blocks.length === 0) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography sx={{ fontSize: 16, color: "#606060", fontFamily: "Poppins" }}>
          No hay historial registrado.
        </Typography>
      </Box>
    );
  }

  return <TimelineStrip blocks={blocks} />;
}

/* =====================================
   Timeline horizontal con scroll lindo
   ===================================== */
function TimelineStrip({ blocks }: { blocks: HistoryBlock[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateBtns = () => {
    const el = ref.current;
    if (!el) return;
    const left = el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(left > 2);
    setCanRight(left < max - 2);
  };

  useEffect(() => {
    updateBtns();
    const el = ref.current;
    if (!el) return;
    const onScroll = () => updateBtns();
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [blocks.length]);

  // drag to scroll
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - el.getBoundingClientRect().left;
      scrollLeft = el.scrollLeft;
      el.style.cursor = "grabbing";
    };
    const onLeave = () => {
      isDown = false;
      el.style.cursor = "grab";
    };
    const onUp = () => {
      isDown = false;
      el.style.cursor = "grab";
    };
    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      const x = e.pageX - el.getBoundingClientRect().left;
      const walk = (x - startX) * 1;
      el.scrollLeft = scrollLeft - walk;
    };
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mousemove", onMove);
    el.style.cursor = "grab";
    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mousemove", onMove);
    };
  }, []);

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (!ref.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      ref.current.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };

  const scrollBy = (dx: number) => {
    ref.current?.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <Box sx={{ mt: 2, position: "relative" }}>
      <Box sx={{ position: "absolute", top: -8, right: 0, zIndex: 1, display: "flex", gap: 1 }}>
        <Tooltip title="Anterior">
          <span>
            <IconButton size="small" onClick={() => scrollBy(-560)} disabled={!canLeft}>
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Siguiente">
          <span>
            <IconButton size="small" onClick={() => scrollBy(560)} disabled={!canRight}>
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box
        ref={ref}
        onWheel={onWheel}
        sx={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          pb: 2,
          scrollSnapType: "x mandatory",
          "::-webkit-scrollbar": { height: 8 },
          "::-webkit-scrollbar-thumb": { background: "#cfd8e3", borderRadius: 999 },
          "::-webkit-scrollbar-track": { background: "#f1f5f9" },
        }}
      >
        {blocks.map((block, idx) => (
          <TimelineCard block={block} key={(block.changeId ?? block.dateKey ?? "") + idx} />
        ))}
      </Box>
    </Box>
  );
}

/* ===========================================
   Card de bloque (paneles + diffs estéticos)
   =========================================== */
function TimelineCard({ block }: { block: HistoryBlock }) {
  const changer =
    block.changedBy?.name ||
    [block.changedBy?.first_name, block.changedBy?.last_name].filter(Boolean).join(" ") ||
    block.changedBy?.email ||
    "Sistema";
  const ts = whenStr(block.timestamp);

  const sortByName = (a: Snap, b: Snap) =>
    (a.projectName || "").localeCompare(b.projectName || "");

  const previousSorted = [...(block.previous || [])].sort(sortByName);
  const nextSorted = [...(block.next || [])].sort(sortByName);

  return (
    <Card
      sx={{
        width: { xs: 600, sm: 700, md: 720 },
        minWidth: { xs: 340, sm: 460, md: 560 },
        scrollSnapAlign: "start",
        ...UI.card,
      }}
    >
      <Grid container columnSpacing={2} rowSpacing={1}>
        <Grid item xs={12} sm={5.8}>
          <Paper elevation={0} sx={UI.panel}>
            <Typography sx={{ color: "#64748b", fontSize: 12, mb: 0.75 }}>
              Anterior
            </Typography>
            {previousSorted.length ? (
              <SnapList snaps={previousSorted} />
            ) : (
              <EmptyCard />
            )}
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          sm={0.4}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 52,
          }}
        >
          <ArrowForwardIcon sx={{ color: "#3b82f6", fontSize: 28 }} />
        </Grid>

        <Grid item xs={12} sm={5.8}>
          <Paper elevation={0} sx={UI.panel}>
            <Typography sx={{ color: "#64748b", fontSize: 12, mb: 0.75 }}>
              Nuevo
            </Typography>
            {nextSorted.length ? <SnapList snaps={nextSorted} /> : <EmptyCard />}
          </Paper>
        </Grid>
      </Grid>

      <Stack gap={1.25} sx={{ mt: 1.5 }}>
        {block.added?.length > 0 && (
          <Box sx={UI.section("#F6FFFB", "#D7F5E9")}>
            <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Tag tone="success" icon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}>
                Agregados
              </Tag>
            </Stack>
            <SnapList snaps={[...block.added].sort(sortByName)} compact />
          </Box>
        )}

        {block.removed?.length > 0 && (
          <Box sx={UI.section("#FFF7F7", "#F5D6D6")}>
            <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Tag tone="neutral" outlined icon={<RemoveCircleOutlineIcon sx={{ fontSize: 16 }} />}>
                Removidos
              </Tag>
            </Stack>
            <SnapList snaps={[...block.removed].sort(sortByName)} compact muted />
          </Box>
        )}

        {block.updated?.length > 0 && (
          <Box sx={UI.section("#F7FAFF", "#D9E6FF")}>
            <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Tag tone="info" icon={<SyncAltIcon sx={{ fontSize: 16 }} />}>
                Actualizados
              </Tag>
            </Stack>
            <Stack gap={0.6}>
              {block.updated.map((u, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SnapPill snap={u.before} compact />
                  <ArrowForwardIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                  <SnapPill snap={u.after} compact highlight />
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>

      <Box
        sx={{
          mt: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Typography sx={{ fontSize: 12.5, color: "#6b7280" }}>{ts}</Typography>
        <Tag icon={<PersonOutlineIcon sx={{ fontSize: 16 }} />}>
          Modificado por: {changer}
        </Tag>
      </Box>
    </Card>
  );
}

/* =================================
   Lista y “pastillitas” de proyectos
   ================================= */
function SnapList({
  snaps,
  compact = false,
  muted = false,
}: {
  snaps: Snap[];
  compact?: boolean;
  muted?: boolean;
}) {
  return (
    <Stack gap={0.6}>
      {snaps.map((s, i) => (
        <SnapPill key={i} snap={s} compact={compact} muted={muted} />
      ))}
    </Stack>
  );
}

/* Rol y horas uno arriba del otro */
function SnapPill({
  snap,
  compact = false,
  muted = false,
  highlight = false,
}: {
  snap: Snap;
  compact?: boolean;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <Box
      sx={{
        border: `1px solid ${highlight ? "#C7DBFF" : "#E5EAF2"}`,
        borderRadius: "12px",
        px: 1.25,
        py: compact ? 0.6 : 0.9,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.25,
        bgcolor: highlight ? "#F7FAFF" : "#fff",
      }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          color: muted ? "#94a3b8" : "#0f172a",
          letterSpacing: 0.2,
          lineHeight: 1.15,
        }}
      >
        {safe(snap.projectName || snap.projectId)}
      </Typography>

      <Stack direction="column" gap={0.5} alignItems="flex-end">
        {snap.role && (
          <Tag tone="success" outlined icon={<WorkOutlineIcon sx={{ fontSize: 15 }} />}>
            {snap.role}
          </Tag>
        )}
        {typeof snap.hoursAssigned === "number" && (
          <Tag tone="neutral" icon={<AccessTimeIcon sx={{ fontSize: 15 }} />}>
            {snap.hoursAssigned} hs
          </Tag>
        )}
      </Stack>
    </Box>
  );
}

function EmptyCard() {
  return (
    <Box
      sx={{
        border: "1px dashed #d1d5db",
        borderRadius: "12px",
        p: 1,
        color: "#94a3b8",
        fontStyle: "italic",
      }}
    >
      (vacío)
    </Box>
  );
}
