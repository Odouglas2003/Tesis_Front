"use client";

import { Box, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { UI, cardSx } from "@/theme/appPalette";

interface StatsCardProps {
  icon: SvgIconComponent;
  value: string;
  label: string;
}

const getPathForLabel = (lbl: string) => {
  const key = lbl?.toLowerCase?.().trim() ?? "";
  if (key.includes("proyecto")) return "/pages/projects";
  if (key.includes("vacante")) return "/pages/vacantes";
  if (key.includes("colaborador")) return "/pages/collaborators";
  // Tecnologías no redirige
  return null;
};

export default function StatsCard({ icon: Icon, value, label }: StatsCardProps) {
  const router = useRouter();
  const targetPath = getPathForLabel(label);

  return (
    <Box
      component={targetPath ? "button" : "div"}
      type={targetPath ? "button" : undefined}
      onClick={targetPath ? () => router.push(targetPath) : undefined}
      aria-label={targetPath ? `${label}: ${value}. Ver detalle` : undefined}
      sx={{
        ...cardSx,
        width: "100%",
        p: 2.5,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 1.5,
        textAlign: "left",
        fontFamily: "inherit",
        cursor: targetPath ? "pointer" : "default",
        transition: "border-color .2s ease, box-shadow .2s ease",
        "&:hover": targetPath
          ? { borderColor: UI.borderStrong, boxShadow: "0 4px 14px rgba(15,34,51,0.08)" }
          : {},
      }}
    >
      <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography component="span" sx={{ fontSize: "0.8125rem", fontWeight: 600, color: UI.muted }}>
          {label}
        </Typography>
        <Typography
          component="span"
          sx={{
            fontSize: "2rem",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: UI.ink,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </Typography>
      </Box>
      <Box
        aria-hidden
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          backgroundColor: "#EEF4FA",
          color: UI.blue,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Box>
    </Box>
  );
}
