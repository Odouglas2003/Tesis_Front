"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Card,
  IconButton,
  Typography,
  Grid2,
  InputAdornment,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  Employee, User, Project, Job, Skill, jornada,
  AssignmentUI,
} from "@/types/interface";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  removecollaborator,
  removeAssignedPerson,
  updateCollaboratorServiceedit,
  addAssignedPersonToProject,
  updateAssignedPersonToProject,
  getJobs,
  uploadImage,
  getImageUrl,
  getJourneyModes,
  recordDailyHistory,
} from "@/services/api";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { Slider } from "@mui/material";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import ModalComponent from "@/components/message/MessageModal";
import { useAuthRole } from "@/app/hooks/useAuthRole";
import { useAppTheme } from "@/app/ThemeProviderClient";
import { uniformAssignments} from "@/utils/utils";


export default function EditEmploye({
  skillProp,
  projectProp,
  colabId,
  usersProp,
}: {
  skillProp: Skill[];
  projectProp: Project[];
  colabId: Employee;
  usersProp: User[];
}) {
  const { colors } = useAppTheme();
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
  const [editedColab, setEditedColab] = useState<Employee>(colabId);
  const [techSelectOpen, setTechSelectOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [journeyModes, setJourneyModes] = useState<jornada[]>([]);
  useEffect(() => {
    async function loadJourneyModes() {
      try {
        const journeyModes = await getJourneyModes();
        setJourneyModes(journeyModes);
        console.log(journeyModes);
      } catch (err) {
        showDialog("error", "Error al cargar modalidades: " + err);
      }
    }
    loadJourneyModes();
  }, []);
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsList = await getJobs();
        setJobs(jobsList);
      } catch (error) {
        showDialog("error", "Error al cargar los puestos de trabajo");
      }
    };
    fetchJobs();
  }, []);
  useEffect(() => {
    setEditedColab({
      ...colabId,
      roles:
        colabId.roles && colabId.roles.length > 0
          ? colabId.roles
          : [{ rol: "", seniority: "" }],
    });
  }, [colabId]);

  const handleBack = () => {
    router.push(`/pages/detail/collaborator_detail/${editedColab.id}`);
  };
  const { currentUser, currentUserId } = useAuthRole();
  const [baseline, setBaseline] = useState<AssignmentUI[]>(
    uniformAssignments(colabId.Proyectos, projectProp)
  );

  const snapFromAssignment = (a: AssignmentUI | undefined) => a && ({
    projectId: a.projectId.id,
    projectName: a.projectId.name,
    role: a.rol,
    hoursAssigned: Number(a.horasAsignadas ?? 0),
  });
  // ⬇️ REEMPLAZA tu handleSave por este
  const handleSave = async () => {
    // 1) normalizar asignaciones del estado editado (UI) con refs de proyecto
    const editedUniform: AssignmentUI[] = uniformAssignments(editedColab.Proyectos, projectProp);

    // 2) filtrar sólo proyectos válidos (no borrados)
    const proyectosValidos: AssignmentUI[] = editedUniform.filter(({ projectId }) =>
      projectProp.some((p) => p.id === projectId.id && !p.delete_at)
    );

    // 3) construir previous/next para historial usando BASELINE (estado previo persistido)
    const previousSet = baseline
      .map(snapFromAssignment)
      .filter((s): s is NonNullable<ReturnType<typeof snapFromAssignment>> => Boolean(s));

    const nextSet = proyectosValidos
      .map(snapFromAssignment)
      .filter((s): s is NonNullable<ReturnType<typeof snapFromAssignment>> => Boolean(s));

    try {
      // ====== 3.1) Registrar historial del cambio (si falla, no rompemos el guardado)
      try {
        await recordDailyHistory(editedColab.id, {
          userId: (currentUserId as string) || undefined,
          previous: previousSet, // estado inmediatamente ANTES
          next: nextSet,         // estado inmediatamente DESPUÉS
        });
      } catch (e) {
        console.warn("No se pudo registrar historial:", e);
      }

      // ====== 4) Sync de asignaciones en backend (diff entre baseline y estado actual)
      const originalIds = baseline.map((a) => a.projectId.id);
      const newIds = proyectosValidos.map((a) => a.projectId.id);

      const removidos = originalIds.filter((id) => !newIds.includes(id));
      const añadidos = newIds.filter((id) => !originalIds.includes(id));
      const comunes = newIds.filter((id) => originalIds.includes(id));

      // 4.1) remover del proyecto
      for (const pid of removidos) {
        await removeAssignedPerson(pid, editedColab.id);
      }

      // 4.2) agregar al proyecto
      for (const pid of añadidos) {
        const asign = proyectosValidos.find((a) => a.projectId.id === pid);
        const proyectoObj = projectProp.find((p) => p.id === pid);
        if (asign && proyectoObj) {
          await addAssignedPersonToProject(proyectoObj.id, {
            id: editedColab.id,
            name: `${editedColab.first_name ?? ""} ${editedColab.last_name ?? ""}`.trim(),
            rol: asign.rol,
            seniority: asign.seniority,
            tecnologias: editedColab.tecnologias || [],
            horasAsignadas: asign.horasAsignadas,
          });
        }
      }

      // 4.3) actualizar comunes si cambiaron rol/horas/seniority o datos del colab
      const origName = `${colabId.first_name} ${colabId.last_name}`.trim();
      const newName = `${editedColab.first_name ?? ""} ${editedColab.last_name ?? ""}`.trim();
      const nameChanged = origName !== newName;

      const origTech = colabId.tecnologias || [];
      const newTech = editedColab.tecnologias || [];
      const techChanged = JSON.stringify(origTech) !== JSON.stringify(newTech);

      for (const pid of comunes) {
        const prev = baseline.find((x) => x.projectId.id === pid);
        const nxt = proyectosValidos.find((x) => x.projectId.id === pid);
        if (!prev || !nxt) continue;

        const changed =
          prev.horasAsignadas !== nxt.horasAsignadas ||
          prev.rol !== nxt.rol ||
          prev.seniority !== nxt.seniority ||
          nameChanged ||
          techChanged;

        if (changed) {
          await updateAssignedPersonToProject(pid, editedColab.id, {
            name: newName,
            rol: nxt.rol,
            seniority: nxt.seniority,
            tecnologias: newTech,
            horasAsignadas: nxt.horasAsignadas,
          });
        }
      }

      // ====== 5) Upload de imagen (si hay)
      let imageUrl: string = editedColab.image || "";
      if (tempImageFile) {
        const imageKey: string = await uploadImage(tempImageFile);
        imageUrl = await getImageUrl(imageKey);
      }

      // ====== 6) Guardar colaborador
      const totalHoras = proyectosValidos.reduce((sum, a) => sum + (a.horasAsignadas ?? 0), 0);

      const colabToSave = {
        ...editedColab,
        jornadaId: selectedJornadaId,
        Proyectos: proyectosValidos.map((a) => ({
          ...a,
          projectId: a.projectId.id,
          tecnologias:
            Array.isArray(editedColab.tecnologias)
              ? editedColab.tecnologias.join(",")
              : editedColab.tecnologias ?? "",
        })), // backend espera id puro y campo 'tecnologias' como string
        dni: editedColab.dni,
        horasAsignadas: totalHoras,
        roles: editedColab.roles,
        created_at: editedColab.created_at ? new Date(editedColab.created_at) : null,
        fin_contrato: editedColab.fin_contrato ? new Date(editedColab.fin_contrato) : null,
        image: imageUrl,
        tecnologias: editedColab.tecnologias,
        last_edited_by: (currentUser as string) || "desconocido",
        last_edited_on: new Date().toISOString(),
      };

      const resp = await updateCollaboratorServiceedit(editedColab.id, colabToSave);

      if ((resp as { status?: string }).status === "success") {
        // ====== 7) si todo OK, el baseline pasa a ser el "después" actual
        setBaseline(proyectosValidos);
        showDialog("success", "¡Colaborador actualizado exitosamente!");
        setTimeout(() => router.push(`/pages/detail/collaborator_detail/${editedColab.id}`), 1500);
      } else {
        showDialog("error", "No se pudo guardar. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error(error);
      showDialog("error", "No se pudo guardar. Inténtalo de nuevo.");
    }
  };







  function formatDateForInput(dateString?: string | Date | null) {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toISOString().slice(0, 10);
  }
  const handleDeleteColaborador = async () => {
    try {
      if (editedColab.Proyectos && editedColab.Proyectos.length > 0) {
        for (const assignment of editedColab.Proyectos) {
          const projId =
            typeof assignment.projectId === "object"
              ? assignment.projectId.id
              : assignment.projectId;
          if (projId) {
            await removeAssignedPerson(projId, editedColab.id);
          }
        }
      }
      await removecollaborator(editedColab.id);
      showDialog("success", "¡Colaborador eliminado exitosamente!");
      setTimeout(() => router.push(`/pages/collaborators`), 2000);
    } catch (error) {
      showDialog("error", "Error al eliminar el colaborador");
    }
  };
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };
  const [tempImageUrl, setTempImageUrl] = useState<string>(
    editedColab.image || ""
  );
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTempImageFile(file);
    setTempImageUrl(URL.createObjectURL(file));
  };
  const selectedJornadaId =
    typeof editedColab.jornadaId === "object" && (editedColab.jornadaId)?.id
      ? (editedColab.jornadaId).id
      : (typeof editedColab.jornadaId === "string" ? editedColab.jornadaId : "");
  return (
    <>
      <Grid2
        container
        sx={{
          marginLeft: "55px",
          marginRight: "55px",
        }}
      >
        <Grid2 size={12}>
          <Grid2
            onClick={handleBack}
            sx={{
              width: "97px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <KeyboardArrowLeftIcon
              sx={{ width: "24px", height: "24px", color: "#002338" }}
            />
            <Typography
              sx={{
                textAlign: "center",
                color: "#002338",
                fontSize: "20px",
                fontFamily: "Poppins",
                fontWeight: 400,
              }}
            >
              Volver
            </Typography>
          </Grid2>
        </Grid2>
        <Grid2 size={12} mt={"30px"}>
          <Card
            elevation={6}
            sx={{
              width: { xs: "90%", md: "100%" },
              borderRadius: "20px",
              backgroundColor: "#FFFFFF",
              padding: "40px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 24, md: "32px" },
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  color: "#002338",
                }}
              >
                Editar Colaborador
              </Typography>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  background: colors?.button || "#0087FF",
                  borderRadius: "20px",
                  padding: "12px 41px",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: "20px",
                  height: "50px",
                  color: "#FFFFFF",
                  boxShadow: "none",
                  textTransform: "none",
                  "&:hover": {
                    background: "#0066CC",
                    boxShadow: "none",
                  },
                }}
              >
                Guardar
              </Button>
            </Box>

            <Box sx={{ px: { xs: 1, md: 3 }, pb: 3 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 500,
                    color: "#002338",
                    mb: 1,
                  }}
                >
                  Datos base:
                </Typography>
              </Grid>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  md={2}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: "#fff",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #e0e4e7",
                      mb: 1,
                    }}
                  >
                    <img
                      src={tempImageUrl ? tempImageUrl : "/anonimo.jpeg"}
                      alt="Logo"
                      style={{ maxWidth: "80%", maxHeight: "80%" }}
                    />
                  </Box>
                  <IconButton
                    onClick={handleCameraClick}
                    sx={{
                      bgcolor: "#f8f9fa",
                      border: "1px solid #e0e4e7",
                      mt: -2,
                      mb: 1,
                      "&:hover": { bgcolor: "#e8f0fe" },
                    }}
                  >
                    <PhotoCameraIcon
                      sx={{ color: "#5f6368", fontSize: "18px" }}
                    />
                  </IconButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </Grid>

                <Grid item xs={12} sm={9} md={10}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="DNI"
                        fullWidth
                        size="small"
                        value={editedColab.dni}
                        onChange={(e) =>
                          setEditedColab((prev) => ({
                            ...prev,
                            dni: Number(e.target.value),
                          }))
                        }
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
                        InputProps={{
                          sx: {
                            color: "#002338",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Nombre"
                        fullWidth
                        size="small"
                        value={editedColab.first_name || ""}
                        onChange={(e) =>
                          setEditedColab((prev) => ({
                            ...prev,
                            first_name: e.target.value,
                          }))
                        }
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
                        InputProps={{
                          sx: {
                            color: "#002338",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Apellido"
                        fullWidth
                        size="small"
                        value={editedColab.last_name || ""}
                        onChange={(e) =>
                          setEditedColab((prev) => ({
                            ...prev,
                            last_name: e.target.value,
                          }))
                        }
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
                        InputProps={{
                          sx: {
                            color: "#002338",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Fecha de Ingreso"
                        type="date"
                        fullWidth
                        size="small"
                        value={formatDateForInput(editedColab.start_contrato)}
                        onChange={(e) =>
                          setEditedColab((prev) => ({
                            ...prev,
                            start_contrato: e.target.value
                              ? new Date(e.target.value)
                              : null,
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
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
                        InputProps={{
                          sx: {
                            color: "#002338",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Fecha de Egreso"
                        type="date"
                        fullWidth
                        size="small"
                        value={formatDateForInput(editedColab.fin_contrato)}
                        onChange={(e) =>
                          setEditedColab((prev) => ({
                            ...prev,
                            fin_contrato: e.target.value
                              ? new Date(e.target.value)
                              : null,
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
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
                        InputProps={{
                          sx: {
                            color: "#002338",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      sx={{
                        color: "red",
                        cursor: "pointer",
                        mt: "20px",
                        display: "flex",
                        alignItems: "center",
                      }}
                      onClick={() =>
                        showDialog(
                          "warning",
                          `¿Estás seguro de eliminar al colaborador ${editedColab.first_name} ${editedColab.last_name}?`,
                          handleDeleteColaborador
                        )
                      }
                    >
                      Eliminar colaborador
                      <DeleteIcon sx={{ ml: 1 }} />
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ px: { xs: 1, md: 3 }, pb: 3 }}>
              <Typography
                sx={{
                  fontSize: "20px",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  color: "#002338",
                  mb: 1,
                }}
              >
                Datos complementarios:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    fullWidth
                    size="small"
                    value={editedColab.email || ""}
                    onChange={(e) =>
                      setEditedColab((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
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
                        color: "#002338",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
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
                  >
                    <InputLabel id="modalidad-label">Modalidad</InputLabel>
                    <Select
                      labelId="modalidad-label"
                      label="Modalidad"
                      value={selectedJornadaId || ""}
                      onChange={(e) =>
                        setEditedColab((prev) => ({
                          ...prev,
                          jornadaId: e.target.value as string,
                        }))
                      }
                      MenuProps={{
                        PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                        MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                      }}
                    >
                      {journeyModes.map((jm) => (
                        <MenuItem key={jm.id} value={jm.id}>
                          {jm.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* <Grid item xs={12} sm={6}>
                  <TextField
                    label="Honorario"
                    fullWidth
                    size="small"
                    value={editedColab.honorarios}
                    onChange={(e) =>
                      setEditedColab((prev) => ({
                        ...prev,
                        honorarios: Number(e.target.value),
                      }))
                    }
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
                  />
                </Grid> */}
              </Grid>
            </Box>
            <Box sx={{ px: { xs: 1, md: 3 }, pb: 3, mt: 2 }}>
              <Box
                sx={{
                  pb: 3,
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "20px",
                    width: "100%",
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    color: "#002338",
                    mb: 1,
                  }}
                >
                  Puestos de trabajo:
                </Typography>
                <Button
                  onClick={() =>
                    setEditedColab((prev) => ({
                      ...prev,
                      roles: [...prev.roles!, { rol: "", seniority: "" }],
                    }))
                  }
                  sx={{
                    width: "230px",
                    height: "50px",
                    backgroundColor: "#0087FF",
                    color: "#fff",
                    borderRadius: "20px",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#0066CC",
                    },
                  }}
                >
                  + Agregar Puesto
                </Button>
              </Box>

              {editedColab.roles!.map((roleObj, idx) => (
                <Grid
                  container
                  spacing={2}
                  alignItems="center"
                  key={idx}
                  sx={{ mb: 1 }}
                >
                  {/* Select Puesto */}
                  <Grid item xs={5} sm={4} md={3}>
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
                      <InputLabel id={`rol-label-${idx}`}>Puesto</InputLabel>
                      <Select
                        labelId={`rol-label-${idx}`}
                        label="Puesto"
                        value={roleObj.rol}
                        onChange={(e) => {
                          const roles = [...editedColab.roles!];
                          roles[idx] = { ...roles[idx], rol: e.target.value };
                          setEditedColab((prev) => ({ ...prev, roles }));
                        }}
                        MenuProps={{
                          PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                          MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                        }}
                      >
                        {jobs.map((job) => (
                          <MenuItem key={job.id} value={job.name}>
                            {job.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={5} sm={4} md={3}>
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
                      <InputLabel id={`seniority-label-${idx}`}>
                        Seniority
                      </InputLabel>
                      <Select
                        labelId={`seniority-label-${idx}`}
                        label="Seniority"
                        value={roleObj.seniority}
                        onChange={(e) => {
                          const roles = [...editedColab.roles!];
                          roles[idx] = {
                            ...roles[idx],
                            seniority: e.target.value,
                          };
                          setEditedColab((prev) => ({ ...prev, roles }));
                        }}
                        MenuProps={{
                          PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                          MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                        }}
                      >
                        {[
                          "-",
                          "Senior advanced",
                          "Senior",
                          "Semi senior advanced",
                          "Semi Senior",
                          "Junior Advanced",
                          "Junior",
                          "Trainee",
                        ].map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid
                    item
                    xs={2}
                    sm={4}
                    md={6}
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                  >
                    <IconButton
                      onClick={() => {
                        const roles = editedColab.roles!.filter(
                          (_, i) => i !== idx
                        );
                        setEditedColab((prev) => ({ ...prev, roles }));
                      }}
                      sx={{
                        color: "#d32f2f",
                        display: "flex",
                        alignItems: "center",
                        marginLeft: "460px",
                      }}
                      aria-label="Eliminar puesto"
                      title="Eliminar puesto"
                    >
                      <CloseIcon />
                      <Typography
                        sx={{
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "14px",
                          color: "#d32f2f",
                          fontWeight: 500,
                          textTransform: "none",
                        }}
                      >
                        Eliminar puesto
                      </Typography>
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Box>
            <Box sx={{ px: { xs: 1, md: 3 }, pb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: "#002338", }}>
                Tecnologías
              </Typography>
              <Grid item xs={12} sm={6}>
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
                  <InputLabel id="tecnologias-label">
                    Agregar tecnología
                  </InputLabel>
                  <Select
                    label="Agregar tecnología"
                    multiple
                    open={techSelectOpen}
                    onOpen={() => setTechSelectOpen(true)}
                    onClose={() => setTechSelectOpen(false)}
                    value={[]}
                    onChange={(e) => {
                      const newTechs = e.target.value as string[];
                      setEditedColab((prev) => ({
                        ...prev,
                        tecnologias: [
                          ...(prev.tecnologias || []),
                          ...newTechs.filter(
                            (t) => !(prev.tecnologias || []).includes(t)
                          ),
                        ],
                      }));
                      setTechSelectOpen(false);
                    }}
                    renderValue={() => ""}
                    MenuProps={{
                      PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                      MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                    }}
                  >
                    {skillProp.map((t, index) => (
                      <MenuItem
                        key={`tech-select-${t.id || index}`}
                        value={t.name}
                      >
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}
                  >
                    {(editedColab.tecnologias || []).map((tecnologia, idx) => {
                      const techObj = skillProp.find(
                        (t) => t.name === tecnologia
                      );
                      return (
                        <Chip
                          key={`tech-chip-${tecnologia}-${idx}`}
                          label={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <span>{tecnologia}</span>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setEditedColab((prev) => ({
                                    ...prev,
                                    tecnologias:
                                      prev.tecnologias?.filter(
                                        (t) => t !== tecnologia
                                      ) || [],
                                  }))
                                }
                                sx={{
                                  ml: 1,
                                  background: "#d32f2f",
                                  color: "#fff",
                                  width: 22,
                                  height: 22,
                                  "&:hover": {
                                    background: "#b71c1c",
                                  },
                                }}
                              >
                                <CloseIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          }
                          sx={{
                            background: "#e5e8eb",
                            color: "#002338",
                            fontWeight: 600,
                            fontFamily: "Poppins, sans-serif",
                            mr: 1,
                            mb: 1,
                            ".MuiChip-label": {
                              display: "flex",
                              alignItems: "center",
                              px: 1,
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ ml: { xs: 0, md: "30px" }, mr: { xs: 0, md: "30px" } }}>
              <Box
                sx={{
                  pb: 3,
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontSize: "20px",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 500,
                    color: "#002338",
                  }}
                >
                  Asignaciones:
                </Typography>
                <Button
                  onClick={() =>
                    setEditedColab((prev) => ({
                      ...prev,
                      Proyectos: [
                        ...(prev.Proyectos || []),
                        {
                          projectId: { id: "", name: "" } as {
                            id: string;
                            name: string;
                          },
                          rol: "",
                          seniority: "",
                          horasAsignadas: 0,
                          tecnologias: "",
                        },
                      ],
                    }))
                  }
                  sx={{
                    width: "230px",
                    height: "50px",
                    backgroundColor: "#0087FF",
                    color: "#fff",
                    borderRadius: "20px",
                    px: 4,
                    py: 1,
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#0066CC",
                    },
                  }}
                >
                  + Agregar Asignación
                </Button>
              </Box>
              {editedColab.Proyectos && editedColab.Proyectos.length > 0 ? (
                editedColab.Proyectos.map((asig, idx) => (
                  <Grid
                    container
                    spacing={2}
                    key={`${asig.projectId?.id ?? idx}-${idx}`}
                    sx={{ mb: 1 }}
                  >
                    <Grid item xs={4}>
                      {asig.projectId && asig.projectId.id ? (
                        <TextField
                          label="Proyecto"
                          fullWidth
                          size="small"
                          value={asig.projectId.name}
                          disabled
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              color: "#6c757d",
                              fontFamily: "Poppins",
                              fontSize: "14px",
                              height: "40px",
                              borderRadius: "20px",
                              padding: "12px 16px",
                            },
                            "& .MuiInputLabel-root.Mui-disabled": {
                              color: "#6c757d",
                            },
                          }}
                          InputProps={{
                            sx: {
                              color: "#002338",
                            },
                          }}
                        />
                      ) : (
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
                            "& .MuiInputLabel-root.Mui-focused": {
                              color: "black",
                            },
                          }}
                          size="small"
                          fullWidth
                        >
                          <InputLabel id={`proyecto-label-${idx}`}>
                            Proyecto
                          </InputLabel>
                          <Select
                            labelId={`proyecto-label-${idx}`}
                            label="Proyecto"
                            value={
                              asig.projectId && "id" in asig.projectId
                                ? asig.projectId.id
                                : ""
                            }
                            onChange={(e) => {
                              const selId = e.target.value as string;
                              const proj = projectProp.find(
                                (p) => p.id === selId
                              )!;
                              setEditedColab((prev) => ({
                                ...prev,
                                Proyectos: prev.Proyectos!.map((item, i) =>
                                  i === idx
                                    ? {
                                      ...item,
                                      projectId: {
                                        id: proj.id,
                                        name: proj.name,
                                      },
                                    }
                                    : item
                                ),
                              }));
                            }}
                            MenuProps={{
                              PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                              MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                            }}
                          >
                            {projectProp
                              .filter((p) => !p.delete_at)
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                  {p.name}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      )}
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
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "black",
                          },
                        }}
                        size="small"
                        fullWidth
                      >
                        <InputLabel id={`rol-label-${idx}`}>Rol</InputLabel>
                        <Select
                          labelId={`rol-label-${idx}`}
                          label="Rol"
                          value={asig.rol || ""}
                          onChange={(e) => {
                            const selectedRol = e.target.value as string;
                            const rolObj = editedColab.roles!.find(
                              (r) => r.rol === selectedRol
                            );
                            const nuevaSeniority = rolObj?.seniority ?? "";

                            setEditedColab((prev) => ({
                              ...prev,
                              Proyectos: prev.Proyectos!.map((item, i) =>
                                i === idx
                                  ? {
                                    ...item,
                                    rol: selectedRol,
                                    seniority: nuevaSeniority,
                                  }
                                  : item
                              ),
                            }));
                          }}
                          MenuProps={{
                            PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                            MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                          }}
                        >
                          {editedColab
                            .roles!.filter((r) => r.rol)
                            .map((r, i) => (
                              <MenuItem key={i} value={r.rol}>
                                {r.rol}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="Seniority"
                        value={
                          editedColab.roles?.find((r) => r.rol === asig.rol)
                            ?.seniority || "-"
                        }
                        fullWidth
                        size="small"
                        sx={{
                          height: "40px",
                          '& .MuiSelect-select': { color: '#002338' },

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
                        InputProps={{
                          sx: {
                            color: "#002338",
                          },
                        }}
                      >
                        <InputLabel id={`seniority-label-${idx}`}>
                          Seniority
                        </InputLabel>
                        <Select
                          labelId={`seniority-label-${idx}`}
                          label="Seniority"
                          value={asig.seniority || ""}
                          onChange={(e) =>
                            setEditedColab((prev) => ({
                              ...prev,
                              Proyectos: prev.Proyectos!.map((item, i) =>
                                i === idx
                                  ? { ...item, seniority: e.target.value }
                                  : item
                              ),
                            }))
                          }
                        >
                          <MenuItem value={asig.seniority}>
                            {asig.seniority}
                          </MenuItem>
                        </Select>
                      </TextField>
                    </Grid>
                    <Grid item xs={8}>
                      <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item>
                            <Typography variant="body2" sx={{ color: "#002338" }}>
                              Horas asignadas (%)
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <Slider
                              min={0}
                              max={160}
                              step={1}
                              value={asig.horasAsignadas ?? 0}
                              onChange={(_, v) =>
                                setEditedColab((prev) => ({
                                  ...prev,
                                  Proyectos: prev.Proyectos!.map((item, i) =>
                                    i === idx
                                      ? { ...item, horasAsignadas: v as number }
                                      : item
                                  ),
                                }))
                              }
                              valueLabelDisplay="auto"
                              sx={{ mt: 1, mr: 1 }}
                            />
                          </Grid>
                          <Grid item>
                            <TextField
                              type="number"
                              size="small"
                              value={
                                asig.horasAsignadas !== undefined
                                  ? asig.horasAsignadas
                                  : ""
                              }
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                if (!isNaN(v) && v >= 0 && v <= 160) {
                                  setEditedColab((prev) => ({
                                    ...prev,
                                    Proyectos: prev.Proyectos!.map((item, i) =>
                                      i === idx
                                        ? { ...item, horasAsignadas: v }
                                        : item
                                    ),
                                  }));
                                }
                              }}
                              InputProps={{
                                sx: { color: "#002338" },
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
                              sx={{
                                width: 100,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 1,
                      }}
                    >
                      <IconButton
                        sx={{
                          color: "red",
                          mt: 4,
                          ml: "200px",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={() => {
                          setEditedColab((prev) => ({
                            ...prev,
                            Proyectos: prev.Proyectos.filter((_, i) => i !== idx),
                          }));
                        }}
                        aria-label="Eliminar asignación"
                        title="Eliminar asignación"
                      >
                        <DeleteIcon sx={{ mr: 1 }} />
                        <Typography
                          sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "14px",
                            color: "red",
                            fontWeight: 500,
                            textTransform: "none",
                          }}
                        >
                          Eliminar asignación
                        </Typography>
                      </IconButton>
                    </Grid>
                  </Grid>
                ))
              ) : (
                <Typography color="text.secondary">Sin asignaciones</Typography>
              )}
            </Box>
          </Card>
        </Grid2>
      </Grid2>

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
