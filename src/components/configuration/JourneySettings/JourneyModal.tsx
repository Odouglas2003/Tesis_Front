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
import { updateJourney } from "@/services/api";
import { jornada } from "@/types/interface";
import CloseIcon from "@mui/icons-material/Close";
import ModalComponent from "@/components/message/MessageModal";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editRecord: JourneyForm;
}

interface JourneyForm {
  id: string;
  name: string;
  hours: number;
  description: string;
  status: boolean;
}
const emptyForm: JourneyForm = { id: "", name: "", hours: 0, description: "", status: true };

export default function JourneyModal({
  open,
  onClose,
  onSaved,
  editRecord,
}: Props) {
  /* estado local */
  const [form, setForm] = useState<JourneyForm>(emptyForm);
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const set = (k: string, v: string | boolean | number) => setForm((p) => ({ ...p, [k]: v }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'hours') {
      const num = value === '' ? 0 : Number(value);
      set(name, isNaN(num) ? 0 : num);
    } else {
      set(name, value);
    }
  };

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      hours: form.hours,
      status: form.status ? true : false,
    };

    type UpdateJourneyResponse = {
      status?: string | number;
      success?: boolean;
      message?: string;
      jornada?: jornada;
      data?: unknown;
    };
    const res = await updateJourney(editRecord.id, payload) as unknown as UpdateJourneyResponse;
    const statusVal = res.status;
    const interpretedSuccess = (
      res.success === true ||
      statusVal === 200 ||
      statusVal === 'success' ||
      typeof statusVal === 'string' && statusVal.toLowerCase() === 'ok' ||
      !!res.jornada
    );
    if (interpretedSuccess) {
      setOpenModal(true);
    } else {

      alert("Error al guardar");
    }
    setSaving(false);
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
            borderRadius: "20px",
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
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "24px",
                color: "#002338",
              }}
            >
              Modificar Jornada de Trabajo
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
                    fontFamily: "Poppins",
                    color: "#002338",
                    fontWeight: 500,
                  }}
                >
                  Nombre de la Jornada
                </Typography>
                <TextField
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Ingrese el nombre de la jornada de trabajo"
                  sx={{
                    fontFamily: "Poppins",
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: "#fafafa",
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover fieldset": {
                        borderColor: "#002338",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#002338",
                      },
                    },
                  }}
                  InputProps={{
                    sx: { color: "#002338" }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "Poppins",
                    color: "#002338",
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
                      '& .MuiSelect-select': { color: '#002338' },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#002338",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#002338",
                      },
                    }}
                    displayEmpty
                    MenuProps={{
                      PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                      MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                    }}
                  >
                    <MenuItem value="true" sx={{ color: "#002338" }}>Activo</MenuItem>
                    <MenuItem value="false" sx={{ color: "#002338" }}>Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "Poppins",
                    color: "#002338",
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
                  placeholder="Ingrese una descripción de la jornada de trabajo"
                  sx={{
                    fontFamily: "Poppins",
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: "#fafafa",
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover fieldset": {
                        borderColor: "#002338",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#002338",
                      },
                    },
                  }}
                  InputProps={{
                    sx: { color: "#002338" }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "Poppins",
                    color: "#002338",
                    fontWeight: 500,
                  }}
                >
                  Cantidad de Horas
                </Typography>
                <TextField
                  type="number"
                  name="hours"
                  value={form.hours || ""}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Ingrese la cantidad de horas"
                  sx={{
                    fontFamily: "Poppins",
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: "#fafafa",
                      "& fieldset": {
                        borderColor: "#e0e0e0",

                      },
                      "&:hover fieldset": {
                        borderColor: "#002338",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#002338",
                      },
                    },
                  }}
                  InputProps={{
                    sx: { color: "#002338" }
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
                color: "#0087FF",
                border: "1px solid #0087FF",
                borderRadius: "20px",
                bgcolor: "transparent",
                height: "40px",
                width: "200px",
                textTransform: "none",
                fontFamily: "Poppins",
                fontWeight: 500,
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{
                backgroundColor: saving ? '#4b5a63' : "#002338",
                color: "#23FFDC",
                borderRadius: "20px",
                height: "40px",
                width: "200px",
                textTransform: "none",
                fontFamily: "Poppins",
                fontWeight: 500,
                boxShadow: "0 4px 12px rgba(0, 35, 56, 0.3)",
              }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
        </Paper>
      </Modal>

      <ModalComponent
        open={openModal}
        variant="success"
        message="Jornada de Trabajo actualizado exitosamente"
        onClose={() => {
          setOpenModal(false);
          onSaved();
          onClose();
        }}
      />
    </>
  );
}
