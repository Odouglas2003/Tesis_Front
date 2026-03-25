"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { registerVacanteService } from "@/services/api";

import {
  fetchProjects,
  fetchManager,
  getJobs,
  fetchTechnologies,
} from "@/services/api";
import { Project, Job, Skill, Manager, Employee } from "@/types/interface";
import ModalComponent from "@/components/message/MessageModal";

interface VacanteProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, bgcolor: '#FFFFFF', color: '#002338' } },
  MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
};

export default function Vacante({ onClose, onSuccess }: VacanteProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [formData, setFormData] = useState<{
    manager_id: string;
    manager_name: string;
    projectId: string;
    vacancieName: string;
    time: number;
    status: string;
    description: string;
    orderDate: string;
    startDate: string;
    seniority: string;
    manager_visible_in_org_chart: boolean;
    skills: { technologyId: string; name: string }[];
  }>({
    manager_id: "",
    manager_name: "",
    projectId: "",
    vacancieName: "",
    time: 0,
    status: "active",
    description: "",
    orderDate: "",
    startDate: "",
    seniority: "",
    manager_visible_in_org_chart: true,
    skills: [],
  });

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
    const fetchData = async () => {
      try {
        const rest = await fetchProjects();
        const resultFilter = rest.filter(
          (item: Project) => item.delete_at === null || !item.delete_at
        );
        setProjects(resultFilter);

        const managersRes = await fetchManager();
        const mappedManagers = (managersRes || []).map((m: Employee) => ({
          ...m,
          manager_id: m.id,
          manager_name: `${m.first_name || ""} ${m.last_name || ""}`.trim(),
        }));
        setManagers(mappedManagers);

        const jobsList = await getJobs();
        setJobs(jobsList);

        const skillsResult = await fetchTechnologies();
        setSkills(skillsResult);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      if (name === "time") {
        if (value === "") {
          return { ...prevData, [name]: 0 };
        }
        const num = Number(value);
        const safe = isNaN(num) || num < 0 ? 0 : num;
        return { ...prevData, [name]: safe };
      }

      // Para el resto de campos, lo guardamos tal cual
      return { ...prevData, [name]: value };
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleProjectChange = (e: SelectChangeEvent) => {
    setFormData((prevData) => ({
      ...prevData,
      projectId: String(e.target.value),
    }));
  };

  const handleManagerChange = (e: SelectChangeEvent) => {
    const selectedManager = managers.find(
      (m) => m.manager_id === e.target.value
    );
    if (selectedManager) {
      setFormData((prevData) => ({
        ...prevData,
        manager_id: selectedManager.manager_id,
        manager_name: selectedManager.manager_name,
      }));
    }
  };

  const handleMultipleChange = (e: SelectChangeEvent<string[]>) => {
    const selectedNames =
      typeof e.target.value === "string"
        ? e.target.value.split(",")
        : e.target.value;

    const selectedSkills = skills
      .filter((skill) => selectedNames.includes(skill.name))
      .map((skill) => ({ technologyId: skill.id, name: skill.name }));

    setFormData((prev) => ({
      ...prev,
      skills: selectedSkills,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.vacancieName ||
      // !formData.projectId ||
      // !formData.manager_id ||
      !formData.orderDate ||
      !formData.startDate ||
      !formData.seniority
    ) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // Solo los campos requeridos
    const dataToSend = {
      manager_id: formData.manager_id || "",
      manager_name: formData.manager_name || "",
      projectId: formData.projectId || "",
      vacancieName: formData.vacancieName,
      time: formData.time || 0,
      status: formData.status,
      description: formData.description,
      orderDate: formData.orderDate,
      startDate: formData.startDate,
      seniority: formData.seniority,
      skills: formData.skills,
    };

    try {
      const response = await registerVacanteService(dataToSend);

      if (response.status == "success") {
        showDialog("success", "Vacante registrada correctamente");
        setFormData({
          manager_id: "",
          manager_name: "",
          projectId: "",
          vacancieName: "",
          time: 0,
          status: "active",
          description: "",
          orderDate: "",
          startDate: "",
          seniority: "",
          manager_visible_in_org_chart: true,
          skills: [],
        });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
      }
    } catch (error) {
      showDialog(
        "error",
        "Error al registrar la vacante. Por favor, inténtalo de nuevo."
      );
    }
  };

  return (
    <Box
      id={"vacante-modal-container"}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Paper
        id="vacante-modal"
        elevation={3}
        sx={{
          width: "100%",
          overflow: "auto",
          padding: 1,
          boxShadow: "none",
          bgcolor: "#fff",
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          align="center"
          sx={{ textAlign: "left", fontWeight: 600, fontFamily: "Poppins", color: "#002338" }}
        >
          Nueva Vacante
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Fila 1: Vacante y Proyecto */}
          <Box sx={{ display: "flex", gap: 2 }}>
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
              <InputLabel>Vacante</InputLabel>
              <Select
                name="vacancieName"
                value={String(formData.vacancieName)}
                onChange={handleSelectChange}
                label="Vacante"
                MenuProps={{
                  PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                  MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                }}
              >
                {jobs.map((job) => (
                  <MenuItem key={job.id} value={job.name} sx={{ color: '#002338' }}>
                    {job.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
              <InputLabel>Proyecto</InputLabel>
              <Select
                label="Proyecto"
                value={String(formData.projectId)}
                onChange={handleProjectChange}
                MenuProps={MenuProps}
              >
                <MenuItem value="">Ninguno</MenuItem>
                {projects
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((proyecto) => (
                    <MenuItem key={proyecto.id} value={proyecto.id} sx={{ color: '#002338' }}>
                      {proyecto.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>

          {/* Fila 2: Tiempo (Horas) y Manager */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Horas Requeridas"
              name="time"
              type="number"
              value={formData.time || ""}
              onChange={handleChange}
              size="small"
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
                  min: 0,
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  pl: "18px",
                  color: "#002338",
                },
              }}
            />
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
              <InputLabel id="manager-label">Project Manager</InputLabel>
              <Select
                label="Project Manager"
                value={formData.manager_id}
                onChange={handleManagerChange}
                MenuProps={MenuProps}
              >
                <MenuItem value="">Ninguno</MenuItem>
                {managers.map((manager) => (
                  <MenuItem key={manager.manager_id} value={manager.manager_id} sx={{ color: '#002338' }}>
                    {manager.manager_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Fila 3: Fechas */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Fecha de Pedido"
              name="orderDate"
              type="date"
              value={formData.orderDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              size="small"
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
            />
            <TextField
              label="Fecha de Inicio"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              size="small"
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
            />
          </Box>

          {/* Fila 4: Seniority */}

          <Box sx={{ display: "flex", gap: 2 }}>
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
              fullWidth
              size="small"
            >
              <InputLabel id="seniority-label">Seniority</InputLabel>
              <Select
                label="Seniority"
                name="seniority"
                value={formData.seniority}
                onChange={handleSelectChange}
                MenuProps={{
                  PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                  MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
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
                label="Tecnologías"
                multiple
                value={formData.skills.map((s) => s.name)}
                onChange={handleMultipleChange}
                renderValue={(selected) => {
                  const visibles = (selected as string[])
                    .slice(0, 2)
                    .join(", ");
                  const resto = (selected as string[]).length - 2;
                  return resto > 0 ? `${visibles} +${resto}` : visibles;
                }}
                MenuProps={MenuProps}
              >
                {skills.map((skill) => (
                  <MenuItem key={skill.id} value={skill.name} sx={{ color: '#002338' }}>
                    <Checkbox
                      checked={formData.skills.some(
                        (s) => s.name === skill.name
                      )}
                    />
                    <ListItemText primary={skill.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Comentarios"
              name="description"
              type="text"
              value={formData.description || ""}
              onChange={handleChange}
              size="small"
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
                  min: 0,
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  pl: "18px",
                  color: "#002338",
                },
              }}
            />
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
              <InputLabel id="estado-label">Estado</InputLabel>
              <Select
                labelId="estado-label"
                id="estado"
                label="Estado"
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                MenuProps={MenuProps}
              >
                <MenuItem value="Abierta" sx={{ color: '#002338' }}>Abierta</MenuItem>
                <MenuItem value="En Proceso" sx={{ color: '#002338' }}>En Proceso</MenuItem>
                <MenuItem value="Finalizada" sx={{ color: '#002338' }}>Finalizada</MenuItem>
              </Select>
            </FormControl>
          </Box>

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
                marginRight: "16px",
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
        </Box>
      </Paper>
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
