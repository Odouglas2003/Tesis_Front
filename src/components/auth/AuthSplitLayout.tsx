"use client";

import React from "react";
import Image from "next/image";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { Box, Chip, Paper, Typography } from "@mui/material";
import { useAppTheme } from "@/app/ThemeProviderClient";
import { AUTH_LOGO_SRC, AUTH_PALETTE } from "@/theme/appPalette";

interface AuthSplitLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  version?: string;
  headerAction?: React.ReactNode;
  heroBadge?: string;
  heroTitle?: React.ReactNode;
  heroDescription?: string;
}

export const authFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    bgcolor: AUTH_PALETTE.inputBg,
    color: AUTH_PALETTE.inputText,
    minHeight: "48px",
    transition: "border-color .2s ease, box-shadow .2s ease, background-color .2s ease",
    "& fieldset": {
      borderColor: AUTH_PALETTE.inputBorder,
    },
    "&:hover fieldset": {
      borderColor: AUTH_PALETTE.inputBorderHover,
    },
    "&.Mui-focused fieldset": {
      borderColor: AUTH_PALETTE.focus,
      borderWidth: "1px",
    },
    "&.Mui-focused": {
      boxShadow: "0 0 0 3px rgba(29,95,160,0.18)",
    },
  },
  "& .MuiInputBase-input": {
    py: 1.4,
    fontSize: "0.9375rem",
  },
  "& .MuiInputBase-input::placeholder": {
    color: AUTH_PALETTE.inputPlaceholder,
    opacity: 1,
  },
} as const;

export const authPrimaryButtonSx = {
  bgcolor: AUTH_PALETTE.primaryButton,
  color: AUTH_PALETTE.primaryButtonText,
  borderRadius: "8px",
  minHeight: "48px",
  py: 1.2,
  textTransform: "none",
  fontWeight: 700,
  fontSize: "1rem",
  boxShadow: "none",
  "&:hover": {
    bgcolor: AUTH_PALETTE.primaryButtonHover,
    boxShadow: "none",
  },
} as const;

export const authSecondaryButtonSx = {
  bgcolor: AUTH_PALETTE.secondaryButton,
  color: AUTH_PALETTE.secondaryButtonText,
  borderRadius: "8px",
  minHeight: "48px",
  py: 1.2,
  textTransform: "none",
  fontWeight: 700,
  fontSize: "1rem",
  border: `1px solid ${AUTH_PALETTE.focus}`,
  boxShadow: "none",
  "&:hover": {
    bgcolor: AUTH_PALETTE.secondaryButtonHover,
    boxShadow: "none",
  },
} as const;

export default function AuthSplitLayout({
  title,
  subtitle,
  children,
  version,
  headerAction,
  heroBadge = "Asignación asistida con IA",
  heroTitle,
  heroDescription = "Centralizá habilidades, seniority y disponibilidad para asignar mejor cada proyecto y tomar decisiones con más contexto.",
}: AuthSplitLayoutProps) {
  const { brandConfig, colors } = useAppTheme();

  const logoSrc = brandConfig?.logo || AUTH_LOGO_SRC;
  const heroHeading = heroTitle ?? (
    <>
      Gestión de equipos
      <Box
        component="span"
        sx={{
          display: "block",
          color: AUTH_PALETTE.textAccent,
        }}
      >
        clara, precisa y escalable.
      </Box>
    </>
  );

  const heroPoints = [
    "Skills y seniority consolidados",
    "Capacidad operativa visible",
    "Asignación más eficiente",
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        transition: "background-color 0.3s ease",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          minHeight: "100vh",
          borderRadius: 0,
          overflow: "hidden",
          border: 0,
          boxShadow: "none",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          backgroundColor: AUTH_PALETTE.panelRight,
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", md: "42%" },
            position: "relative",
            overflow: "hidden",
            background: AUTH_PALETTE.panelLeft,
            color: AUTH_PALETTE.textPrimary,
            px: { xs: 3, sm: 5, md: 7 },
            py: { xs: 4, md: 7 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Chip
              icon={<AutoAwesomeRoundedIcon />}
              label={heroBadge}
              sx={{
                mb: 3,
                color: AUTH_PALETTE.textPrimary,
                backgroundColor: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.14)",
                "& .MuiChip-icon": {
                  color: AUTH_PALETTE.textAccent,
                },
              }}
            />

            <Box
              sx={{
                width: { xs: 56, md: 64 },
                height: { xs: 56, md: 64 },
                borderRadius: "12px",
                backgroundColor: "rgba(255,255,255,0.96)",
                border: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 4,
                overflow: "hidden",
              }}
            >
              <Image
                src={logoSrc}
                alt="Logo de la plataforma"
                width={78}
                height={78}
                priority
                style={{
                  width: "78%",
                  height: "78%",
                  objectFit: "contain",
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: { xs: "2rem", md: "2.5rem" },
                lineHeight: 1.15,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                maxWidth: 440,
              }}
            >
              {heroHeading}
            </Typography>

            <Typography
              sx={{
                mt: 2,
                maxWidth: 420,
                fontSize: { xs: "0.98rem", md: "1.04rem" },
                lineHeight: 1.65,
                color: "rgba(247,251,255,0.82)",
              }}
            >
              {heroDescription}
            </Typography>
          </Box>

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)", md: "1fr" },
              gap: 1.25,
            }}
          >
            {heroPoints.map((point) => (
              <Box
                key={point}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.25,
                }}
              >
                <CheckCircleOutlineRoundedIcon
                  sx={{
                    color: AUTH_PALETTE.textAccent,
                    fontSize: "1.1rem",
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "rgba(247,251,255,0.92)",
                  }}
                >
                  {point}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            width: { xs: "100%", md: "58%" },
            px: { xs: 3, sm: 4, md: 5.5 },
            py: { xs: 3.5, md: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 3,
            backgroundColor: AUTH_PALETTE.panelRight,
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 420, mx: "auto" }}>
            {headerAction && <Box sx={{ mb: 3 }}>{headerAction}</Box>}

            <Typography
              sx={{
                fontSize: { xs: "1.5rem", md: "1.625rem" },
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: AUTH_PALETTE.title,
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                mt: 1.25,
                fontSize: "0.98rem",
                lineHeight: 1.65,
                color: "#566779",
                maxWidth: 480,
              }}
            >
              {subtitle}
            </Typography>

            <Box sx={{ mt: 4 }}>{children}</Box>
          </Box>

          {version && (
            <Typography
              variant="caption"
              sx={{
                alignSelf: "flex-end",
                color: "#566779",
              }}
            >
              Versión: {version}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
