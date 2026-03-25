"use client";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState, useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import UserMenu from "./UserMenu/UserMenu";
import Link from "next/link";
import Image from "next/image";
import { useAppTheme } from "@/app/ThemeProviderClient";


const menuItems = [
  { label: "Proyectos", path: "/pages/projects", value: 1 },
  { label: "Colaboradores", path: "/pages/collaborators", value: 2 },
  { label: "Vacantes", path: "/pages/vacantes", value: 3 },
  // { label: "Tecnologías", path: "/pages/tecnology", value: 4 },
];

const Navbar = () => {
  const { colors, brandConfig } = useAppTheme();
  const [activeItem, setActiveItem] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);


  const NavItem = styled(Typography)(() => ({
    position: "relative",
    padding: "12px 16px",
    cursor: "pointer",
    weight: "500",
    size: "20px",
    lineHeight: "30px",
    color: "white",
    transition: "all 0.3s ease",
    "&:hover": {
      color: colors.text,
      fontWeight: "bold",
    },
    "&.active": {
      color: colors.text,
      fontWeight: "bold",
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: "10px",
        left: "0",
        width: "100%",
        height: "2px",
        backgroundColor: colors.text,
        borderRadius: "50px",
        transform: "scaleX(0)",
        transformOrigin: "bottom right",
        transition: "transform 0.3s ease-out",
      },
    },
    "&.active::after": {
      transform: "scaleX(1)",
      transformOrigin: "bottom left",
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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const logoSrc = brandConfig?.logo || "/logo.svg";

  return (
    <Box
      sx={{
        paddingLeft: "55px",
        paddingRight: "55px",
        width: "100%",
        height: "92px",
        paddingTop: "20px",
        marginBottom: "20px",
      }}
    >
      <AppBar
        position="static"
        sx={{
          boxShadow: "none",
          borderRadius: "8px",
          backgroundColor: colors.navbar, 
        }}
      >
        <Toolbar>
          <Box sx={{ display: "flex", width: "50%" }}>
            <Box
              sx={{ width: "170px", marginLeft: "20px", cursor: "pointer" }}
              onClick={() => {
                window.location.href = "/pages/dash";
              }}
            >
              <Image
                src={logoSrc} // Logo dinámico desde brandConfig
                alt="Logo"
                width={170}
                height={160}
                style={{
                  top: "60px",
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "row",
              alignItems: "center",
              gap: "32px",
              mt: "10px",
            }}
          >
            <Box
              sx={{
                font: "poppins",
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                fontWeight: "500",
                fontSize: "20px",
                gap: "20px",
              }}
            >
              {menuItems.map((item) => (
                <Link href={item.path} passHref key={item.label}>
                  <NavItem
                    onClick={() => handleMenuClick(item.label, item.value)}
                    className={activeItem === item.label ? "active" : ""}
                  >
                    {item.label}
                  </NavItem>
                </Link>
              ))}
              <UserMenu />
            </Box>
          </Box>

          <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}>
            <IconButton
              onClick={toggleDrawer}
              color="inherit"
              sx={{ fontSize: "2rem", marginRight: "16px" }}
            >
              <MenuIcon fontSize="inherit" />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={toggleDrawer}
              PaperProps={{ sx: { backgroundColor: colors.text } }} 
            >
              <Box sx={{ width: 250, padding: "20px" }}>
                <IconButton
                  onClick={toggleDrawer}
                  sx={{
                    marginLeft: "auto",
                    fontSize: "2rem",
                    color: "black"
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
                <List>
                  {menuItems.map((item) => (
                    <ListItem
                      key={item.label}
                      onClick={() => {
                        handleMenuClick(item.label, item.value);
                        toggleDrawer();
                      }}
                      sx={{
                        "&:hover": {
                          backgroundColor: colors.text,

                        },
                      }}
                    >
                      <Link href={item.path} passHref>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            style: {
                              color:
                                activeItem === item.label
                                  ? colors.text
                                  : "white",
                            },
                          }}
                        />
                      </Link>
                    </ListItem>
                  ))}
                  <ListItem>
                    <UserMenu />
                  </ListItem>
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