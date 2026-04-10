"use client";

import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useRouter } from "next/navigation";
import Notification from "@/components/notification/notification";
import { useUser } from "@/app/UserContext";
import { useAuthRole } from "@/app/hooks/useAuthRole";
import { useAppTheme } from "@/app/ThemeProviderClient";

const UserMenu: React.FC = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { clearSession, user } = useUser();
  const { isAdmin } = useAuthRole();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openLogoutPopup, setOpenLogoutPopup] = useState(false);

  const avatarUrl = "";
  const open = Boolean(anchorEl);
  const displayName = user?.name?.trim() || "Usuario";

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setOpenLogoutPopup(false);
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "u=; path=/; max-age=0; SameSite=Lax";
    clearSession();
    router.push("/");
  };

  const handleOpenSettings = () => {
    handleClose();
    router.push("/pages/configuration");
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <Notification />

      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1,
          py: 0.75,
          borderRadius: "999px",
          backgroundColor: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer",
          transition: "background-color .2s ease, transform .2s ease",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.08)",
            transform: "translateY(-1px)",
          },
        }}
      >
        <Avatar
          src={avatarUrl || undefined}
          sx={{
            width: 34,
            height: 34,
            bgcolor: "rgba(255,255,255,0.12)",
            color: "#F7FBFF",
            fontSize: "1rem",
            fontWeight: 700,
          }}
        >
          {avatarUrl ? null : <AccountCircleIcon sx={{ width: 24, height: 24 }} />}
        </Avatar>

        <Box sx={{ display: { xs: "none", lg: "block" }, minWidth: 0 }}>
          <Typography
            sx={{
              color: "#F7FBFF",
              fontSize: "0.93rem",
              fontWeight: 600,
              lineHeight: 1.1,
              maxWidth: 140,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {displayName}
          </Typography>
          <Typography
            sx={{
              color: "rgba(247,251,255,0.68)",
              fontSize: "0.76rem",
              lineHeight: 1.1,
            }}
          >
            Perfil
          </Typography>
        </Box>

        <KeyboardArrowDownRoundedIcon
          sx={{
            color: colors.text,
            fontSize: "1.1rem",
          }}
        />
      </Box>

      <Popover
        id={open ? "user-menu" : undefined}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 260,
            p: 1,
            borderRadius: "20px",
            backgroundColor: "#FCFEFF",
            border: "1px solid rgba(18,48,77,0.08)",
            boxShadow: "0 18px 40px rgba(18,48,77,0.14)",
          },
        }}
      >
        <Box
          sx={{
            px: 1.25,
            py: 1.5,
            borderRadius: "16px",
            backgroundColor: "rgba(244,248,251,0.9)",
            mb: 1,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              color: colors.primary,
            }}
          >
            {displayName}
          </Typography>
          <Typography
            sx={{
              mt: 0.4,
              color: "rgba(18,48,77,0.65)",
              fontSize: "0.88rem",
            }}
          >
            Accesos y acciones del perfil
          </Typography>
        </Box>

        {isAdmin && (
          <MenuAction
            icon={<SettingsOutlinedIcon sx={{ color: colors.primary }} />}
            label="Configuración"
            onClick={handleOpenSettings}
          />
        )}

        <MenuAction
          icon={<LogoutRoundedIcon sx={{ color: colors.primary }} />}
          label="Cerrar sesión"
          onClick={() => {
            setOpenLogoutPopup(true);
            handleClose();
          }}
        />
      </Popover>

      <Dialog
        open={openLogoutPopup}
        onClose={() => setOpenLogoutPopup(false)}
        PaperProps={{
          sx: {
            width: "min(420px, calc(100vw - 32px))",
            borderRadius: "24px",
            p: 1,
          },
        }}
      >
        <IconButton
          onClick={() => setOpenLogoutPopup(false)}
          sx={{
            alignSelf: "flex-end",
            color: "rgba(18,48,77,0.68)",
          }}
        >
          <CloseRoundedIcon />
        </IconButton>

        <DialogContent sx={{ pt: 0, pb: 1 }}>
          <Stack spacing={2} alignItems="center">
            <Avatar
              src={avatarUrl || undefined}
              sx={{
                width: 72,
                height: 72,
                bgcolor: "rgba(42,108,168,0.10)",
                color: colors.primary,
              }}
            >
              {avatarUrl ? null : <AccountCircleIcon sx={{ width: 46, height: 46 }} />}
            </Avatar>

            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: colors.primary,
                }}
              >
                {displayName}
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  color: "rgba(18,48,77,0.68)",
                  lineHeight: 1.6,
                }}
              >
                ¿Querés cerrar la sesión actual?
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Button
            variant="outlined"
            onClick={() => setOpenLogoutPopup(false)}
            sx={{
              flex: 1,
              borderRadius: "14px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              flex: 1,
              borderRadius: "14px",
              textTransform: "none",
              fontWeight: 700,
              color: colors.text,
              backgroundColor: colors.button,
              "&:hover": {
                backgroundColor: colors.primary,
              },
            }}
          >
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface MenuActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function MenuAction({ icon, label, onClick }: MenuActionProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.25,
        py: 1.25,
        borderRadius: "14px",
        cursor: "pointer",
        transition: "background-color .2s ease",
        "&:hover": {
          backgroundColor: "rgba(42,108,168,0.06)",
        },
      }}
    >
      {icon}
      <Typography
        sx={{
          fontWeight: 500,
          color: "#12304D",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default UserMenu;
