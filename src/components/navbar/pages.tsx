"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState, useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import UserMenu from "./UserMenu/UserMenu";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppTheme } from "@/app/ThemeProviderClient";
import { AUTH_LOGO_SRC } from "@/theme/appPalette";

const menuItems = [
  { label: "Proyectos", path: "/pages/projects", value: 1 },
  { label: "Colaboradores", path: "/pages/collaborators", value: 2 },
  { label: "Vacantes", path: "/pages/vacantes", value: 3 },
];

const Navbar = () => {
  const { colors, brandConfig } = useAppTheme();
  const [activeItem, setActiveItem] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  const NavItem = styled(Typography)(() => ({
    position: "relative",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    lineHeight: "24px",
    color: "rgba(247, 251, 255, 0.92)",
    whiteSpace: "nowrap",
    transition: "color 0.25s ease",
    "&:hover": {
      color: colors.text,
    },
    "&.active": {
      color: colors.text,
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: "4px",
        left: "14px",
        right: "14px",
        height: "2px",
        backgroundColor: colors.text,
        borderRadius: "999px",
      },
    },
  }));

  useEffect(() => {
    const currentPath = window.location.pathname;
    const activeMenuItem = menuItems.find((item) => item.path === currentPath);
    if (activeMenuItem) {
      setActiveItem(activeMenuItem.label);
    }
  }, []);

  const handleMenuClick = (label: string, value: number) => {
    setActiveItem(label);
    localStorage.setItem("menuSelection", value.toString());
  };

  const logoSrc = brandConfig?.logo || AUTH_LOGO_SRC;
  const brandName = brandConfig?.companyName?.trim() || "TeamMatch";

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 4, md: "55px" },
        width: "100%",
        pt: { xs: 2, md: "20px" },
        mb: 3,
      }}
    >
      <AppBar
        position="static"
        sx={{
          boxShadow: "none",
          borderRadius: "16px",
          backgroundColor: colors.navbar,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 72, md: 84 },
            px: { xs: 1.5, sm: 2.5, md: 3 },
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1.5,
                px: { xs: 1, md: 1.5 },
                py: 0.75,
                borderRadius: "999px",
                cursor: "pointer",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
                maxWidth: "100%",
                transition: "background-color .2s ease, transform .2s ease",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.08)",
                  transform: "translateY(-1px)",
                },
              }}
              onClick={() => router.push("/pages/dash")}
            >
              <Box
                sx={{
                  width: { xs: 40, md: 46 },
                  height: { xs: 40, md: 46 },
                  borderRadius: "14px",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <Image
                  src={logoSrc}
                  alt={brandName}
                  width={46}
                  height={46}
                  style={{
                    width: "82%",
                    height: "82%",
                    objectFit: "contain",
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  flexDirection: "column",
                  minWidth: 0,
                }}
              >
                <Typography
                  sx={{
                    color: "#F7FBFF",
                    fontSize: { sm: "0.98rem", md: "1.06rem" },
                    fontWeight: 700,
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: { sm: 170, md: 220 },
                  }}
                >
                  {brandName}
                </Typography>
                <Typography
                  sx={{
                    color: colors.text,
                    fontSize: "0.76rem",
                    fontWeight: 500,
                    lineHeight: 1.1,
                    letterSpacing: "0.02em",
                  }}
                >
                  Asignación inteligente
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
              ml: "auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {menuItems.map((item) => (
                <Link
                  href={item.path}
                  passHref
                  key={item.label}
                  style={{ textDecoration: "none" }}
                >
                  <NavItem
                    onClick={() => handleMenuClick(item.label, item.value)}
                    className={activeItem === item.label ? "active" : ""}
                  >
                    {item.label}
                  </NavItem>
                </Link>
              ))}
            </Box>
            <UserMenu />
          </Box>

          <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}>
            <IconButton
              onClick={() => setDrawerOpen((prev) => !prev)}
              color="inherit"
              sx={{ fontSize: "2rem", mr: 0.5, color: "#F7FBFF" }}
            >
              <MenuIcon fontSize="inherit" />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              PaperProps={{
                sx: {
                  backgroundColor: colors.navbar,
                  color: "#F7FBFF",
                },
              }}
            >
              <Box sx={{ width: 260, p: 2.5 }}>
                <IconButton
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    ml: "auto",
                    display: "flex",
                    color: "#F7FBFF",
                  }}
                >
                  <CloseIcon />
                </IconButton>

                <List sx={{ mt: 1 }}>
                  {menuItems.map((item) => (
                    <Link
                      href={item.path}
                      passHref
                      key={item.label}
                      style={{ textDecoration: "none" }}
                    >
                      <ListItemButton
                        onClick={() => {
                          handleMenuClick(item.label, item.value);
                          setDrawerOpen(false);
                        }}
                        sx={{
                          borderRadius: "12px",
                          mb: 0.5,
                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.06)",
                          },
                        }}
                      >
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            style: {
                              color:
                                activeItem === item.label ? colors.text : "#F7FBFF",
                              fontWeight: activeItem === item.label ? 700 : 500,
                            },
                          }}
                        />
                      </ListItemButton>
                    </Link>
                  ))}
                </List>
              </Box>
            </Drawer>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
