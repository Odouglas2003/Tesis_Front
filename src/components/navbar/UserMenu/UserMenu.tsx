"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Popover,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Notification from "@/components/notification/notification";
import { useUser } from "@/app/UserContext";
import { useAuthRole } from "@/app/hooks/useAuthRole";
import { useAppTheme } from "@/app/ThemeProviderClient";

const UserMenuWrapper = styled(Box)({
  position: "relative",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  justifyContent: "flex-end",
  width: "100%",
});

const StyledAccountIcon = styled(AccountCircleIcon)({
  width: "30px",
  height: "48px",
  color: "white",
});

const CloseButton = styled(IconButton)({
  position: "absolute",
  right: "8px",
  top: "8px",
  color: "black",
  backgroundColor: "#d3d3d3",
  padding: "4px",
  borderRadius: "50%",
  "&:hover": {
    backgroundColor: "#b0b0b0",
  },
});

const ModernDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    borderRadius: "12px",
    padding: "16px",
    backgroundColor: "#f4f7fc",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease-in-out",
    cursor: "pointer",
  },
});

const YesButton = styled(Button)({
  textTransform: "none",
  fontWeight: "bold",
  padding: "8px 16px",
  borderRadius: "8px",
  backgroundColor: "#007bff",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#dc3545",
    color: "#fff",
  },
});

const NoButton = styled(Button)({
  textTransform: "none",
  fontWeight: "bold",
  padding: "8px 16px",
  borderRadius: "8px",
  backgroundColor: "#007bff",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#218838",
    color: "#000",
  },
});

const UserMenu: React.FC = () => {
  const { colors } = useAppTheme();
  const { clearSession } = useUser();
  const { isAdmin } = useAuthRole();
  const { user } = useUser();

  const [avatarUrl] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [imageError, setImageError] = useState(false);
  const [openLogoutPopup, setOpenLogoutPopup] = useState(false);

  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleLogoutPopupOpen = () => {
    setOpenLogoutPopup(true);
    handleClose();
  };
  const handleLogout = async () => {
    setOpenLogoutPopup(false);

    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "u=; path=/; max-age=0; SameSite=Lax";
    clearSession();
    router.push("/");
    // window.location.href = "https://rubik-dev.app.mindfactory.ar/";
  };

  const handleLogoutPopupClose = () => {
    setOpenLogoutPopup(false);
  };

  const handleOpenSettings = () => {
    router.push("/pages/configuration");
  };
  const renderAvatar = () => {
    if (!avatarUrl || imageError) {
      return <AccountCircleIcon sx={{ width: "100%", height: "100%" }} />;
    }
    return (
      <Image
        src={avatarUrl}
        alt={`${user?.name}'s avatar`}
        width={80}
        height={80}
        onError={handleImageError}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    );
  };

  const perfil = () => {
    if (!avatarUrl || imageError) {
      return <StyledAccountIcon className="perfil-icon" sx={{ transition: 'color .25s ease' }} />;
    }
    return (
      <Image
        src={avatarUrl}
        alt={`${user?.name}'s avatar`}
        width={40}
        height={40}
        onError={handleImageError}
        style={{
          width: "90px",
          height: "40px",
          objectFit: "cover",
        }}
      />
    );
  };

  const handleOpenWebsite = () => {
    window.open("https://www.youtube.com", "_blank");
  };

  return (
    <UserMenuWrapper>
      {/* Perfil y opciones */}
      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          width: "100px",
          cursor: "pointer",
          padding: "4px 8px",
          borderRadius: "20px",
          transition: "background-color .25s ease, color .25s ease",
          position: "relative",
          '&:hover .perfil-text': {
            color: colors.text,
          },
          '&:hover .perfil-icon': {
            color: colors.text,
          },
          '&:hover .perfil-arrow': {
            color: colors.text,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            clipPath: "circle(50%)",
          }}
        >
          {perfil()}
        </Box>
        <Typography
          variant="body1"
          component="div" // evitar <div> dentro de <p> (Typography body1 por defecto = <p>)
          className="perfil-text"
          sx={{
            color: "whitesmoke",
            fontSize: "15px",
            display: "flex",
            alignItems: 'center',
            gap: '2px',
            transition: 'color .25s ease',
          }}
        >
          Perfil
          <Box
            className="perfil-arrow"
            component="span" // inline para mantener semántica correcta
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 15,
              height: 15,
              ml: '2px',
              color: 'whitesmoke',
              transition: 'color .25s ease',
            }}
            aria-label="flecha perfil"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.7069 15.707C12.5193 15.8944 12.265 15.9998 11.9999 15.9998C11.7347 15.9998 11.4804 15.8944 11.2929 15.707L5.63585 10.05C5.54034 9.95773 5.46416 9.84739 5.41175 9.72538C5.35934 9.60338 5.33176 9.47216 5.3306 9.33938C5.32945 9.2066 5.35475 9.07492 5.40503 8.95202C5.45531 8.82913 5.52957 8.71747 5.62346 8.62358C5.71735 8.52969 5.829 8.45544 5.9519 8.40515C6.0748 8.35487 6.20648 8.32957 6.33926 8.33073C6.47204 8.33188 6.60325 8.35947 6.72526 8.41188C6.84726 8.46428 6.95761 8.54047 7.04985 8.63598L11.9999 13.586L16.9499 8.63598C17.1385 8.45382 17.3911 8.35302 17.6533 8.3553C17.9155 8.35758 18.1663 8.46275 18.3517 8.64816C18.5371 8.83357 18.6423 9.08438 18.6445 9.34658C18.6468 9.60877 18.546 9.86137 18.3639 10.05L12.7069 15.707Z"
                fill="currentColor"
              />
            </svg>
          </Box>
        </Typography>
      </Box>
      <Box>
        <Notification />
      </Box>
      <Popover
        id={Boolean(anchorEl) ? "user-menu" : undefined}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
            width: "250px",
            position: "relative",
          },
        }}
      >
        {isAdmin && (
          <IconButtonOption
            icon={<SettingsIcon sx={{ color: "black", cursor: "pointer" }} />}
            label="Ajustes"
            onClick={handleOpenSettings}
          />
        )}
        <IconButtonOption
          icon={<LogoutIcon sx={{ color: "black", cursor: "pointer" }} />}
          label="Cerrar sesión"
          onClick={handleLogoutPopupOpen}
        />
      </Popover>

      {/* Logout Confirmation Popup */}
      <ModernDialog
        open={openLogoutPopup}
        onClose={handleLogoutPopupClose}
        aria-labelledby="confirm-logout-dialog"
      >
        <CloseButton
          onClick={handleLogoutPopupClose}
          size="small"
          aria-label="close logout popup"
        >
          <CloseIcon fontSize="small" />
        </CloseButton>

        <Box
          sx={{
            width: "90px",
            height: "80px",
            borderRadius: "50%",
            overflow: "hidden",
            mb: 2,
            mt: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          {renderAvatar()}
        </Box>

        <Typography variant="body1" sx={{ color: "#000", textAlign: "center" }}>
          {user?.name}
        </Typography>

        <DialogContent>
          <Typography variant="body1" sx={{ textAlign: "center" }}>
            ¿Estás seguro de que quieres cerrar sesión?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <YesButton onClick={handleLogout}>Sí</YesButton>
          <NoButton onClick={handleLogoutPopupClose}>No</NoButton>
        </DialogActions>
      </ModernDialog>
    </UserMenuWrapper>
  );
};

interface IconButtonOptionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const IconButtonOption: React.FC<IconButtonOptionProps> = ({
  icon,
  label,
  onClick,
}) => (
  <Box
    onClick={onClick}
    sx={{
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      p: 1,
      "&:hover": {
        backgroundColor: "#f0f0f0",
      },
    }}
  >
    {icon}
    <Typography variant="body1" sx={{ color: "#000" }}>
      {label}
    </Typography>
  </Box>
);

export default UserMenu;
