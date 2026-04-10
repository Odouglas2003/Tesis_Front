"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import LoadingAnimation from "../LoadingAnimation/page";
import ModalComponent from "@/components/message/MessageModal";
import AuthSplitLayout, {
  authFieldSx,
  authPrimaryButtonSx,
} from "@/components/auth/AuthSplitLayout";
import { resetPassword } from "@/services/api";
import { AUTH_PALETTE } from "@/theme/appPalette";

const ResetPasswordForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [dialog, setDialog] = useState<{
    open: boolean;
    variant: "success" | "error" | "warning";
    message?: string;
    onConfirm?: () => void;
  }>({ open: false, variant: "success" });

  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

  const showDialog = (
    variant: "success" | "error" | "warning",
    message?: string,
    onConfirm?: () => void
  ) => setDialog({ open: true, variant, message, onConfirm });

  useEffect(() => {
    const storedEmail = localStorage.getItem("recpws");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("No se encontró un email para recuperar la contraseña.");
    }
  }, []);

  const validateForm = () => {
    if (!password) {
      setError("La contraseña es requerida");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await resetPassword(email, password, confirmPassword);

      if (data?.error || data?.message === "Ocurrió un error") {
        throw new Error(data.message || "Ocurrió un error");
      }

      showDialog("success", "Contraseña actualizada correctamente");

      setTimeout(() => {
        localStorage.removeItem("recpws");
        router.push("/");
      }, 2500);
    } catch {
      showDialog("error", "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: AUTH_PALETTE.overlayBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1300,
        }}
      >
        <LoadingAnimation />
      </Box>
    );
  }

  return (
    <>
      <AuthSplitLayout
        title="Restablecer acceso"
        subtitle="Definí una nueva contraseña para volver a ingresar con tu perfil de trabajo."
        headerAction={
          <Button
            variant="outlined"
            startIcon={<KeyboardArrowLeftIcon />}
            onClick={() => router.push("/")}
            sx={{
              alignSelf: "flex-start",
              px: 1.25,
              minHeight: "40px",
              borderRadius: "14px",
              textTransform: "none",
              color: AUTH_PALETTE.title,
              borderColor: "rgba(18,48,77,0.12)",
              fontWeight: 600,
            }}
          >
            Volver
          </Button>
        }
        heroTitle={
          <>
            Seguridad simple
            <Box component="span" sx={{ display: "block", color: AUTH_PALETTE.textAccent }}>
              para volver a operar rápido.
            </Box>
          </>
        }
        heroDescription="El acceso conserva la misma experiencia sobria y corporativa del resto de la plataforma, sin fricción innecesaria."
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.25,
          }}
        >
          <TextField
            fullWidth
            disabled
            value={email}
            placeholder="Email"
            sx={authFieldSx}
          />

          <TextField
            fullWidth
            placeholder="Nueva contraseña"
            required
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {showPassword ? (
                    <VisibilityIcon
                      sx={{ cursor: "pointer", color: AUTH_PALETTE.inputText }}
                      onClick={() => setShowPassword((current) => !current)}
                    />
                  ) : (
                    <VisibilityOffIcon
                      sx={{ cursor: "pointer", color: AUTH_PALETTE.inputText }}
                      onClick={() => setShowPassword((current) => !current)}
                    />
                  )}
                </InputAdornment>
              ),
            }}
            sx={authFieldSx}
          />

          <TextField
            fullWidth
            placeholder="Repetir contraseña"
            required
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {showConfirmPassword ? (
                    <VisibilityIcon
                      sx={{ cursor: "pointer", color: AUTH_PALETTE.inputText }}
                      onClick={() => setShowConfirmPassword((current) => !current)}
                    />
                  ) : (
                    <VisibilityOffIcon
                      sx={{ cursor: "pointer", color: AUTH_PALETTE.inputText }}
                      onClick={() => setShowConfirmPassword((current) => !current)}
                    />
                  )}
                </InputAdornment>
              ),
            }}
            sx={authFieldSx}
          />

          {error && (
            <Typography
              sx={{
                color: "#C04646",
                fontSize: "0.9rem",
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              {error}
            </Typography>
          )}

          <Button variant="contained" type="submit" sx={authPrimaryButtonSx}>
            Guardar nueva contraseña
          </Button>
        </Box>
      </AuthSplitLayout>

      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </>
  );
};

export default ResetPasswordForm;
