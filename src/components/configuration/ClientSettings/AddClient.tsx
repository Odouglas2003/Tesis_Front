import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  OutlinedInput,
} from "@mui/material";
import { createClient } from "@/services/api";
import type { AxiosError } from "axios";
import ModalComponent from "@/components/message/MessageModal";
import { useAppTheme } from "@/app/ThemeProviderClient";


type AddClientProps = {
  onCreated?: () => void;
};
export default function AddClient({ onCreated }: AddClientProps) {
  const { colors } = useAppTheme();
  const [formData, setFormData] = useState({
    name: "",
    cuit: "",
    razonSocial: "",
    description: "",
    status: true,
  });

  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [modalVariant, setModalVariant] = useState<
    "success" | "error" | "warning"
  >("success");
  const [modalMessage, setModalMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; description?: string }>(
    {}
  );
  const [saving, setSaving] = useState(false);

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value });
    };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value === "true";
    setFormData({ ...formData, status: value });
  };

  const handleSave = async () => {
    // client-side validation
    const errors: { name?: string; description?: string } = {};
    if (!formData.name || formData.name.trim() === "") {
      errors.name = "El nombre es requerido";
    }
    if (!formData.description || formData.description.trim() === "") {
      errors.description = "La descripción es requerida";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setModalVariant("warning");
      setModalMessage("Por favor completá los campos requeridos antes de continuar.");
      setOpenModalConfirm(true);
      return;
    }

    // clear previous errors
    setFieldErrors({});
    // build payload only with non-empty optional fields
    type ClientPayload = {
      name: string;
      cuit: string;
      razonSocial: string;
      description: string;
      status: boolean;
    };

    const payload: ClientPayload = {
      name: formData.name.trim(),
      cuit: formData.cuit?.trim() ?? "",
      razonSocial: formData.razonSocial?.trim() ?? "",
      description: formData.description.trim(),
      status: Boolean(formData.status),
    };

    try {
      setSaving(true);
      const response = await createClient(payload);
      const respObj = response as Record<string, unknown>;
      if (respObj && respObj.client) {
        setModalVariant("success");
        setModalMessage("Cliente creado con éxito.");
        setOpenModalConfirm(true);
        setFormData({
          name: "",
          cuit: "",
          razonSocial: "",
          description: "",
          status: true,
        });
        onCreated?.();
      } else {
        throw new Error("Error al crear el cliente.");
      }
    } catch (error) {
      // Try to extract a helpful message from Axios error response
      let msg = "Hubo un error al crear el cliente. Inténtalo de nuevo.";
      try {
        const axiosErr = error as unknown as AxiosError<unknown>;
        if (axiosErr?.response) {
          const status = axiosErr.response.status;
          const data = axiosErr.response.data;
          let serverMsg: string | null = null;
          if (typeof data === "string") serverMsg = data;
          else if (typeof data === "object" && data !== null) {
            const obj = data as Record<string, unknown>;
            serverMsg = (obj.message as string) || (obj.error as string) || null;
          }
          msg = `${status} - ${serverMsg ?? "Error del servidor"}`;
        } else if (error instanceof Error) {
          msg = error.message;
        }
      } catch (e) {
        msg = (error instanceof Error && error.message) || String(error);
      }

      console.error("Error creando cliente:", error);
      setModalVariant("error");
      setModalMessage(msg);
      setOpenModalConfirm(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          p: "20px",
          boxShadow: 3,
          borderRadius: "20px",
          mb: 4,
          width: "100%",
          height: "332px",
          backgroundColor: '#ffffff'
        }}
      >
        <Box sx={{ mb: "20px" }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              color: "#2c3e50",
              fontFamily: "Poppins",
              fontSize: "18px",
            }}
          >
            Gestión de parámetros
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "16px", fontFamily: "Poppins", color: "#002338" }}
          >
            Modificá y creá parámetros para personalizar el comportamiento de la
            aplicación.
          </Typography>
        </Box>

        <Card
          sx={{
            border: "1px solid #C4C4C4",
            borderRadius: "16px",
            height: "221px",
            bgroundColor: "#FFFFFF",
          }}
        >
          <CardContent sx={{ p: 2, backgroundColor: "#FFFFFF" }}>
            <Box sx={{ mb: 1 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  fontFamily: "Poppins",
                  fontSize: "18px",
                  color: "#002338",
                }}
              >
                Clientes
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Poppins",
                  fontSize: "16px",
                  color: "#002338",
                }}
              >
                Registrar cliente
              </Typography>
            </Box>

            <Grid container spacing={1}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Nombre completo"
                  variant="outlined"
                  label="Nombre completo"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      borderRadius: "10px",
                    },
                    "& .MuiInputBase-input": {
                      fontFamily: "Poppins",
                      fontSize: "14px",
                      padding: "8px 12px",
                    },
                  }}
                  InputProps={{
                    sx: { color: "#002338" }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="CUIT"
                  variant="outlined"
                  label="CUIT"
                  value={formData.cuit}
                  onChange={handleInputChange("cuit")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      borderRadius: "10px",
                    },
                    "& .MuiInputBase-input": {
                      fontFamily: "Poppins",
                      fontSize: "14px",
                      padding: "8px 12px",
                    },
                  }}
                  InputProps={{
                    sx: { color: "#002338" }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Razón social"
                  variant="outlined"
                  label="Razón social"
                  value={formData.razonSocial}
                  onChange={handleInputChange("razonSocial")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      borderRadius: "10px",
                    },
                    "& .MuiInputBase-input": {
                      fontFamily: "Poppins",
                      fontSize: "14px",
                      padding: "8px 12px",
                    },
                  }}
                  InputProps={{
                    sx: { color: "#002338" }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl
                  sx={{
                    fontFamily: "Poppins",
                    '& .MuiSelect-select': { color: '#002338' },
                    "& .MuiOutlinedInput-root": {
                      fontFamily: "Poppins",
                      fontSize: "14px",
                      height: "40px",
                      borderRadius: "10px",
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                  }}
                  fullWidth
                  size="small"
                >
                  <InputLabel id="estado-label">Activo</InputLabel>
                  <Select
                    name="status"
                    value={String(formData.status)}
                    onChange={handleSelectChange}
                    input={<OutlinedInput label="Activo" />}
                    size="small"
                    MenuProps={{
                      PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                      MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                    }}
                  >
                    <MenuItem value="true" sx={{ color: "#002338" }}>Si</MenuItem>
                    <MenuItem value="false" sx={{ color: "#002338" }}>No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Descripción"
                  variant="outlined"
                  label="Descripción"
                  value={formData.description}
                  onChange={handleInputChange("description")}
                  error={!!fieldErrors.description}
                  helperText={fieldErrors.description}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      borderRadius: "10px",
                    },
                    "& .MuiInputBase-input": {
                      fontFamily: "Poppins",
                      fontSize: "14px",
                      padding: "8px 12px",
                    },
                  }}
                  InputProps={{
                    sx: { color: "#002338" }
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  backgroundColor: "#002338",
                  color: "#23FFDC",
                  fontSize: "1rem",
                  fontWeight: 600,
                  height: "40px",
                  width: "200px",
                  borderRadius: "20px",
                }}
                disabled={saving}
              >
                Añadir
              </Button>
            </Box>
          </CardContent>
        </Card>
        <ModalComponent
          open={openModalConfirm}
          variant={modalVariant}
          message={modalMessage}
          onClose={() => setOpenModalConfirm(false)}
        />
      </Card>
    </>
  );
}
