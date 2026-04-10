"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import Navbar from "@/components/navbar/pages";
import { useAppTheme } from "@/app/ThemeProviderClient";

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
        sx={{
          px: { xs: 2, sm: 4, md: "55px" },
          pb: { xs: 4, md: 6 },
          ...contentSx,
        }}
      >
        {(title || description || actions) && (
          <Box
            sx={{
              mb: 3,
              px: { xs: 2, md: 3 },
              py: { xs: 2, md: 2.5 },
              borderRadius: "24px",
              border: "1px solid rgba(18,48,77,0.08)",
              backgroundColor: colors.card,
              backdropFilter: "blur(8px)",
              boxShadow: "0 18px 45px rgba(18,48,77,0.08)",
              display: "flex",
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              {title && (
                <Typography
                  sx={{
                    fontSize: { xs: "1.4rem", md: "1.75rem" },
                    fontWeight: 700,
                    color: colors.primary,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {title}
                </Typography>
              )}
              {description && (
                <Typography
                  sx={{
                    mt: 0.75,
                    fontSize: { xs: "0.95rem", md: "1rem" },
                    color: colors.secondary,
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
