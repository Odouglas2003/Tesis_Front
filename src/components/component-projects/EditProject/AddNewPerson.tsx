"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Autocomplete,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { SelectChangeEvent } from "@mui/material";
import { useAppTheme } from "@/app/ThemeProviderClient";
import ModalComponent from "@/components/message/MessageModal";
import { useAuthRole } from "@/app/hooks/useAuthRole";

import { AssignedPersons, Employee } from "@/types/interface";
import {
  fetchCollaborators,
  addAssignedPersonToProject,
  recordDailyHistory,
  getHistoryBlocks, // 👈 necesario para baseline
} from "@/services/api";

interface AddNewPersonProps {
  onAddColaborador: (colaborador: AssignedPersons) => void;
  projectId: string;
  projectName: string;
}

export default function AddNewPerson({
  onAddColaborador,
  projectId,
  projectName,
}: AddNewPersonProps) {
  const { colors } = useAppTheme();
  const { currentUserId } = useAuthRole();
console.log(projectName);
  const [colaborador, setColaborador] = useState<AssignedPersons>({
    name: "",
    id: "",
    rol: "",
    horasAsignadas: 0,
    tecnologias: [],
    seniority: "",
  });
  const [loadingColab, setLoadingColab] = useState(false);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [allCollaborators, setAllCollaborators] = useState<AssignedPersons[]>([]);
  const [availableRoles, setAvailableRoles] = useState<
    { rol: string; seniority: string }[]
  >([]);
  const [errors, setErrors] = useState<{ rol?: string; seniority?: string }>({});
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
    fetchCollaborators().then((res) => {
      setAllEmployees(res ?? []);
      setAllCollaborators(
        (res ?? []).map((emp: Employee) => ({
          name: `${emp.first_name} ${emp.last_name}`,
          id: emp.id,
          rol: emp.roles && emp.roles.length === 1 ? emp.roles[0].rol : "",
          seniority:
            emp.roles && emp.roles.length === 1 ? emp.roles[0].seniority : "",
          horasAsignadas: 0,
          tecnologias: emp.tecnologias || [],
        }))
      );
    });
  }, []);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(
    undefined
  );

  const handleSelectColaborador = (_: unknown, value: Employee | null) => {
    setSelectedEmployee(value || undefined);
    if (value) {
      const roles = value.roles ?? [];
      setAvailableRoles(roles);
      setErrors({});

      let rol = "";
      let seniority = "";
      if (roles.length === 1) {
        rol = roles[0].rol;
        seniority = roles[0].seniority;
      }

      setColaborador({
        name: `${value.first_name} ${value.last_name}`,
        id: value.id,
        rol,
        seniority,
        horasAsignadas: 0,
        tecnologias: value.tecnologias || [],
      });
    } else {
      setAvailableRoles([]);
      setColaborador({
        name: "",
        id: "",
        rol: "",
        horasAsignadas: 0,
        tecnologias: [],
        seniority: "",
      });
      setErrors({});
    }
  };

  const handleRolChange = (e: SelectChangeEvent<string>) => {
    const selectedRol = e.target.value as string;
    const selected = availableRoles.find((r) => r.rol === selectedRol);
    setColaborador((prev) => ({
      ...prev,
      rol: selectedRol,
      seniority: selected?.seniority || "",
    }));
    setErrors((prev) => ({ ...prev, rol: undefined, seniority: undefined }));
  };

  // ===== Helpers para historial =====
  const makeDateKey = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Updated `toSnap` to use a typed parameter and return type.
  const toSnap = (p: {
    projectId: string;
    projectName?: string;
    role?: string | null;
    hoursAssigned?: number | null;
  }) => ({
    projectId: p.projectId,
    projectName: p.projectName ?? "",
    role: p.role ?? null,
    hoursAssigned: typeof p.hoursAssigned === "number" ? p.hoursAssigned : null,
  });

  // Updated `readBaselineSnaps` to use a typed `HistoryBlock` interface.
  interface HistoryBlock {
    dateKey: string;
    next: Array<{
      projectId: string;
      projectName?: string;
      role?: string | null;
      hoursAssigned?: number | null;
    }>;
  }

  // Lee el baseline (preferimos el bloque de HOY; si no hay, el último existente)
  const readBaselineSnaps = async (collabId: string): Promise<Snap[]> => {
    try {
      const hist = await getHistoryBlocks(collabId);
      const history = Array.isArray(hist?.history) ? hist.history : [];
      if (!history.length) return [];

      const todayKey = makeDateKey();
      const byDateDesc = ([...history].reverse() as HistoryBlock[]);

      const todayBlock = byDateDesc.find((b) => b.dateKey === todayKey);
      const base = (todayBlock ?? byDateDesc[0])?.next ?? [];

      return base.map((s: { projectId?: unknown; projectName?: unknown; role?: string | null; hoursAssigned?: number | null }) => ({
        projectId: String(s.projectId ?? ""),
        projectName: String(s.projectName ?? ""),
        role: s.role ?? null,
        hoursAssigned: typeof s.hoursAssigned === "number" ? s.hoursAssigned : null,
      }));
    } catch {
      return [];
    }
  };

  // Updated `upsertSnap` to use a typed `Snap` interface.
  interface Snap {
    projectId: string;
  }

  // merge por projectId
  const upsertSnap = (list: Snap[], item: Snap): Snap[] => {
    const idx = list.findIndex((x) => String(x.projectId) === String(item.projectId));
    const next = [...list];
    if (idx >= 0) next[idx] = { ...next[idx], ...item };
    else next.push(item);
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingColab(true);

    // ✅ Validaciones mínimas
    const nextErrors: { rol?: string; seniority?: string } = {};
    if (!colaborador.rol || String(colaborador.rol).trim() === "") {
      nextErrors.rol = "El rol es obligatorio";
    }
    if (!colaborador.seniority || String(colaborador.seniority).trim() === "") {
      nextErrors.seniority = "Seniority obligatorio";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setLoadingColab(false);
      return;
    }

    try {
      // 1) Baseline ANTES de tocar el backend
      const previousSnapsRaw = await readBaselineSnaps(colaborador.id);
      const previousSnaps = previousSnapsRaw.map(toSnap);

      // 2) Snap del proyecto nuevo
      const newSnap = toSnap({
        projectId,
        projectName, // 👈 guardamos nombre
        role: colaborador.rol,
        hoursAssigned: Number(colaborador.horasAsignadas) || 0,
      });

      // 3) next = previous + upsert del nuevo
      const nextSnaps = upsertSnap(previousSnaps, newSnap).map(toSnap);

      // 4) Alta real
      const response = await addAssignedPersonToProject(projectId, {
        name: colaborador.name,
        id: colaborador.id,
        rol: colaborador.rol,
        horasAsignadas: Number(colaborador.horasAsignadas) || 0,
        tecnologias: colaborador.tecnologias,
        seniority: colaborador.seniority,
      });

      if (!response || response.status !== "success") {
        showDialog(
          "error",
          response?.message || "No se pudo agregar al colaborador. Intenta nuevamente."
        );
        setLoadingColab(false);
        return;
      }

      // 5) Historial del día (upsert por dateKey en backend)
      try {
        await recordDailyHistory(colaborador.id, {
          userId: currentUserId || localStorage.getItem("userId") || undefined,
          dateKey: makeDateKey(),
          previous: previousSnaps,
          next: nextSnaps,
        });
        console.log("✅ Historial diario registrado (alta).");
      } catch (err) {
        console.warn("⚠️ No se pudo registrar historial diario:", err);
      }

      // 6) Notificar y limpiar
      onAddColaborador(colaborador);
      resetForm();
      showDialog("success", `Colaborador "${colaborador.name}" agregado correctamente.`);
    } catch (error) {
      console.error(error);
      showDialog("error", "No se pudo agregar al colaborador. Intenta nuevamente.");
    } finally {
      setLoadingColab(false);
    }
  };

  const fieldStyles = {
    height: "40px",
    width: "382px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "20px",
      "& fieldset": { borderColor: "#002338" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "black" },
  };

  const resetForm = () => {
    setColaborador({
      name: "",
      id: "",
      rol: "",
      horasAsignadas: 0,
      tecnologias: [],
      seniority: "",
    });
    setAvailableRoles([]);
    setSelectedEmployee(undefined);
    setErrors({});
  };

  return (
    <Box sx={{ p: 2, bgcolor: "#EDEDED" }}>
      <form onSubmit={handleSubmit}>
        <Grid container alignItems="flex-start" sx={{ gap: "20px" }}>
          {/* Colaborador */}
          <Grid item>
            <Autocomplete
              key={selectedEmployee?.id || "empty"}
              options={allEmployees}
              value={selectedEmployee}
              getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
              onChange={handleSelectColaborador}
              popupIcon={null}
              disableClearable
              ListboxProps={{
                sx: {
                  bgcolor: "#FFFFFF",
                  color: "#002338",
                  "& li": { color: "#002338" },
                },
              }}
              renderOption={(props, option) => {
                const { key, style, ...liProps } =
                  (props as React.HTMLAttributes<HTMLLIElement> & { key?: React.Key });
                return (
                  <li
                    key={key}
                    {...liProps}
                    style={{
                      ...(style as React.CSSProperties),
                      color: "#002338",
                      background: "#FFFFFF",
                    }}
                  >
                    {`${option.first_name} ${option.last_name}`}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="name"
                  label="Colaborador"
                  placeholder="Buscar colaborador"
                  size="small"
                  required
                  sx={{
                    height: "40px",
                    width: "382px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "20px",
                      "& fieldset": { borderColor: "#002338" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                    "& .MuiOutlinedInput-input": { color: "#002338" },
                  }}
                  InputProps={{
                    sx: { color: "#002338" },
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon sx={{ color: "#002338", mr: 2 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Rol */}
          <Grid item>
            {availableRoles.length > 1 ? (
              <FormControl
                error={!!errors.rol}
                sx={{
                  height: "40px",
                  width: "382px",
                  "& .MuiSelect-select": { color: "#002338", fontSize: "16px" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    "& fieldset": { borderColor: "#002338" },
                  },
                  "& .MuiInputLabel-root": { color: "#002338" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                  "& .MuiOutlinedInput-input": {
                    fontSize: "16px",
                    padding: "10.5px 14px",
                  },
                }}
                size="small"
                fullWidth
              >
                <InputLabel>Rol</InputLabel>
                <Select
                  name="rol"
                  value={colaborador.rol}
                  onChange={handleRolChange}
                  required
                  fullWidth
                  input={<OutlinedInput label="Rol *" />}
                  sx={{ "& .MuiSelect-select": { color: "#002338", fontSize: "16px" } }}
                  MenuProps={{
                    PaperProps: { sx: { bgcolor: "#FFFFFF", color: "#002338" } },
                    MenuListProps: { sx: { bgcolor: "#FFFFFF" } },
                  }}
                >
                  {availableRoles.map((r) => (
                    <MenuItem key={r.rol} value={r.rol} sx={{ color: "#002338" }}>
                      {r.rol}
                    </MenuItem>
                  ))}
                </Select>
                {errors.rol && (
                  <Box
                    component="div"
                    sx={{ color: "error.main", mt: 0.5, fontSize: "0.75rem" }}
                  >
                    {errors.rol}
                  </Box>
                )}
              </FormControl>
            ) : (
              <TextField
                label="Rol"
                name="rol"
                value={colaborador.rol}
                size="small"
                required
                InputProps={{ readOnly: true }}
                error={!!errors.rol}
                helperText={errors.rol}
                sx={{
                  height: "40px",
                  width: "382px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    "& fieldset": { borderColor: "#002338" },
                  },
                  "& .MuiInputLabel-root": { color: "#002338", fontSize: "14px" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#002338" },
                  "& .MuiOutlinedInput-input": {
                    color: "#002338",
                    fontSize: "16px",
                    padding: "10.5px 14px",
                  },
                }}
              />
            )}
          </Grid>

          {/* Seniority */}
          <Grid item>
            <TextField
              label="Seniority"
              name="seniority"
              value={colaborador.seniority}
              size="small"
              required
              InputProps={{ readOnly: true }}
              error={!!errors.seniority}
              helperText={errors.seniority}
              sx={{
                height: "40px",
                width: "382px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  "& fieldset": { borderColor: "#002338" },
                },
                "& .MuiInputLabel-root": { color: "#002338" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#002338" },
                "& .MuiOutlinedInput-input": { color: "#002338" },
              }}
            />
          </Grid>

          {/* Tecnologías */}
          <Grid item>
            <FormControl
              sx={{
                height: "40px",
                width: "382px",
                "& .MuiSelect-select": { color: "#002338" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  "& fieldset": { borderColor: "#002338" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "black" },
              }}
              size="small"
              fullWidth
            >
              <InputLabel>Tecnologías</InputLabel>
              <Select
                name="tecnologias"
                multiple
                value={colaborador.tecnologias}
                onChange={(e) =>
                  setColaborador((prev) => ({
                    ...prev,
                    tecnologias:
                      typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : e.target.value,
                  }))
                }
                input={<OutlinedInput label="Tecnologías" />}
                displayEmpty
                required
                disabled={
                  !colaborador.id ||
                  !allCollaborators.find((c) => c.id === colaborador.id)?.tecnologias?.length
                }
                MenuProps={{
                  PaperProps: { sx: { bgcolor: "#FFFFFF", color: "#002338" } },
                  MenuListProps: { sx: { bgcolor: "#FFFFFF" } },
                }}
                renderValue={(selected) =>
                  Array.isArray(selected) ? selected.join(", ") : ""
                }
              >
                {(allCollaborators.find((c) => c.id === colaborador.id)?.tecnologias || []).map(
                  (tech) => (
                    <MenuItem key={tech} value={tech} sx={{ color: "#002338" }}>
                      {tech}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Horas */}
          <Grid item>
            <TextField
              label="Horas Asignadas"
              name="horasAsignadas"
              placeholder="Horas asignadas"
              value={colaborador.horasAsignadas}
              onChange={(e) =>
                setColaborador((prev) => ({
                  ...prev,
                  horasAsignadas: Number(e.target.value) || 0,
                }))
              }
              size="small"
              required
              type="number"
              sx={fieldStyles}
              InputProps={{ sx: { color: "#002338" } }}
            />
          </Grid>
        </Grid>

        <Grid
          item
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            disabled={loadingColab}
            sx={{
              width: "200px",
              backgroundColor: colors?.button || "#002851",
              color: colors?.background || "#23FFDC",
              borderRadius: "20px",
              height: "50px",
              textTransform: "none",
              padding: "13px 41px",
              fontWeight: "500",
              fontSize: "20px",
              fontFamily: "Poppins, sans-serif",
              boxShadow: "none",
              transition: "background-color .25s ease, opacity .25s ease",
              "&:hover": {
                backgroundColor: colors?.button || "#002851",
                opacity: 0.85,
                boxShadow: "none",
              },
              "&:active": {
                backgroundColor: colors?.button || "#002851",
                opacity: 0.75,
                boxShadow: "none",
              },
              "&.Mui-disabled": {
                backgroundColor: "#bdbdbd",
                color: "#f5f5f5",
              },
            }}
          >
            {loadingColab ? "..." : "Guardar"}
          </Button>
        </Grid>
      </form>

      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </Box>
  );
}
