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
import { createSkill } from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";
import { useAppTheme } from "@/app/ThemeProviderClient";
import type { AxiosError } from "axios";

type AddSkillProps = {
  onCreated?: () => void;
};
export default function AddSkill({ onCreated }: AddSkillProps) {
  const { colors } = useAppTheme();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    status: true,
  });

  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [modalVariant, setModalVariant] = useState<
    "success" | "error" | "warning"
  >("success");
  const [modalMessage, setModalMessage] = useState("");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);
  const handleInputChange =
    (field: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [field]: event.target.value });
    };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value === "true";
    setFormData({ ...formData, status: value });
  };

  const handleSave = async () => {
    const name = formData.name.trim();
    if (!name) {
      setNameError("El nombre es obligatorio");
      return;
    }

    setNameError("");
    const payload = {
      name,
      description: formData.description.trim(),
      status: formData.status,
    };

    try {
      setSaving(true);
      await createSkill(payload);

      setModalVariant("success");
      setModalMessage("Habilidad creada con éxito.");
      setOpenModalConfirm(true);
      setFormData({ id: "", name: "", description: "", status: true });
      await onCreated?.();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setModalVariant("error");
      setModalMessage(
        axiosError.response?.data?.message ||
          "No se pudo crear la habilidad. Intentalo nuevamente."
      );
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
          height: "302px",
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
            height: "200px",
            backgroundColor: '#ffffff'
          }}
        >
          <CardContent sx={{ p: 2, backgroundColor: '#ffffff' }}>
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
                Habilidades
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Poppins",
                  fontSize: "16px",
                  color: "#002338",
                }}
              >
                Registrar Habilidad
              </Typography>
            </Box>

            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Nombre completo"
                  variant="outlined"
                  label="Nombre completo"
                  value={formData.name}
                  onChange={(event) => {
                    handleInputChange("name")(event);
                    if (nameError) setNameError("");
                  }}
                  error={Boolean(nameError)}
                  helperText={nameError}
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
                    size="small"
                    input={<OutlinedInput label="Activo" />}
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
                disabled={saving}
                sx={{
                  backgroundColor: colors.button || "#002338",
                  color: "#23FFDC",
                  fontSize: "1rem",
                  fontWeight: 600,
                  height: "40px",
                  width: "200px",
                  borderRadius: "20px",
                }}
              >
                {saving ? "Guardando..." : "Añadir"}
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
