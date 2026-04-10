"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  Box,
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
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useUser } from "@/app/UserContext";
import ModalComponent from "@/components/message/MessageModal";
import LoadingAnimation from "../LoadingAnimation/page";
import AuthSplitLayout, {
  authFieldSx,
  authPrimaryButtonSx,
  authSecondaryButtonSx,
} from "@/components/auth/AuthSplitLayout";
import { recoverPassword, loginUser } from "@/services/api";
import { AUTH_PALETTE } from "@/theme/appPalette";

type JwtPayload = { exp?: number };

const NINE_HOURS_S = 9 * 60 * 60;

export default function Login({ version }: { version: string }) {
  const { setSession } = useUser();
  const router = useRouter();

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
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo iniciar sesión"
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
    } catch {
      showDialog("error", "No se pudo enviar el email. Intenta nuevamente.");
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
        title="Iniciar sesión"
        subtitle="Accedé al panel para gestionar talento, monitorear proyectos y tomar decisiones de staffing con una vista clara del equipo."
        version={version}
        heroTitle={
          <>
            Equipos mejor
            <Box
              component="span"
              sx={{
                display: "block",
                color: AUTH_PALETTE.textAccent,
              }}
            >
              asignados desde el inicio.
            </Box>
          </>
        }
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
            placeholder="Email corporativo"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: AUTH_PALETTE.inputText }} />
                </InputAdornment>
              ),
            }}
            sx={authFieldSx}
          />

          <TextField
            fullWidth
            placeholder="Contraseña"
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

          <Typography
            variant="body2"
            sx={{
              textAlign: "right",
              cursor: "pointer",
              color: AUTH_PALETTE.link,
              fontWeight: 600,
              mt: -0.5,
            }}
            onClick={() => setForgotOpen(true)}
          >
            ¿Olvidaste tu contraseña?
          </Typography>

          <Button type="submit" variant="contained" sx={authPrimaryButtonSx}>
            Ingresar
          </Button>

          <Divider sx={{ borderColor: AUTH_PALETTE.divider, my: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(18,48,77,0.6)",
                fontWeight: 500,
              }}
            >
              o
            </Typography>
          </Divider>

          <Button
            variant="contained"
            onClick={() => router.push("/pages/register")}
            sx={authSecondaryButtonSx}
            disableElevation
          >
            Crear cuenta
          </Button>
        </Box>
      </AuthSplitLayout>

      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)}>
        <DialogTitle>Recuperar contraseña</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {showConfirmation ? (
            <Typography color="success.main" fontWeight={700}>
              Se ha enviado un email a tu cuenta
            </Typography>
          ) : (
            <>
              <Typography mb={2}>
                Ingresá un email para recuperar tu contraseña
              </Typography>
              <TextField
                fullWidth
                label="Email"
                value={recoverEmail}
                onChange={(e) => setRecoverEmail(e.target.value)}
                sx={authFieldSx}
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
              sx={{
                bgcolor: AUTH_PALETTE.primaryButton,
                color: AUTH_PALETTE.primaryButtonText,
                "&:hover": {
                  bgcolor: AUTH_PALETTE.primaryButtonHover,
                },
              }}
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
    </>
  );
}
