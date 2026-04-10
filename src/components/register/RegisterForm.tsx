"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SelectChangeEvent } from "@mui/material/Select";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { fetchAuthorization, registerUserService } from "@/services/api";
import AuthSplitLayout, {
  authFieldSx,
  authPrimaryButtonSx,
} from "@/components/auth/AuthSplitLayout";
import { AUTH_PALETTE } from "@/theme/appPalette";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  rol: string;
}

const selectSx = {
  borderRadius: "18px",
  bgcolor: AUTH_PALETTE.inputBg,
  minHeight: "56px",
  color: AUTH_PALETTE.inputText,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: AUTH_PALETTE.inputBorder,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: AUTH_PALETTE.inputBorderHover,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: AUTH_PALETTE.focus,
  },
} as const;

const backButtonSx = {
  alignSelf: "flex-start",
  px: 1.25,
  minHeight: "40px",
  borderRadius: "14px",
  textTransform: "none",
  color: AUTH_PALETTE.title,
  borderColor: "rgba(18,48,77,0.12)",
  fontWeight: 600,
} as const;

const RegisterForm = () => {
  const router = useRouter();
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

  if (emailSent) {
    const successMessage =
      error === "Error"
        ? "Revisá tu correo para continuar con la activación del usuario."
        : error || "Te enviamos un correo para completar el registro.";

    return (
      <AuthSplitLayout
        title="Solicitud procesada"
        subtitle="La activación del usuario queda asociada al flujo de seguridad de la plataforma."
      >
        <Box
          sx={{
            borderRadius: "24px",
            border: "1px solid rgba(18,48,77,0.08)",
            backgroundColor: "rgba(244,248,251,0.78)",
            p: { xs: 2.5, md: 3 },
          }}
        >
          <Typography
            sx={{
              fontSize: "1.15rem",
              fontWeight: 700,
              color: AUTH_PALETTE.title,
              mb: 1,
            }}
          >
            Alta registrada correctamente
          </Typography>
          <Typography
            sx={{
              color: "rgba(18,48,77,0.72)",
              lineHeight: 1.65,
              mb: 3,
            }}
          >
            {successMessage}
          </Typography>

          <Button
            onClick={() => router.push("/")}
            variant="contained"
            sx={authPrimaryButtonSx}
          >
            Volver al inicio
          </Button>
        </Box>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      title="Crear cuenta"
      subtitle="Registrá un nuevo usuario y definí su rol operativo dentro de la organización."
      headerAction={
        <Button
          variant="outlined"
          startIcon={<KeyboardArrowLeftIcon />}
          onClick={() => router.push("/")}
          sx={backButtonSx}
        >
          Volver
        </Button>
      }
      heroTitle={
        <>
          Sumá nuevos perfiles
          <Box component="span" sx={{ display: "block", color: AUTH_PALETTE.textAccent }}>
            sin perder orden operativo.
          </Box>
        </>
      }
      heroDescription="Administrá accesos, roles y responsables desde una misma base visual enfocada en control, trazabilidad y eficiencia."
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          name="name"
          placeholder="Nombre completo"
          value={formData.name}
          onChange={handleChange}
          required
          sx={authFieldSx}
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
                  {showPassword ? (
                    <VisibilityIcon sx={{ color: AUTH_PALETTE.inputText }} />
                  ) : (
                    <VisibilityOffIcon sx={{ color: AUTH_PALETTE.inputText }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={authFieldSx}
        />

        <TextField
          fullWidth
          name="confirmPassword"
          placeholder="Repetir contraseña"
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
                    <VisibilityIcon sx={{ color: AUTH_PALETTE.inputText }} />
                  ) : (
                    <VisibilityOffIcon sx={{ color: AUTH_PALETTE.inputText }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={authFieldSx}
        />

        <Select
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          displayEmpty
          required
          fullWidth
          sx={selectSx}
        >
          <MenuItem value="" disabled>
            Seleccioná un rol
          </MenuItem>
          <MenuItem value="administrador">Administrador</MenuItem>
          <MenuItem value="manager">Manager</MenuItem>
          <MenuItem value="visitante">Visitante</MenuItem>
        </Select>

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

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={authPrimaryButtonSx}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {loading ? "Procesando..." : "Registrar usuario"}
        </Button>
      </Box>
    </AuthSplitLayout>
  );
};

export default RegisterForm;
