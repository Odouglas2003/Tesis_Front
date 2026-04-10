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
  Collapse,
  Grid2,
  OutlinedInput,
} from "@mui/material";
import { editProject, uploadImage, getImageUrl } from "@/services/api";
import { useRouter } from "next/navigation";
import {
  Project,
  Employee,
  AssignedPersons,
  Client,
  ProjectStatus,
} from "@/types/interface";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddNewPerson from "./AddNewPerson";
import CollaboratorList from "./CollaboratorList";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import ModalComponent from "@/components/message/MessageModal";
import { useAuthRole } from "@/app/hooks/useAuthRole";
import { useAppTheme } from "@/app/ThemeProviderClient";

export default function EditProject({
  project,
  managerProp,
  statesProp,
  clientProp,
}: {
  project: Project;
  managerProp: Employee[];
  statesProp: ProjectStatus[];
  clientProp: Client[];
}) {
  const router = useRouter();
  const [isCollaboratorSectionOpen, setIsCollaboratorSectionOpen] =
    useState(false);
  const [editedProject, setEditedProject] = useState<Project>(project);
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

  useEffect(() => {
    setEditedProject(project);
  }, [project]);

  const [managers, setManagers] = useState<Employee[]>(managerProp);

  useEffect(() => {
    if (managerProp && Array.isArray(managerProp)) {
      setManagers(managerProp);
    }

  }, [managerProp]);

  const [state, setState] = useState<ProjectStatus[]>(statesProp);

  useEffect(() => {
    setState(statesProp);
  }, [statesProp]);
  const { currentUser, isAdmin } = useAuthRole();
  const { colors } = useAppTheme();

  const [client, setClient] = useState<Client[]>(clientProp);

  useEffect(() => {
    setClient(clientProp);
  }, [clientProp]);

  const handleBack = () => {
    router.push("/pages/detail/project_detail/" + editedProject.id);
  };

  const handleSave = async () => {
    try {
      let imageUrl = editedProject.image || "";
      if (tempImageFile) {
        const imageKey = await uploadImage(tempImageFile);
        imageUrl = await getImageUrl(imageKey);
      }
      const updatedProject = {
        ...editedProject,
        image: imageUrl,
        last_edited_by: currentUser || "Desconocido",
        last_edited_on: new Date().toISOString(),
      };

      const result = await editProject(editedProject.id, updatedProject);

      if (result.status === "success") {
        showDialog("success", "Proyecto actualizado correctamente");
        router.push("/pages/detail/project_detail/" + editedProject.id);
      }
    } catch {
      showDialog("error", "Error al actualizar el proyecto");
    }
  };

  function formatDate(dateString?: string | Date | null) {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toISOString().slice(0, 10);
  }

  const handleUpdateHoras = (colabId: string, newHoras: number) => {
    setEditedProject((prev) => ({
      ...prev,
      assignedPersons: prev.assignedPersons.map((person) =>
        person.id === colabId ? { ...person, horasAsignadas: newHoras } : person
      ),
    }));
  };
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };
  const [tempImageUrl, setTempImageUrl] = useState<string>(
    editedProject.image || ""
  );
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTempImageFile(file);
    setTempImageUrl(URL.createObjectURL(file));
  };
  return (
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
              Editar proyecto
            </Typography>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                backgroundColor: colors?.button || "#0087FF",
                borderRadius: "20px",
                padding: "12px 41px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                fontSize: "20px",
                height: "50px",
                color: colors?.background || "#FFFFFF",
                boxShadow: "none",
                textTransform: "none",
                transition: 'background-color .25s ease, opacity .25s ease',
                '&:hover': {
                  backgroundColor: colors?.button || '#0087FF',
                  opacity: 0.85,
                  boxShadow: 'none'
                },
                '&:active': {
                  backgroundColor: colors?.button || '#0087FF',
                  opacity: 0.75,
                  boxShadow: 'none'
                }
              }}
            >
              Guardar
            </Button>
          </Box>

          <Grid2 container spacing={4}>
            <Grid2 size={12}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
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
                      width: { xs: 100, md: 120 },
                      height: { xs: 100, md: 120 },
                      bgcolor: "#fff",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #e0e4e7",
                      mb: 1,
                    }}
                  >
                    <img
                      src={tempImageUrl ? tempImageUrl : "/image-login.png"}
                      alt="Logo"
                      style={{
                        maxWidth: "80%",
                        maxHeight: "80%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                  <IconButton
                    onClick={handleCameraClick}
                    sx={{
                      bgcolor: "#f8f9fa",
                      border: "1px solid #e0e4e7",
                      mt: -1,
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
                        label="Nombre"
                        fullWidth
                        size="small"
                        value={editedProject.name || ""}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        sx={{
                          height: "40px",
                          color: "#002338",

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
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            pl: "18px",
                            color: "#002338",

                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl
                        sx={{
                          height: "40px",
                          color: "#002338",
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
                        <InputLabel>Cliente</InputLabel>
                        <Select
                          value={editedProject.client || ""}
                          label="Cliente"
                          onChange={(e) =>
                            setEditedProject((prev) => ({
                              ...prev,
                              client: e.target.value,
                            }))
                          }
                          input={<OutlinedInput label="Cliente" />}
                          MenuProps={{
                            PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                            MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                          }}
                        >
                          {client.map((clients) => (
                            <MenuItem key={clients.id} value={clients.name} sx={{ color: '#002338' }}>
                              {clients.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl
                        sx={{
                          height: "40px",
                          color: "#002338",
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
                        <InputLabel>Estado</InputLabel>
                        <Select
                          value={editedProject.status || ""}
                          label="Estado"
                          onChange={(e) =>
                            setEditedProject((prev) => ({
                              ...prev,
                              status: e.target.value,
                            }))
                          }
                          input={<OutlinedInput label="Estado" />}
                          MenuProps={{
                            PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                            MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                          }}
                        >
                          {state
                            .filter((states, index, self) =>
                              index === self.findIndex(s => s.id === states.id)
                            )
                            .map((states) => (
                              <MenuItem key={states.id} value={states.status} sx={{ color: '#002338' }}>
                                {states.status}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl
                        sx={{
                          height: "40px",
                          color: "#002338",
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
                        <InputLabel>Project Manager</InputLabel>
                        <Select
                          // El value debe ser el managerId (id) para que coincida con los MenuItem.value
                          value={editedProject.managerId || ""}
                          label="Project Manager"
                          onChange={(e) => {
                            const selectedId = e.target.value as string;
                            const selectedManager = managers.find((m) => m.id === selectedId);
                            const managerFullName = selectedManager
                              ? `${selectedManager.first_name || ""} ${selectedManager.last_name || ""}`.trim()
                              : "";
                            setEditedProject((prev) => ({
                              ...prev,
                              // guardamos tanto el id como el nombre para consistencia
                              managerId: selectedManager?.id || selectedId || "",
                              managerName: managerFullName || prev.managerName,
                            }));
                          }}
                          input={<OutlinedInput label="Project Manager" />}
                          MenuProps={{
                            PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                            MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                          }}
                        >
                          {managers.map((manager, index) => (
                            <MenuItem
                              key={`${manager.id || 'manager'}-${index}`}
                              value={manager.id} sx={{ color: '#002338' }}
                            >
                              {`${manager.first_name || ""} ${manager.last_name || ""}`.trim() || manager.email || "Manager sin nombre"}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Fecha de inicio"
                        type="date"
                        fullWidth
                        size="small"
                        value={formatDate(editedProject.startDate)}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            startDate: e.target.value
                              ? new Date(e.target.value)
                              : null,
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          height: "40px",
                          color: "#002338",

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
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            pl: "18px",
                            color: "#002338",

                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Fecha de finalización"
                        type="date"
                        fullWidth
                        size="small"
                        value={formatDate(editedProject.endDate)}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            endDate: e.target.value
                              ? new Date(e.target.value)
                              : null,
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          height: "40px",
                          color: "#002338",
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
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            pl: "18px",
                            color: "#002338",

                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl
                        sx={{
                          height: "40px",
                          color: "#002338",
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
                        <InputLabel>Categoria</InputLabel>
                        <Select
                          value={editedProject.category || ""}
                          label="Categoria"
                          onChange={(e) =>
                            setEditedProject((prev) => ({
                              ...prev,
                              category: e.target.value as
                                | "Gobierno"
                                | "Privado"
                                | "Inversion",
                            }))
                          }
                          MenuProps={{
                            PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                            MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                          }}
                        >
                          <MenuItem value="Gobierno" sx={{ color: '#002338' }}>Gobierno</MenuItem>
                          <MenuItem value="Privado" sx={{ color: '#002338' }}>Privado</MenuItem>
                          <MenuItem value="Inversion" sx={{ color: '#002338' }}>Inversion</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Presupuesto"
                        type="number"
                        fullWidth
                        size="small"
                        value={editedProject.budget || ""}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            budget: e.target.value
                              ? Number(e.target.value)
                              : null,
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          height: "40px",
                          color: "#002338",

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
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            pl: "18px",
                            color: "#002338",

                          },
                        }}
                        disabled={!isAdmin}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Descripción */}
              <TextField
                label="Descripción"
                multiline
                rows={3}
                fullWidth
                value={editedProject.description || ""}
                onChange={(e) =>
                  setEditedProject((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                InputProps={{
                  sx: {
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    pl: "18px",
                    color: "#002338",
                  },
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "14px",
                    height: "auto",
                    minHeight: "80px",
                    borderRadius: "20px",
                    padding: "12px 30px",
                    alignItems: "center",
                    "& fieldset": {
                      borderColor: "#002338",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                }}
              />
            </Grid2>

            <Grid2 size={12}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 20, md: "24px" },
                    fontFamily: "Poppins",
                    fontWeight: 600,
                    color: "#002338",
                    mb: 2,
                  }}
                >
                  Colaboradores asignados
                </Typography>
                <CollaboratorList
                  collaborator={editedProject.assignedPersons || []}
                  onDelete={(id: string) => {
                    setEditedProject((prev: Project) => ({
                      ...prev,
                      assignedPersons:
                        prev.assignedPersons?.filter(
                          (person: AssignedPersons) => person.id !== id
                        ) || [],
                    }));
                  }}
                  projectId={editedProject.id}
                  onUpdateTime={handleUpdateHoras}
                />
              </Box>
            </Grid2>

            <Grid2 size={12}>
              <Box
                sx={{
                  border: "1px solid #e8eaed",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                <Box
                  onClick={() =>
                    setIsCollaboratorSectionOpen(!isCollaboratorSectionOpen)
                  }
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 3,
                    bgcolor: "#f8f9fa",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "#f1f3f4",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                      fontSize: { xs: 18, md: "20px" },
                      color: "#002338",
                    }}
                  >
                    Agregar colaborador
                  </Typography>
                  <IconButton size="small">
                    {isCollaboratorSectionOpen ? (
                      <ExpandLessIcon sx={{ color: "#002338" }} />
                    ) : (
                      <ExpandMoreIcon sx={{ color: "#002338" }} />
                    )}
                  </IconButton>
                </Box>

                <Collapse in={isCollaboratorSectionOpen}>
                  <Box sx={{ p: 3, bgcolor: "#EDEDED" }}>
                    <AddNewPerson
                      projectId={editedProject.id}
                      projectName={editedProject.name || ""}
                      onAddColaborador={(newPerson: AssignedPersons) => {
                        setEditedProject((prev: Project) => ({
                          ...prev,
                          assignedPersons: [
                            ...(prev.assignedPersons || []),
                            newPerson,
                          ],
                        }));
                      }}
                    />
                  </Box>
                </Collapse>
              </Box>
            </Grid2>
          </Grid2>
        </Card>
      </Grid2>
      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </Grid2>
  );
}
