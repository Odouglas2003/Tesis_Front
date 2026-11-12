"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import Navbar from "@/components/navbar/pages";
import { useAppTheme } from "@/app/ThemeProviderClient";
import { UI } from "@/theme/appPalette";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  contentSx?: SxProps<Theme>;
}

export default function AppShell({
  children,
  title,
  description,
  actions,
  contentSx,
}: AppShellProps) {
  const { colors } = useAppTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: colors.background,
        transition: "background-color 0.3s ease",
      }}
    >
      <Navbar />

      <Box
        component="main"
        sx={{
          maxWidth: UI.maxWidth,
          mx: "auto",
          px: { xs: 2, md: 3 },
          pb: { xs: 5, md: 7 },
          ...contentSx,
        }}
      >
        {(title || description || actions) && (
          <Box
            sx={{
              mb: 3,
              display: "flex",
              alignItems: { xs: "flex-start", md: "flex-end" },
              justifyContent: "space-between",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              {title && (
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: "1.4rem", md: "1.625rem" },
                    fontWeight: 700,
                    color: "text.primary",
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {title}
                </Typography>
              )}
              {description && (
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: "0.9375rem",
                    color: "text.secondary",
                    maxWidth: 760,
                  }}
                >
                  {description}
                </Typography>
              )}
            </Box>
            {actions && <Box sx={{ width: { xs: "100%", md: "auto" } }}>{actions}</Box>}
          </Box>
        )}

        {children}
      </Box>
    </Box>
  );
}
