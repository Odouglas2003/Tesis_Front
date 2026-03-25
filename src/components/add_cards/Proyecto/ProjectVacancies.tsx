import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  IconButton,
  Tooltip,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Paper,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import React, { useState, useEffect } from "react";
import type { SelectChangeEvent } from "@mui/material/Select";
import { getJobs } from "@/services/api";
import {
  Job,
  RolSeniorityInfo,
  Employee,
  FormDataState,
} from "@/types/interface";

interface Vacancie {
  role: string;
  collaboratorId: string;
  technology: string[];
  time: number;
  requestDate: string;
  startDate: string;
  seniority: string;
}

interface Technology {
  name: string;
}

interface Props {
  formData: FormDataState; // ← Cambiar esto
  setFormData: React.Dispatch<React.SetStateAction<FormDataState>>;
  colaboradores: Employee[];
  tecnologiasDisponibles: Technology[];
  handleVacanteChange: (
    index: number,
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => void;
  addVacante: () => void;
  removeVacante: (index: number) => void;
}

export default function ProjectVacancies({
  formData,
  setFormData,
  colaboradores,
  tecnologiasDisponibles,
  handleVacanteChange,
  addVacante,
  removeVacante,
}: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);

  const getAvailableTechnologies = (
    vacante: Vacancie,
    colaboradores: Employee[],
    tecnologiasDisponibles: Technology[]
  ): Technology[] => {
    if (vacante.collaboratorId === "null" || !vacante.collaboratorId) {
      return tecnologiasDisponibles;
    }

    const selectedCollaborator = colaboradores.find(
      (col) => String(col.id) === vacante.collaboratorId
    );

    if (selectedCollaborator?.tecnologias) {
      return selectedCollaborator.tecnologias
        .map((techName) =>
          tecnologiasDisponibles.find((tech) => tech.name === techName)
        )
        .filter(Boolean) as Technology[];
    }

    return tecnologiasDisponibles;
  };

  const getPreferredSeniority = (
    roleName: string,
    vacante: Vacancie,
    colaboradores: Employee[]
  ): string => {
    if (vacante.collaboratorId === "null" || !vacante.collaboratorId) {
      return "";
    }

    const selectedCollaborator = colaboradores.find(
      (col) => String(col.id) === vacante.collaboratorId
    );

    if (selectedCollaborator?.roles) {
      const selectedRole = selectedCollaborator.roles.find(
        (role) => role.rol === roleName
      );
      return selectedRole?.seniority || "";
    }

    return "";
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsList = await getJobs();
        setJobs(jobsList);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    fetchJobs();
  }, []);

  const getAvailableRoles = (
    vacante: Vacancie,
    colaboradores: Employee[]
  ): RolSeniorityInfo[] => {
    if (vacante.collaboratorId === "null" || !vacante.collaboratorId) {
      return jobs.map((job) => ({
        rol: job.name,
        seniority: "",
      }));
    }

    const selectedCollaborator = colaboradores.find(
      (col) => col.id === vacante.collaboratorId
    );

    if (selectedCollaborator?.roles) {
      return selectedCollaborator.roles;
    }

    return [];
  };

  const handleRoleChange = (
    index: number,
    event: SelectChangeEvent<string>
  ) => {
    const newRole = event.target.value;
    const vacante = formData.vacancies[index];

    const preferredSeniority = getPreferredSeniority(
      newRole,
      vacante,
      colaboradores
    );

    setFormData((prev: FormDataState) => {
      const updated = [...prev.vacancies];
      updated[index].role = newRole;
      if (preferredSeniority) {
        updated[index].seniority = preferredSeniority;
      }
      return { ...prev, vacancies: updated };
    });
  };

  const handleTechnologyChange = (
    index: number,
    event: SelectChangeEvent<string[]>
  ) => {
    const value = event.target.value;
    const technologies = typeof value === "string" ? value.split(",") : value;

    setFormData((prev: FormDataState) => {
      const updated = [...prev.vacancies];
      updated[index].technology = technologies;
      return { ...prev, vacancies: updated };
    });
  };

  return (
    <>
      {formData.vacancies.map((vacante, index) => (
        <Grid
          key={index}
          container
          spacing={1.5}
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Grid item xs={12} sm={2.2}>
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
              <InputLabel>Rol</InputLabel>
              <Select
                name="role"
                value={vacante.role}
                input={<OutlinedInput label="Rol" />}
                onChange={(e) => handleRoleChange(index, e)}
                MenuProps={{
                  PaperProps: { sx: { bgcolor: '#FFFFFF' } },
                  MenuListProps: { sx: { bgcolor: '#FFFFFF', '& .MuiMenuItem-root': { color: '#002338' } } }
                }}
              >
                {getAvailableRoles(vacante, colaboradores).map(
                  (role, roleIndex) => (
                    <MenuItem key={roleIndex} value={role.rol} sx={{ color: '#002338' }}>
                      {role.rol}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2.2}>
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
              <InputLabel>Tecnología</InputLabel>
              <Select
                multiple
                name="technology"
                value={vacante.technology || []}
                input={<OutlinedInput label="Tecnología" />}
                onChange={(e) => handleTechnologyChange(index, e)}
                renderValue={(selected) => selected.join(", ")}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 224,
                      width: 250,
                    },
                    sx: { bgcolor: '#FFFFFF' }
                  },
                  MenuListProps: { sx: { bgcolor: '#FFFFFF', '& .MuiMenuItem-root': { color: '#002338' } } }
                }}
              >
                {getAvailableTechnologies(
                  vacante,
                  colaboradores,
                  tecnologiasDisponibles
                ).map((tech, techIndex) => (
                  <MenuItem key={techIndex} value={tech.name} sx={{ color: '#002338' }}>
                    <Checkbox
                      checked={vacante.technology?.indexOf(tech.name) > -1}
                      sx={{
                        color: "#002338",
                        "&.Mui-checked": {
                          color: "#002338",
                        },
                      }}
                    />
                    <ListItemText primary={tech.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2.2}>
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
                name="seniority"
                value={vacante.seniority}
                onChange={(e) => handleVacanteChange(index, e)}
                input={<OutlinedInput label="Seniority" />}
                disabled={
                  vacante.collaboratorId !== "null" &&
                  vacante.collaboratorId !== ""
                }
                MenuProps={{
                  PaperProps: { sx: { bgcolor: '#FFFFFF' } },
                  MenuListProps: { sx: { bgcolor: '#FFFFFF', '& .MuiMenuItem-root': { color: '#002338' } } }
                }}

              >
                <MenuItem value="Senior" sx={{ color: '#002338' }}>Senior</MenuItem>
                <MenuItem value="Senior Advanced" sx={{ color: '#002338' }}>Senior Advanced</MenuItem>
                <MenuItem value="Semi Senior Advanced" sx={{ color: '#002338' }}>
                  Semi Senior Advanced
                </MenuItem>
                <MenuItem value="Semi Senior" sx={{ color: '#002338' }}>Semi Senior</MenuItem>
                <MenuItem value="Junior Advanced" sx={{ color: '#002338' }}>Junior Advanced</MenuItem>
                <MenuItem value="Junior" sx={{ color: '#002338' }}>Junior</MenuItem>
                <MenuItem value="Trainee" sx={{ color: '#002338' }}>Trainee</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2.2}>
            <TextField
              name="time"
              type="number"
              label="Horas asignadas"
              value={vacante.time}
              onChange={(e) => handleVacanteChange(index, e)}
              fullWidth
              inputProps={{
                min: 0,
              }}
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
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={2.2}>
            <Autocomplete
              disableClearable
              options={[
                { id: "null", first_name: "Ninguno", last_name: "" },
                ...colaboradores,
              ]}
              getOptionLabel={(option) =>
                option.id === "null"
                  ? "Ninguno"
                  : `${option.first_name} ${option.last_name}`
              }
              value={(() => {
                if (
                  !vacante.collaboratorId ||
                  vacante.collaboratorId === "null"
                ) {
                  return { id: "null", first_name: "Ninguno", last_name: "" };
                }
                return (
                  colaboradores.find(
                    (col) => String(col.id) === vacante.collaboratorId
                  ) || {
                    id: "null",
                    first_name: "Ninguno",
                    last_name: "",
                  }
                );
              })()}
              onChange={(_, newValue) => {
                setFormData((prev: FormDataState) => {
                  const updated = [...prev.vacancies];
                  updated[index].collaboratorId = newValue?.id || "null";
                  updated[index].role = "";
                  updated[index].seniority = "";
                  updated[index].technology = [];

                  return { ...prev, vacancies: updated };
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sugerido"
                  size="small"
                  sx={{
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
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon sx={{ color: "#000", mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              // Ensure the popup Paper and list use white background and #002338 text
              PaperComponent={(props) => <Paper {...props} sx={{ bgcolor: '#FFFFFF', color: '#002338' }} />}
              ListboxProps={{ sx: { bgcolor: '#FFFFFF', color: '#002338', '& .MuiAutocomplete-option': { color: '#002338' }, '& li.MuiAutocomplete-option': { color: '#002338' } } }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={1}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Tooltip title="Agregar">
              <IconButton onClick={addVacante} color="primary">
                <AddCircleOutlineIcon />
              </IconButton>
            </Tooltip>
            {formData.vacancies.length > 1 && (
              <Tooltip title="Eliminar">
                <IconButton
                  onClick={() => removeVacante(index)}
                  color="secondary"
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Tooltip>
            )}
          </Grid>

          <Grid item xs={12} sx={{ marginBottom: "15px" }}>
            <Grid container spacing={2} sx={{ mb: 1, marginTop: "2px" }}>
              <Grid item xs={12} sm={3}>
                <TextField
                  name="requestDate"
                  type="date"
                  label="Fecha de Pedido"
                  value={vacante.requestDate || ""}
                  onChange={(e) => handleVacanteChange(index, e)}
                  fullWidth
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
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  name="startDate"
                  type="date"
                  label="Fecha de Inicio"
                  value={vacante.startDate || ""}
                  onChange={(e) => handleVacanteChange(index, e)}
                  fullWidth
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
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      pl: "18px",
                      color: "#002338",
                    },
                  }}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      ))}
    </>
  );
}
