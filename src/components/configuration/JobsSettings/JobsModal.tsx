"use client";
import {
  Modal,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  Grid,
  IconButton,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { useState, useEffect } from "react";
import { updateJob } from "@/services/api";
import CloseIcon from "@mui/icons-material/Close";
import ModalComponent from "@/components/message/MessageModal";
import { useAppTheme } from "@/app/ThemeProviderClient";


interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editRecord: JobForm;
}

interface JobForm {
  id: string;
  name: string;
  description: string;
  status: boolean;
}
const emptyForm: JobForm = { id: "", name: "", description: "", status: true };

export default function JobsModal({
  open,
  onClose,
  onSaved,
  editRecord,
}: Props) {
  const { colors } = useAppTheme();
  /* estado local */
  const [form, setForm] = useState<JobForm>(emptyForm);
  const [openModal, setOpenModal] = useState(false);

  /* sincroniza al abrir o cambiar registro */
  useEffect(() => {
    if (open) {
      setForm(
        editRecord
          ? { ...editRecord, }
          : emptyForm
      );
    }
  }, [open, editRecord]);

  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    set(name, value);
  };

  async function handleSave() {
    const payload = {
      name: form.name,
      description: form.description,
      status: form.status ? true : false,
    };

    const res = await updateJob(editRecord.id, payload);

    if (res.role) {
      setOpenModal(true);
      onSaved();
      onClose();
    } else {
      alert("Error al guardar");
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper
          sx={{
            width: "1042px",
            borderRadius: "10px",
            boxShadow: "0 24px 64px rgba(0, 35, 56, 0.15)",
            display: "flex",
            flexDirection: "column",
            outline: "none",
            padding: "20px",
            backgroundColor: '#ffffff'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: "inherit",
                fontWeight: 500,
                fontSize: "24px",
                color: "#12304D",
              }}
            >
              Modificar Puesto de Trabajo
            </Typography>
            <IconButton
              onClick={onClose}
              sx={{
                color: "#666",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              mt: 1,
              mb: "20px",
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={12} md={3}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "inherit",
                    color: "#12304D",
                    fontWeight: 500,
                  }}
                >
                  Nombre del Puesto
                </Typography>
                <TextField
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Ingrese el nombre del puesto de trabajo"
                  sx={{
                    fontFamily: "inherit",
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: "#fafafa",
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover fieldset": {
                        borderColor: "#8FA3B6",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#1D5FA0",
                      },
                    },
                  }}
                  InputProps={{
                    sx: { color: "#12304D" }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "inherit",
                    color: "#12304D",
                    fontWeight: 500,
                  }}
                >
                  Estado
                </Typography>

                <FormControl fullWidth>
                  <Select
                    name="status"
                    value={"status" in form ? String(form.status) : ""}
                    onChange={(e) => set("status", e.target.value === "true")}
                    sx={{
                      height: "40px",

                      borderRadius: "12px",
                      backgroundColor: "#fafafa",
                      '& .MuiSelect-select': { color: '#12304D' },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#C9D3DE",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#C9D3DE",
                      },
                    }}
                    displayEmpty
                    MenuProps={{
                      PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#12304D' } },
                      MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                    }}
                  >
                    <MenuItem value="true" sx={{ color: "#12304D" }}>Activo</MenuItem>
                    <MenuItem value="false" sx={{ color: "#12304D" }}>Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "inherit",
                    color: "#12304D",
                    fontWeight: 500,
                  }}
                >
                  Descripción
                </Typography>
                <TextField
                  multiline
                  rows={1}
                  name="description"
                  value={form.description || ""}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Ingrese una descripción del puesto de trabajo"
                  sx={{
                    fontFamily: "inherit",
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: "#fafafa",
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover fieldset": {
                        borderColor: "#8FA3B6",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#1D5FA0",
                      },
                    },
                  }}
                  InputProps={{
                    sx: { color: "#12304D" }
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              display: "flex",
              gap: 2,

              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                color: "#1D5FA0",
                border: `1px solid "#1D5FA0"`,
                borderRadius: "8px",
                backgroundColor: "transparent",
                height: "40px",
                width: "200px",
                textTransform: "none",
                fontFamily: "inherit",
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                backgroundColor: "#1D5FA0",
                color: "#FFFFFF",
                borderRadius: "8px",
                height: "40px",
                width: "200px",
                textTransform: "none",
                fontFamily: "inherit",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(0, 35, 56, 0.3)",
              }}
            >
              Guardar
            </Button>
          </Box>
        </Paper>
      </Modal>

      <ModalComponent
        open={openModal}
        variant="success"
        message="Puesto de Trabajo actualizado exitosamente"
        onClose={() => setOpenModal(false)}
      />
    </>
  );
}
