"use client";

import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import UserMenu from "./UserMenu/UserMenu";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAppTheme } from "@/app/ThemeProviderClient";
import { AUTH_LOGO_SRC, UI } from "@/theme/appPalette";

const menuItems = [
  { label: "Panel", path: "/pages/dash", value: 0, match: ["/pages/dash"] },
  {
    label: "Proyectos",
    path: "/pages/projects",
    value: 1,
    match: ["/pages/projects", "/pages/detail/project_detail", "/pages/edit/project", "/pages/suggestionIA"],
  },
  {
    label: "Colaboradores",
    path: "/pages/collaborators",
    value: 2,
    match: ["/pages/collaborators", "/pages/detail/collaborator_detail", "/pages/edit/employe"],
  },
  {
    label: "Vacantes",
    path: "/pages/vacantes",
    value: 3,
    match: ["/pages/vacantes", "/pages/detail/VacanciesDetail", "/pages/edit/vacancie"],
  },
];

const Navbar = () => {
  const { colors, brandConfig } = useAppTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname() || "";

  const isActive = (item: (typeof menuItems)[number]) =>
    item.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  const handleMenuClick = (value: number) => {
    localStorage.setItem("menuSelection", value.toString());
  };

  const logoSrc = brandConfig?.logo || AUTH_LOGO_SRC;
  const brandName = brandConfig?.companyName?.trim() || "TeamMatch";

  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        backgroundColor: colors.navbar,
        mb: { xs: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: UI.maxWidth,
          mx: "auto",
          px: { xs: 2, md: 3 },
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, md: 4 },
        }}
      >
        <Link
          href="/pages/dash"
          aria-label={`${brandName}, ir al panel`}
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, minHeight: 44 }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "8px",
              backgroundColor: "rgba(255,255,255,0.96)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <Image
              src={logoSrc}
              alt=""
              width={34}
              height={34}
              style={{ width: "86%", height: "86%", objectFit: "contain" }}
            />
          </Box>
          <Typography
            component="span"
            sx={{
              display: { xs: "none", sm: "block" },
              color: "#FFFFFF",
              fontSize: "1rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 220,
            }}
          >
            {brandName}
          </Typography>
        </Link>

        <Box
          component="nav"
          aria-label="Principal"
          sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5, flex: 1 }}
        >
          {menuItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                href={item.path}
                key={item.label}
                aria-current={active ? "page" : undefined}
                onClick={() => handleMenuClick(item.value)}
                style={{ textDecoration: "none" }}
              >
                <Box
                  component="span"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minHeight: 44,
                    px: 1.75,
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    color: active ? "#FFFFFF" : "#C9D8E6",
                    backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
                    transition: "background-color .2s ease, color .2s ease",
                    "&:hover": { color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  {item.label}
                </Box>
              </Link>
            );
          })}
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", ml: "auto" }}>
          <UserMenu />
        </Box>

        <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}>
          <IconButton
            onClick={() => setDrawerOpen((prev) => !prev)}
            aria-label="Abrir menú"
            sx={{ color: "#FFFFFF", width: 44, height: 44 }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{
              sx: { backgroundColor: colors.navbar, color: "#FFFFFF", borderRadius: 0 },
            }}
          >
            <Box sx={{ width: 280, p: 2.5 }}>
              <IconButton
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar menú"
                sx={{ ml: "auto", display: "flex", color: "#FFFFFF", width: 44, height: 44 }}
              >
                <CloseIcon />
              </IconButton>

              <List sx={{ mt: 1 }}>
                {menuItems.map((item) => {
                  const active = isActive(item);
                  return (
                    <Link
                      href={item.path}
                      key={item.label}
                      style={{ textDecoration: "none" }}
                    >
                      <ListItemButton
                        onClick={() => {
                          handleMenuClick(item.value);
                          setDrawerOpen(false);
                        }}
                        sx={{
                          borderRadius: "8px",
                          mb: 0.5,
                          minHeight: 44,
                          backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
                          "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
                        }}
                      >
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            style: {
                              color: active ? "#FFFFFF" : "#C9D8E6",
                              fontWeight: 600,
                            },
                          }}
                        />
                      </ListItemButton>
                    </Link>
                  );
                })}
              </List>
              <Box sx={{ mt: 2 }}>
                <UserMenu />
              </Box>
            </Box>
          </Drawer>
        </Box>
      </Box>
    </Box>
  );
};

export default Navbar;
