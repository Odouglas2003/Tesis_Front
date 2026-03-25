"use client";
import React from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Grid2,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingAnimation from "../LoadingAnimation/page";
import Image from "next/image";
import { resetPassword } from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";
import { useAppTheme } from "@/app/ThemeProviderClient";

const ResetPasswordForm = () => {
  const { colors } = useAppTheme();
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
    } catch (error) {
      showDialog("error", "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };
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

  if (loading) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "rgba(249,249,249,.9)",
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
    <Grid2
      container
      component="main"
      sx={{ height: "100vh", bgcolor: "#f9f9f9" }}
      alignItems="center"
      justifyContent="center"
    >
      <Paper
        elevation={6}
        sx={{
          width: 1113,
          height: 663,
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
        }}
      >
        {/* IZQUIERDA --------------------------------------------------- */}
        <Box
          sx={{
            width: "40%",
            bgcolor: colors.navbar || "#0087FF",
            color: "#fff",
            pl: 4,
            pr: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <Image
            src={colors.logo || "/logo.svg"}
            alt="Logo Rubik"
            width={180}
            height={180}
            style={{ marginTop: "86px" }}
          />
          <Box textAlign="center" mt={"3rem"}>
            <Typography
              textAlign={"left"}
              sx={{
                fontFamily: "Poppins",
                fontWeight: 700,
                fontSize: "52.92px",
                color: "#FFFFFF",
              }}
            >
              SIMPLIFICA TU EQUIPO,
            </Typography>
            <Typography
              textAlign={"left"}
              sx={{
                fontFamily: "Poppins",
                fontWeight: 700,
                fontSize: "52.92px",
                color: "#23FFDC",
                marginTop: "2rem",
              }}
            >
              OPTIMIZA TU PLANTILLA
            </Typography>
          </Box>
        </Box>

        {/* DERECHA ----------------------------------------------------- */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "60%",
            pl: 4,
            pr: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 3,
            bgcolor: "#ffffffff",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "24px",
              color: "#002338",
              mt: "86px",
            }}
          >
            Recuperar Contraseña
          </Typography>

          {/* Password */}
          <TextField
            fullWidth
            placeholder="Contraseña"
            required
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {showPassword ? (
                    <VisibilityIcon
                      sx={{ cursor: "pointer", color: "black" }}
                      onClick={() => setShowPassword((s) => !s)}
                    />
                  ) : (
                    <VisibilityOffIcon
                      sx={{ cursor: "pointer", color: "black" }}
                      onClick={() => setShowPassword((s) => !s)}
                    />
                  )}
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 5,
                bgcolor: "#F8F8F8",
                color: "black"
              },
            }}
          />

          {/* Repetir Contraseña */}
          <TextField
            fullWidth
            placeholder="Repetir Contraseña"
            required
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {showConfirmPassword ? (
                    <VisibilityIcon
                      sx={{ cursor: "pointer", color: "black" }}
                      onClick={() => setShowConfirmPassword((s) => !s)}
                    />
                  ) : (
                    <VisibilityOffIcon
                      sx={{ cursor: "pointer", color: "black" }}
                      onClick={() => setShowConfirmPassword((s) => !s)}
                    />
                  )}
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 5,
                bgcolor: "#F8F8F8",
                color: "black"
              },
            }}
          />

          {/* Error */}
          {error && (
            <Typography color="error" fontSize={14} textAlign="center">
              {error}
            </Typography>
          )}

          {/* Botón Registrarme */}
          <Button
            variant="contained"
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              bgcolor: "#002338",
              color: "#23FFDC",
              borderRadius: "20px",
              py: 1.2,
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "20px",
            }}
          >
            {loading ? "Procesando..." : "Cambiar Contraseña"}
          </Button>
        </Box>
      </Paper>
      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </Grid2>
  );
};

export default ResetPasswordForm;
