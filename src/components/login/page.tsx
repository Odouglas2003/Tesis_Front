"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/app/UserContext";

import { jwtDecode } from "jwt-decode";

type JwtPayload = { exp?: number };

import {
  Box,
  Grid2,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ModalComponent from "@/components/message/MessageModal";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LoadingAnimation from "../LoadingAnimation/page";
import { recoverPassword, loginUser } from "@/services/api";
import { useAppTheme } from "@/app/ThemeProviderClient";

const NINE_HOURS_S = 9 * 60 * 60;

export default function Login({ version }: { version: string }) {
  const { colors } = useAppTheme();
  const { setSession } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  const router = useRouter();

  /* ---------- handlers ----------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser(email, password);

      if (!response?.user) {
        setError("Credenciales inválidas");
        setLoading(false);
        return;
      }

      let ttlSec = NINE_HOURS_S;

      const { exp } = jwtDecode<JwtPayload>(response.token);
      if (exp) {
        const nowSec = Math.floor(Date.now() / 1000);
        ttlSec = Math.max(0, exp - nowSec);
      }

      localStorage.setItem("token", response.token);

      document.cookie = `token=${response.token};path=/;max-age=${ttlSec};SameSite=Lax`;
      document.cookie = `u=${encodeURIComponent(
        JSON.stringify(response.user)
      )};path=/;max-age=${ttlSec};SameSite=Lax`;

      setSession({ user: response.user, token: response.token });

      router.replace("/pages/dash");
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "No se pudo iniciar sesión"
      );
      setLoading(false);
    }
  };

  const handleRecoverPassword = async () => {
    if (!recoverEmail) return;

    try {
      const data = await recoverPassword(recoverEmail);

      if (data?.error || data?.message === "Error al recuperar la contraseña") {
        throw new Error(data.message || "Error al enviar email");
      }

      localStorage.setItem("recpws", recoverEmail);

      showDialog(
        "success",
        `Se ha enviado un email a ${recoverEmail} con las instrucciones para recuperar tu contraseña.`
      );

      setTimeout(() => {
        setForgotOpen(false);
        setShowConfirmation(false);
        setRecoverEmail("");
      }, 3000);
    } catch (error) {
      showDialog("error", "No se pudo enviar el email. Intenta nuevamente.");
    }
  };

  /* -------- loading overlay ------- */
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
            justifyContent: "flex-start",
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
            Iniciar sesión
          </Typography>

          {/* Email */}
          <TextField
            fullWidth
            placeholder="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "black" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 5,
                bgcolor: "#F8F8F8",
                color: "black",
              },
            }}
          />

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
                color: "black",
              },
            }}
          />

          {/* Error */}
          {error && (
            <Typography color="error" fontSize={14} textAlign="center">
              {error}
            </Typography>
          )}

          {/* Forgot link */}
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              textDecoration: "underline",
              cursor: "pointer",
              color: "#007BFF",
              mt: -1,
            }}
            onClick={() => setForgotOpen(true)}
          >
            ¿Olvidaste tu contraseña?
          </Typography>

          {/* Buttons */}
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "#002338",
              color: "#23FFDC",
              borderRadius: "20px",
              py: 1.2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "20px",
                color: "#23FFDC",
              }}
            >
              Ingresar
            </Typography>
          </Button>

          <Divider>
            <Typography variant="body2" color="#002338">
              O
            </Typography>
          </Divider>

          <Button
            variant="contained"
            onClick={() => router.push("/pages/register")}
            sx={{
              bgcolor: "#23FFDC",
              borderRadius: "20px",
              py: 1.2,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#23FFDC',
                boxShadow: 'none',
                filter: 'none',
              },
              '&:active': {
                bgcolor: '#23FFDC',
                boxShadow: 'none',
              },
              '&:focus-visible': {
                outline: '2px solid #002338',
                outlineOffset: '2px',
              },
            }}
            disableElevation
            disableRipple
          >
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "20px",
                color: "#002338",

              }}
            >
              Registrarse
            </Typography>
          </Button>

          {/* Versión */}
          <Box mt={2} textAlign="right">
            <Typography variant="caption" color="text.secondary">
              Versión: {version}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Dialog Recuperar contraseña --------------------------------- */}
      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)}>
        <DialogTitle>Recuperar contraseña</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {showConfirmation ? (
            <Typography color="success.main" fontWeight={700}>
              Se ha enviado un email a su cuenta
            </Typography>
          ) : (
            <>
              <Typography mb={2}>
                Ingrese un email para recuperar su contraseña
              </Typography>
              <TextField
                fullWidth
                label="Email"
                value={recoverEmail}
                onChange={(e) => setRecoverEmail(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 5,
                    bgcolor: "#f9f9f9",
                  },
                }}
              />
            </>
          )}
        </DialogContent>

        {!showConfirmation && (
          <DialogActions sx={{ pr: 3, pb: 2 }}>
            <Button onClick={() => setForgotOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleRecoverPassword}
              sx={{ bgcolor: colors.button || "#002338", color: colors.text || "#23FFDC" }}
            >
              Enviar
            </Button>
          </DialogActions>
        )}
      </Dialog>
      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </Grid2>
  );
}
