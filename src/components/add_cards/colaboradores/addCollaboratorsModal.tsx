"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Button,
  Typography,
  Paper,
  Slider,
  Checkbox,
  ListItemText,
  IconButton,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { SelectChangeEvent } from "@mui/material/Select";
import Grid from "@mui/material/Grid";
import ModalComponent from "@/components/message/MessageModal";
import {
  fetchProjects,
  getActiveSkills,
  fetchAddColab,
  addAssignedPersonToProject,
  getJobs,
  uploadImage,
  getImageUrl,
  getJourneyModes,
} from "@/services/api";
import {
  Project,
  Tecnologia,
  RolSeniorityInfo,
  Job,
  CollaboratorFormData,
  Asignacion,
  jornada,
} from "@/types/interface";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: { sx: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, bgcolor: '#FFFFFF', color: '#002338' } },
  MenuListProps: { sx: { bgcolor: '#FFFFFF' } }

};
const seniorityOptions = [
  "Senior advanced",
  "Senior",
  "Semi senior advanced",
  "Semi Senior",
  "Junior Advanced",
  "Junior",
  "Trainee",
];
export default function Colaboradores({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
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
  const [data, setData] = useState<CollaboratorFormData>({
    id: "",
    dni: "",
    first_name: "",
    last_name: "",
    email: "",
    estado: "",
    puesto_trabajo: "",
    // honorarios: 0,
    seniority: "",
    tecnologias: [] as string[],
    fin_contrato: "",
    start_contrato: "",
    proyectos: [] as string[],
    imageKey: "",
    image: "",
    jornadaId: "",
  });

  const [roleAssignments, setRoleAssignments] = useState<RolSeniorityInfo[]>([
    { rol: "", seniority: "" },
  ]);

  const [tecnologiasDisponibles, setTecnologiasDisponibles] = useState<
    Tecnologia[]
  >([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [asignaciones, setAsignaciones] = useState<Record<string, Asignacion>>(
    {}
  );

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [tempImageUrl, setTempImageUrl] = useState<string>("");
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [journeyModes, setJourneyModes] = useState<jornada[]>([]);
  useEffect(() => {
    async function loadProjects() {
      try {
        const pjDocs = await fetchProjects();
        setProjects(pjDocs);
        const jobsList = await getJobs();
        setJobs(jobsList);
      } catch (err) {
        showDialog("error", "Error al cargar proyectos: " + err);
      }
    }
    loadProjects();
  }, []);
  useEffect(() => {
    async function loadJourneyModes() {
      try {
        const journeyModes = await getJourneyModes();
        setJourneyModes(journeyModes);
      } catch (err) {
        showDialog("error", "Error al cargar modalidades: " + err);
      }
    }
    loadJourneyModes();
  }, []);

  useEffect(() => {
    async function loadTechnologies() {
      try {
        const techDocs = await getActiveSkills();

        setTecnologiasDisponibles(techDocs);
      } catch (err) {
        showDialog("error", "Error al cargar tecnologías: " + err);
      }
    }
    loadTechnologies();
  }, []);

  const set =
    <K extends keyof CollaboratorFormData>(k: K) =>
      (v: CollaboratorFormData[K]) =>
        setData((prev) => ({ ...prev, [k]: v }));

  const handleMultipleChange = (
    e: SelectChangeEvent<string[]>,
    k: "tecnologias" | "proyectos"
  ) => {
    const value =
      typeof e.target.value === "string"
        ? e.target.value.split(",")
        : e.target.value;
    set(k)(value);

    if (k === "proyectos") {
      setAsignaciones((prev) => {
        const next: Record<string, Asignacion> = { ...prev };
        value.forEach((p) => (next[p] ??= { rol: "", horas: 0 }));
        Object.keys(next).forEach((p) => {
          if (!value.includes(p)) delete next[p];
        });
        return next;
      });
    }
  };

  const handleAsignacionChange = (
    proj: string,
    field: keyof Asignacion,
    v: string | number
  ) =>
    setAsignaciones((prev) => ({
      ...prev,
      [proj]: { ...prev[proj], [field]: v },
    }));

  const handleSubmit = async () => {
    try {
      const fieldErrors: Record<string, boolean> = {};
      if (!data.dni) fieldErrors.dni = true;
      if (!data.first_name) fieldErrors.first_name = true;
      if (!data.last_name) fieldErrors.last_name = true;
      if (!data.email) fieldErrors.email = true;
      if (!data.jornadaId) fieldErrors.jornadaId = true;
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        return;
      }
      setErrors({});
      const roles: { rol: string; seniority: string }[] = [];
      for (const { rol, seniority } of roleAssignments) {
        if (rol.trim() && seniority.trim()) {
          roles.push({ rol, seniority });
        }
      }
      let imageUrl = data.image || "";
      if (tempImageFile) {
        const imageKey = await uploadImage(tempImageFile);
        imageUrl = await getImageUrl(imageKey);
      }
      // Find the journey mode that matches the selected jornadaId
      const jorna = journeyModes.find((p) => p.id === data.jornadaId);
      if (!jorna) {
        showDialog("error", "Modalidad no encontrada");
        return;
      }

      const collaboratorPayload = {
        dni: data.dni,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        puesto_trabajo: data.puesto_trabajo,
        estado: "Activo",
        roles: roles,
        seniority: data.seniority,
        tecnologias: data.tecnologias,
        fin_contrato: data.fin_contrato || null,
        start_contrato: data.start_contrato || null,
        // honorarios: data.honorarios || 0,
        image: imageUrl,
        jornadaId: data.jornadaId,
      };
      const resp = await fetchAddColab(collaboratorPayload);

      if (resp.status !== "success") {
        showDialog("error", resp.message || "Error al crear colaborador");
        return;
      }
      const newColabId =
        resp.data?.id ??
        resp.data?._id ??
        resp.id ??
        resp._id ??
        resp.colaborador?.id ??
        resp.colaborador?._id;

      if (!newColabId) {
        showDialog(
          "warning",
          "Colaborador creado, pero no recibí el ID para asignar proyectos."
        );
        return;
      }
      let flagError = false;
      for (const projectName of data.proyectos) {
        const proj = projects.find((p) => p.name === projectName);
        if (!proj) continue;

        const a = asignaciones[projectName] ?? { rol: "", horas: 0, tech: "" };
        const assignedRole = roleAssignments.find((r) => r.rol === a.rol);
        const personPayload = {
          id: newColabId,
          name: `${data.first_name} ${data.last_name}`,
          rol: a.rol,
          seniority: assignedRole?.seniority || "",
          tecnologias: a.tech ? [a.tech] : [],
          horasAsignadas: a.horas,
        };
        const assignResp = await addAssignedPersonToProject(
          proj.id,
          personPayload
        );
        if (assignResp.status !== "success") {
          flagError = true;
          showDialog("error", "Error al agregar colaborador");
        }
      }
      if (flagError) {
        showDialog("error", "Error al agregar colaborador");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
        return;
      } else {
        showDialog("success", "Colaborador agregado correctamente");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
        return;
      }
    } catch (err) {
      console.error(err);
      showDialog("error", "Error inesperado");
    }
  };
  const addRole = () => {
    setRoleAssignments((prev) => [...prev, { rol: "", seniority: "" }]);
  };

  const removeRole = (index: number) => {
    setRoleAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRole = (
    index: number,
    field: keyof RolSeniorityInfo,
    value: string
  ) => {
    setRoleAssignments((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const handleTechChange = (proj: string, tech: string) =>
    setAsignaciones((prev) => ({ ...prev, [proj]: { ...prev[proj], tech } }));

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setTempImageFile(file);
    setTempImageUrl(URL.createObjectURL(file));
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          maxHeight: "590px", // alto máximo
          overflowY: "auto",
          overflowX: "hidden",
          width: "982px",
          marginTop: "8.5px",
          marginLeft: "8.5px",
        }}
      >
        <Paper
          sx={{
            width: "100%",
            maxHeight: "85vh",
            overflow: "auto",
            boxShadow: "none",
            bgcolor: "#fff",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            textAlign="left"
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "20px",
              color: "#002338",
            }}
          >
            Nuevo Colaborador
          </Typography>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={10} md={4}>
              <TextField
                sx={{
                  height: "40px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    "& fieldset": {
                      borderColor: "#002338",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                }}
                InputProps={{
                  sx: {
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    pl: "18px",
                    color: "#002338",
                  },
                }}
                label="DNI*"
                type="number"
                fullWidth
                size="small"
                value={data.dni}
                onChange={(e) => {
                  set("dni")(e.target.value);
                  if (errors.dni)
                    setErrors((prev) => ({ ...prev, dni: false }));
                }}
                error={!!errors.dni}
                helperText={
                  errors.dni ? "Este campo es obligatorio" : undefined
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                sx={{
                  height: "40px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    "& fieldset": {
                      borderColor: "#002338",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                }}
                InputProps={{
                  sx: {
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    pl: "18px",
                    color: "#002338",
                  },
                }}
                label="Nombre"
                fullWidth
                size="small"
                value={data.first_name}
                onChange={(e) => {
                  set("first_name")(e.target.value);
                  if (errors.first_name)
                    setErrors((prev) => ({ ...prev, first_name: false }));
                }}
                error={!!errors.first_name}
                helperText={
                  errors.first_name ? "Este campo es obligatorio" : undefined
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                sx={{
                  height: "40px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    "& fieldset": {
                      borderColor: "#002338",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                }}
                InputProps={{
                  sx: {
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    pl: "18px",
                    color: "#002338",
                  },
                }}
                label="Apellido"
                fullWidth
                size="small"
                value={data.last_name}
                onChange={(e) => {
                  set("last_name")(e.target.value);
                  if (errors.last_name)
                    setErrors((prev) => ({ ...prev, last_name: false }));
                }}
                error={!!errors.last_name}
                helperText={
                  errors.last_name ? "Este campo es obligatorio" : undefined
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                sx={{
                  height: "40px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    "& fieldset": {
                      borderColor: "#002338",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                }}
                InputProps={{
                  sx: {
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    pl: "18px",
                    color: "#002338"
                  },
                }}
                label="Email"
                fullWidth
                size="small"
                value={data.email}
                onChange={(e) => {
                  set("email")(e.target.value);
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: false }));
                }}
                error={!!errors.email}
                helperText={
                  errors.email ? "Este campo es obligatorio" : undefined
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl
                sx={{
                  height: "40px",
                  '& .MuiSelect-select': { color: '#002338' },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    "& fieldset": { borderColor: "#002338" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                }}
                size="small"
                fullWidth
                error={!!errors.jornadaId}
              >
                <InputLabel id="jornada-label">Modalidad*</InputLabel>
                <Select
                  labelId="jornada-label"
                  label="Modalidad*"
                  value={data.jornadaId}
                  onChange={(e) => {
                    set("jornadaId")(e.target.value as string);
                    if (errors.jornadaId) {
                      setErrors((prev) => ({ ...prev, jornadaId: false }));
                    }
                  }}
                  input={<OutlinedInput label="Modalidad*" />}
                  MenuProps={{
                    PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                    MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                  }}
                >
                  {journeyModes.map((jm) => (
                    <MenuItem key={jm.id} value={jm.id} sx={{ color: "#002338" }}>
                      {jm.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.jornadaId && (
                  <FormHelperText>Este campo es obligatorio</FormHelperText>
                )}
              </FormControl>
            </Grid>
            {/* <Grid item xs={10} md={4}>
              <TextField
                sx={{
                  height: "40px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    "& fieldset": {
                      borderColor: "#002338",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                }}
                InputProps={{
                  sx: {
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    pl: "18px",
                  },
                }}
                label="Honorarios"
                type="number"
                fullWidth
                size="small"
                value={data.honorarios || ""}
                onChange={(e) => set("honorarios")(Number(e.target.value) || 0)}
              />
            </Grid> */}
            <Box display="flex" alignItems="center" sx={{ mt: 2, ml: 1.5 }}>
              <Box>
                <Button
                  component="label"
                  sx={{
                    color: "#0087FF",
                    textTransform: "none",
                    bgcolor: "transparent",
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  <CloudUploadIcon
                    sx={{ mr: 1, width: "24px", height: "24px" }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontSize: "16px",
                      fontWeight: 500,
                    }}
                  >
                    Subir foto de perfil
                  </Typography>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    hidden
                    onChange={handleFileUpload}
                  />
                </Button>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontFamily: "Poppins",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >
                (Imagen de 160 x 160 píxeles. Solo formato png o jpeg)
              </Typography>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "#fff",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #e0e4e7",
                  marginLeft: "130px",
                }}
              >
                <img
                  src={tempImageUrl ? tempImageUrl : "/anonimo.jpeg"}
                  alt="Logo"
                  style={{ maxWidth: "80%", maxHeight: "80%" }}
                />
              </Box>
            </Box>
          </Grid>
          <Grid sx={{ marginBottom: "10px", gap: 2 }}>
            <Typography
              variant="h6"
              textAlign="left"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "20px",
                mb: 2,
                color: "#002338",
              }}
            >
              Fechas:
            </Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  sx={{
                    height: "40px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "20px",
                      "& fieldset": {
                        borderColor: "#002338",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                  }}
                  size="small"
                  InputProps={{
                    sx: {
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      pl: "18px",
                      color: "#002338"
                    },
                  }}
                  label="Fecha de ingreso"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={data.start_contrato}
                  onChange={(e) => set("start_contrato")(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  sx={{
                    height: "40px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "20px",
                      "& fieldset": {
                        borderColor: "#002338",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                  }}
                  size="small"
                  InputProps={{
                    sx: {
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      pl: "18px",
                      color: "#002338"
                    },
                  }}
                  label="Fecha de Egreso"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={data.fin_contrato}
                  onChange={(e) => set("fin_contrato")(e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid sx={{ marginBottom: "10px", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "20px",
                  color: "#002338",
                }}
              >
                Roles:
              </Typography>
            </Box>
            {roleAssignments.map((ra, idx) => (
              <Grid
                container
                spacing={2}
                alignItems="center"
                key={idx}
                sx={{ mb: 1 }}
              >
                <Grid item xs={4}>
                  <FormControl
                    sx={{
                      height: "40px",
                      '& .MuiSelect-select': { color: '#002338' },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "20px",
                        "& fieldset": {
                          borderColor: "#002338",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                    }}
                    size="small"
                    fullWidth
                  >
                    <InputLabel>Puesto</InputLabel>
                    <Select
                      value={ra.rol}
                      label="Puesto"
                      onChange={(e) => updateRole(idx, "rol", e.target.value)}
                      MenuProps={MenuProps}
                    >
                      {jobs.map((job) => (
                        <MenuItem key={job.id} value={job.name} sx={{ color: "#002338" }}>
                          {job.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl
                    sx={{
                      height: "40px",
                      '& .MuiSelect-select': { color: '#002338' },

                      "& .MuiOutlinedInput-root": {
                        borderRadius: "20px",
                        "& fieldset": {
                          borderColor: "#002338",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                    }}
                    size="small"
                    fullWidth
                  >
                    <InputLabel>Seniority</InputLabel>
                    <Select
                      value={ra.seniority}
                      label="Seniority"
                      onChange={(e) =>
                        updateRole(idx, "seniority", e.target.value)
                      }
                      MenuProps={MenuProps}
                    >
                      {seniorityOptions.map((s) => (
                        <MenuItem key={s} value={s} sx={{ color: "#002338" }}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: "center" }}>
                  <IconButton
                    onClick={addRole}
                    size="small"
                    sx={{ mr: 2, color: "#0087FF" }}
                    title="Agregar rol"
                  >
                    <AddCircleOutlineIcon />
                  </IconButton>
                  {idx !== 0 && (
                    <IconButton
                      onClick={() => removeRole(idx)}
                      size="small"
                      sx={{ color: "#d32f2f" }}
                      title="Eliminar este rol"
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            ))}
          </Grid>
          <Grid sx={{ marginBottom: "10px", gap: 2 }}>
            <Typography
              variant="h6"
              textAlign="left"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "20px",
                mb: 2,
                color: "#002338",
              }}
            >
              Tecnología:
            </Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={4}>
                <FormControl
                  sx={{
                    height: "40px",
                    '& .MuiSelect-select': { color: '#002338' },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "20px",
                      "& fieldset": {
                        borderColor: "#002338",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                  }}
                  size="small"
                  fullWidth
                >
                  <InputLabel>Tecnologías</InputLabel>
                  <Select
                    multiple
                    value={data.tecnologias}
                    onChange={(e) => handleMultipleChange(e, "tecnologias")}
                    input={<OutlinedInput label="tecnologias" />}
                    renderValue={(selected) => {
                      if (selected.length === 0) return null;
                      const visibles = selected.slice(0, 2).join(", ");
                      const resto = selected.length - 2;

                      return resto > 0 ? `${visibles} +${resto}` : visibles;
                    }}
                    MenuProps={MenuProps}
                  >
                    {tecnologiasDisponibles.map((tech) => (
                      <MenuItem key={tech.id} value={tech.name} sx={{ color: "#002338" }}>
                        <Checkbox
                          checked={data.tecnologias.includes(tech.name)}
                        />
                        <ListItemText primary={tech.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
          <Grid sx={{ marginBottom: "10px", gap: 2 }}>
            <Typography
              variant="h6"
              textAlign="left"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "20px",
                mb: 2,
                color: "#002338",
              }}
            >
              Asignaciones:
            </Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={12} md={4}>
                <FormControl
                  sx={{
                    height: "40px",
                    '& .MuiSelect-select': { color: '#002338' },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "20px",
                      "& fieldset": {
                        borderColor: "#002338",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                  }}
                  size="small"
                  fullWidth
                >
                  <InputLabel>Project(s)</InputLabel>
                  <Select
                    multiple
                    value={data.proyectos}
                    onChange={(e) => handleMultipleChange(e, "proyectos")}
                    input={<OutlinedInput label="Project(s)" />}
                    renderValue={(selected) => {
                      if (selected.length === 0) return null;
                      const visibles = selected.slice(0, 2).join(", ");
                      const resto = selected.length - 2;

                      return resto > 0 ? `${visibles} +${resto}` : visibles;
                    }}
                    MenuProps={MenuProps}
                  >
                    {projects
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((p) => (
                        <MenuItem key={p.id} value={p.name} sx={{ color: '#002338' }}>
                          <Checkbox
                            checked={data.proyectos.includes(p.name)}
                            sx={{ mr: 1 }}
                          />
                          <ListItemText primary={p.name} />
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", marginBottom: "40px" }}>
            <Box sx={{ marginRight: "24px" }}>
              {data.tecnologias.length > 0 && (
                <>
                  <Box sx={{ display: "flex", alignItems: "left" }}>
                    <Typography
                      sx={{
                        mt: 2,
                        mb: 0.5,
                        fontWeight: 600,
                        fontFamily: "Poppins",
                        fontSize: "14px",
                        color: "#002338",
                      }}
                    >
                      Tecnologías
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {data.tecnologias.map((tech, idx) => (
                      <Chip
                        key={`${tech}-${idx}`}
                        label={tech}
                        size="small"
                        onDelete={() =>
                          setData((prev) => ({
                            ...prev,
                            tecnologias: prev.tecnologias.filter(
                              (t) => t !== tech
                            ),
                          }))
                        }
                        deleteIcon={
                          <Box
                            sx={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              bgcolor: "#D40000",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 14, color: "white" }} />
                          </Box>
                        }
                        sx={{
                          bgcolor: "#E8ECEF",
                          borderRadius: "9999px",
                          height: 30,
                          fontFamily: "Poppins",
                          fontSize: 12,
                          fontWeight: 300,
                          marginRight: "4px",
                          marginBottom: "4px",
                          color: "#002338",
                          textTransform: "none",
                          letterSpacing: 0.5,
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
            <Box>
              {data.proyectos.length > 0 && (
                <>
                  <Box sx={{ display: "flex", alignItems: "left" }}>
                    <Typography sx={{ mt: 2, mb: 0.5, fontWeight: 600 }}>
                      Proyectos
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {data.proyectos.map((proj) => (
                      <Chip
                        key={proj}
                        label={proj}
                        onDelete={() =>
                          setData((prev) => ({
                            ...prev,
                            proyectos: prev.proyectos.filter((p) => p !== proj),
                          }))
                        }
                        deleteIcon={
                          <Box
                            sx={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              bgcolor: "#D40000",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 14, color: "white" }} />
                          </Box>
                        }
                        sx={{
                          bgcolor: "#E8ECEF",
                          borderRadius: "9999px",
                          height: 30,
                          px: 1,
                          fontFamily: "Poppins",
                          fontSize: 12,
                          marginRight: "4px",
                          marginBottom: "4px",
                          fontWeight: 300,
                          color: "#002338",
                          textTransform: "none",
                          letterSpacing: 0.5,
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </Box>

          {data.proyectos.length > 0 && (
            <>
              <Typography
                variant="subtitle1"
                sx={{ mt: 3, mb: 1, fontWeight: "bold" }}
              >
                Asignación de proyectos
              </Typography>

              {data.proyectos.map((nombre) => (
                <Paper key={nombre} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="body1" fontWeight="bold" mb={1}>
                    {nombre}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl
                        sx={{
                          height: "40px",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "20px",
                            "& fieldset": {
                              borderColor: "#002338",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "black",
                          },
                        }}
                        fullWidth
                        size="small"
                      >
                        <InputLabel>Tecnología</InputLabel>
                        <Select
                          value={asignaciones[nombre]?.tech ?? ""}
                          onChange={(e) =>
                            handleTechChange(nombre, e.target.value as string)
                          }
                          label="Tecnología"
                          MenuProps={MenuProps}
                        >
                          {data.tecnologias.map((t) => (
                            <MenuItem key={t} value={t}>
                              {t}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl
                        sx={{
                          height: "40px",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "20px",
                            "& fieldset": {
                              borderColor: "#002338",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "black",
                          },
                        }}
                        fullWidth
                        size="small"
                      >
                        <InputLabel>Rol</InputLabel>
                        <Select
                          value={asignaciones[nombre]?.rol ?? ""}
                          onChange={(e) =>
                            handleAsignacionChange(
                              nombre,
                              "rol",
                              e.target.value
                            )
                          }
                          label="Rol"
                        >
                          {roleAssignments
                            .map((ra) => ra.rol)
                            .filter((rol) => rol)
                            .map((rol, i) => (
                              <MenuItem key={i} value={rol}>
                                {rol}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <Typography variant="body2">
                            Horas asignadas (%)
                          </Typography>
                        </Grid>
                        <Grid item xs>
                          <Slider
                            min={0}
                            max={160}
                            step={1}
                            value={asignaciones[nombre]?.horas ?? 0}
                            onChange={(_, v) =>
                              handleAsignacionChange(
                                nombre,
                                "horas",
                                v as number
                              )
                            }
                            valueLabelDisplay="auto"
                            sx={{ mt: 1, mr: 1 }}
                          />
                        </Grid>
                        <Grid item>
                          <TextField
                            variant="outlined"
                            size="small"
                            type="number"
                            sx={{ width: 100 }}
                            value={
                              asignaciones[nombre]?.horas
                                ? asignaciones[nombre]?.horas
                                : ""
                            }
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              if (!isNaN(v) && v >= 0 && v <= 160) {
                                handleAsignacionChange(nombre, "horas", v);
                              }
                            }}
                            InputProps={{
                              inputProps: {
                                min: 0,
                                max: 160,
                                step: 1,
                                style: { textAlign: "right" },
                              },
                              endAdornment: (
                                <InputAdornment position="end">
                                  hs
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </>
          )}

          <Box sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
            <Button
              variant="contained"
              onClick={onClose} // Aquí cerramos el Modal
              sx={{
                textTransform: "none",
                width: "200px",
                height: "50px",
                fontFamily: "Poppins",
                fontSize: "20px",
                color: "#0087FF",
                fontWeight: 500,
                lineHeight: "30px",
                letterSpacing: "0%",
                boxShadow: "none",
                backgroundColor: "rgb(255, 255, 255)",
                borderRadius: "20px",
                borderWidth: "1px",
                gap: "10px",
                paddingTop: "13px",
                paddingRight: "41px",
                paddingBottom: "13px !important",
                paddingLeft: "41px !important",
                border: "2px solid #0087ff",
              }}
            >
              Cerrar
            </Button>
            {/* Botón de Enviar */}
            <Button
              variant="contained"
              onClick={handleSubmit}
              fullWidth
              sx={{
                width: "200px",
                height: "50px",
                marginLeft: "4px",
                borderRadius: "20px",
                color: "#23FFDC",
                fontWeight: 500,
                fontFamily: "Poppins",
                fontSize: "20px",
                padding: "10px",
                maxWidth: "30%",
                textTransform: "none",
                backgroundColor: "#002338",
                "&:hover": { backgroundColor: "##002338" },
              }}
            >
              Guardar
            </Button>
          </Box>
        </Paper>
      </Box>
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
