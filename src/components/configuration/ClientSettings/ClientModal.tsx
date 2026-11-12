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
import CloseIcon from "@mui/icons-material/Close";
import { updateClient } from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";
import type { Client } from "@/types/interface";
import { useAppTheme } from "@/app/ThemeProviderClient";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editRecord: Client;
}

const emptyForm: Client = {
  id: "",
  name: "",
  cuit: "",
  razonSocial: "",
  description: "",
  status: true,
};

export default function ClientModal({
  open,
  onClose,
  onSaved,
  editRecord,
}: Props) {
  const { colors } = useAppTheme();
  const [form, setForm] = useState<Client>(emptyForm);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (open && editRecord) {
      setForm({ ...editRecord });
    }
  }, [open, editRecord]);

  const set = (k: string, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    set(name, value);
  };

  async function handleUpdate() {
    const payload = {
      name: form.name,
      description: form.description,
      cuit: form.cuit,
      razonSocial: form.razonSocial,
      status: form.status ? true : false,
    };

    const res = await updateClient(editRecord.id, payload);

    if (res.client) {
      setOpenModal(true);
      onSaved();
      onClose();
    } else {
      alert("Error al actualizar");
    }
  }

  if (!editRecord) return null;

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
            overflow: "hidden",
            borderRadius: "10px",
            boxShadow: "0 24px 64px rgba(0, 35, 56, 0.15)",
            display: "flex",
            flexDirection: "column",
            outline: "none",
            padding: "20px",
            bgcolor: "#ffffff",
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
              Modificar Cliente
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
              overflow: "auto",
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
                  Nombre del Cliente
                </Typography>
                <TextField
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Ingrese el nombre del cliente"
                  sx={{
                    fontFamily: "inherit",
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: "#FAFAFA",
                      "& fieldset": {
                        borderColor: "#E0E0E0",
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
                  CUIT
                </Typography>
                <TextField
                  name="cuit"
                  value={form.cuit || ""}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Ingrese el CUIT"
                  sx={{
                    fontFamily: "inherit",
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: "#FAFAFA",
                      "& fieldset": {
                        borderColor: "#E0E0E0",
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
                  Razón Social
                </Typography>
                <TextField
                  name="razonSocial"
                  value={form.razonSocial || ""}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Ingrese la razón social del cliente"
                  sx={{
                    fontFamily: "inherit",
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: "#FAFAFA",
                      "& fieldset": {
                        borderColor: "#E0E0E0",
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
                      backgroundColor: "#FAFAFA",
                      '& .MuiSelect-select': { color: '#12304D' },

                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#E0E0E0",
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
                  placeholder="Ingrese una descripción del cliente"
                  sx={{
                    fontFamily: "inherit",
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: "#FAFAFA",
                      "& fieldset": {
                        borderColor: "#E0E0E0",
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
                border: "1px solid #1D5FA0",
                borderRadius: "8px",
                backgroundColor: "transparent",
                height: "40px",
                width: "200px",
                textTransform: "none",
                fontFamily: "inherit",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(0, 35, 56, 0.3)",
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdate}
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
        message="Cliente actualizado exitosamente"
        onClose={() => setOpenModal(false)}
      />
    </>
  );
}
