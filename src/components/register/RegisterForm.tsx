"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { SelectChangeEvent } from "@mui/material/Select";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
  Grid2,
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAppTheme } from "@/app/ThemeProviderClient";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { fetchAuthorization, registerUserService } from "@/services/api";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  rol: string;
}
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  rol: string;
}

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rol: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const action = searchParams.get("action");

    if (token && action) {
      handleAuthorization(token, action);
    }
  }, [searchParams]);

  const handleAuthorization = async (token: string, action: string) => {
    /*try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/authorize/${token}/${action}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );*/
    try {
      const response = await fetchAuthorization(token, action);

      if (response) {
        setEmailSent(true);
        setError("Error");
      } else {
        setError("Error en la autorización");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error al procesar la autorización: ${err.message}`);
      } else {
        setError("Error al procesar la autorización");
      }
    }
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("El nombre es requerido");
      return false;
    }
    if (!formData.email.trim()) {
      setError("El email es requerido");
      return false;
    }
    if (!formData.password) {
      setError("La contraseña es requerida");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    if (!formData.rol) {
      setError("Debes seleccionar un rol");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    const registerData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      rol: formData.rol,
    };

    try {
      const response = await registerUserService(registerData);

      /*fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerData),
        }
      );*/

      if (response.user) {
        setEmailSent(true);
      } else {
        setError(response.message || "Error en el registro");
        if (response.details) {
          console.error("Detalles del error:", response.details);
        }
      }
    } catch (err) {
      console.error("Error completo:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Si el email fue enviado, mostrar mensaje de verificación
  if (emailSent) {
    return (
      <Grid2
        container
        justifyContent="center"
        alignItems="center"
        sx={{ height: "100vh" }}
      >
        <Grid2 size={{ xs: 11, sm: 8, md: 6, lg: 4 }}>
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              ¡Solicitud procesada!
            </Typography>
            <Typography>{error}</Typography>

            <Button
              onClick={() => router.push("/")}
              variant="contained"
              sx={{ mt: 3, bgcolor: "#002338", color: "#23FFDC" }}
            >
              Volver al inicio
            </Button>
          </Paper>
        </Grid2>
      </Grid2>
    );
  }

  /* 2. Formulario de registro */
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
        {/* Lado izquierdo (branding) */}
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

        {/* Lado derecho (form) */}
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
            gap: 2.5,
            bgcolor: "#ffffffff",
          }}
        >
          <Grid2 container sx={{ mt: "86px", alignItems: "center" }}>
            <Grid2 onClick={() => router.push("/")} sx={{ cursor: "pointer" }}>
              <KeyboardArrowLeftIcon
                fontSize="large"
                sx={{ color: "#002338" }}
              />
            </Grid2>
            <Grid2>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontSize: "24px",
                  color: "#002338",
                  // mt: "86px",
                }}
              >
                Nuevo registro
              </Typography>
            </Grid2>
          </Grid2>

          <TextField
            fullWidth
            name="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                bgcolor: "#F8F8F8",
                height: "50px",
                color: "black"
              },
            }}
          />

          <TextField
            fullWidth
            name="email"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                bgcolor: "#F8F8F8",
                height: "50px",
                color: "black"
              },
            }}
          />

          <TextField
            fullWidth
            name="password"
            placeholder="Contraseña"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                bgcolor: "#F8F8F8",
                height: "50px",
                color: "black"
              },
            }}
          />

          <TextField
            fullWidth
            name="confirmPassword"
            placeholder="Repetir Contraseña"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <VisibilityIcon />
                    ) : (
                      <VisibilityOffIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                bgcolor: "#F8F8F8",
                height: "50px",
                color: "black"
              },
            }}
          />

          {/* Rol */}
          <Select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            displayEmpty
            required
            fullWidth
            sx={{ borderRadius: "20px", bgcolor: "#F8F8F8", height: "50px", color: "black" }}
          >
            <MenuItem value="" disabled>
              Selecciona tu rol
            </MenuItem>
            <MenuItem value="administrador">Administrador</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="visitante">Visitante</MenuItem>
          </Select>

          {/* Error */}
          {error && (
            <Typography color="error" fontSize={14} textAlign="center">
              {error}
            </Typography>
          )}

          {/* Botón */}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "#002338",
              color: "#23FFDC",
              borderRadius: "20px",
              py: 1.2,
              fontWeight: 700,
              textTransform: "none",
              height: "50px",
            }}
            startIcon={
              loading && <CircularProgress size={20} color="inherit" />
            }
          >
            {loading ? "Procesando…" : "Registrarme"}
          </Button>
        </Box>
      </Paper>
    </Grid2>
  );
};
export default RegisterForm;
