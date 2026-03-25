"use client";
import ProjectFormFields from "./ProjectFormFields";
import ProjectVacancies from "./ProjectVacancies";
import ProjectActions from "./ProjectActions";
import { Grid, Box, Paper, Typography } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import ModalComponent from "@/components/message/MessageModal";
import React, { useState, useEffect } from "react";
import {
  fetchCollaborators,
  fetchManager,
  registerVacanteService,
  updateCollaboratorService,
  registerProjectService,
  fetchProjectStates,
  getActiveSkills,
  uploadImage,
  getImageUrl,
  recommendTeam,
  getClient,
} from "@/services/api";
import {
  RegisterProjectBody,
  Employee,
  Manager,
  Tecnologia,
  Client,
  ProjectStatus,
  ProjectVacancy,
  FormDataState,
} from "@/types/interface";
import { useRouter } from "next/navigation";
import { useProjectSuggestion } from "@/context/ProjectSuggestionContext";

interface ProyectoProps {
  onClose: () => void;
  onSuccess: () => void;
  projectData: FormDataState | null;
}

interface DialogState {
  open: boolean;
  variant: "success" | "error" | "warning";
  message?: string;
  onConfirm?: () => void;
  isShowButton?: boolean;
}

export default function Proyecto({
  onClose,
  onSuccess,
  projectData,
}: ProyectoProps) {
  const router = useRouter();
  const { setProjectData, setSuggestionData } = useProjectSuggestion();

  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    variant: "success",
  });

  const [tecnologiasDisponibles, setTecnologiasDisponibles] = useState<
    Tecnologia[]
  >([]);

  const [formData, setFormData] = useState<FormDataState>(
    (projectData as FormDataState) ?? {
      name: "",
      client: "",
      status: "",
      projectType: "Horas",
      startDate: "",
      endDate: "",
      manager_id: "",
      image: "",
      managerName: "",
      description: "",
      category: "",
      budget: "",
      vacancies: [
        {
          role: "",
          collaboratorId: "null",
          technology: [],
          time: 0,
          requestDate: new Date(),
          startDate: new Date(),
          seniority: "",
        },
      ],
    }
  );

  const [estadosProyecto, setEstadosProyecto] = useState<ProjectStatus[]>([]);
  const [colaboradores, setColaboradores] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [tempImageUrl, setTempImageUrl] = useState<string>(
    projectData?.image || ""
  );
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);

  const showDialog = (
    variant: "success" | "error" | "warning",
    message?: string,
    onConfirm?: () => void,
    isShowButton: boolean = true
  ) => setDialog({ open: true, variant, message, onConfirm, isShowButton });
  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

  useEffect(() => {
    Promise.all([
      fetchCollaborators(),
      fetchManager(),
      getActiveSkills(),
      fetchProjectStates(),
      getClient(),
    ])
      .then(([cols, mans, techs, estados, clientResponse]) => {
        setColaboradores(cols ?? []);
        setManagers(
          (mans ?? []).map((m) => ({
            manager_id: m.id,
            manager_name: `${m.first_name} ${m.last_name}`,
            manager_role: "Manager",
          }))
        );
        setTecnologiasDisponibles(techs ?? []);
        setEstadosProyecto(estados ?? []);
        setClients(clientResponse ?? []);
      })
      .catch((err) => console.error("Error al obtener datos:", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      const key = name as keyof FormDataState;
      if (key === "managerName") {
        const selectedManager =
          value === "null"
            ? null
            : managers.find((manager) => manager.manager_name === value);

        return {
          ...prevData,
          managerName: value === "null" ? "" : value,
          manager_id: selectedManager ? selectedManager.manager_id : "",
        };
      }

      return {
        ...prevData,
        [key]: value,
      };
    });
  };

  const handleValidateStaff = () => {
    if (formData.vacancies.length === 0) {
      showDialog(
        "error",
        "Se debe ingresar al menos un colaborador en Staff Requerido",
        void 0,
        true
      );
      return false;
    }
    for (const vacante of formData.vacancies) {
      if (
        !vacante.role ||
        !vacante.seniority ||
        !vacante.time ||
        vacante.time <= 0||
        !vacante.startDate ||
        !vacante.requestDate
      ) {
        showDialog(
          "error",
          "Cada vacante debe tener Rol, Seniority, Horas asignadas mayores a 0, fecha de inicio y fecha de solicitud",
          void 0,
          true
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "name",
      "client",
      "status",
      "managerName",
      "startDate",
      "endDate",
      "category",
    ] as const;
    type FormDataKey = (typeof requiredFields)[number];
    const newErrors: { [key: string]: boolean } = {};
    requiredFields.forEach((field) => {
      if (!formData[field as FormDataKey]) {
        newErrors[field] = true;
      }
    });

    setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const assignedPersons = formData.vacancies
      .filter((v) => v.collaboratorId && v.collaboratorId !== "null")
      .map((vacante) => {
        const colaborador = colaboradores.find(
          (c) => c.id === vacante.collaboratorId
        );
        return {
          id: vacante.collaboratorId,
          name: colaborador
            ? `${colaborador.first_name} ${colaborador.last_name}`
            : "",
          rol: vacante.role,
          horasAsignadas: vacante.time,
          tecnologias: vacante.technology,
          seniority: vacante.seniority,
          orderDate: vacante.requestDate || null,
          startDate: vacante.startDate || null,
        };
      });
    let imageUrl = formData.image || "";
    if (tempImageFile) {
      const imageKey = await uploadImage(tempImageFile);
      imageUrl = await getImageUrl(imageKey);
    }

    try {
      const projectData: RegisterProjectBody = {
        managerId: formData.manager_id || null,
        managerName: formData.managerName || null,
        name: formData.name,
        image: imageUrl || null,
        client: formData.client || null,
        status: formData.status || null,
        projectType: "Horas",
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        description: formData.description || null,
        category: (["Gobierno", "Privado", "Inversion"].includes(
          formData.category
        )
          ? formData.category
          : null) as "Gobierno" | "Privado" | "Inversion",
        budget: formData.budget !== "" ? Number(formData.budget) : null,
        managerVisibleInOrgChart: true,
        assignedPersons,
        ia_generated: false,
      };

      const response = await registerProjectService(projectData);

      if (!response.id) {
        showDialog("error", "El servidor rechazó el registro del proyecto");
      } else {
        const newProjectId = response.id;

        const vacantesPromises = formData.vacancies.map((vacante) => {
          try {
            if (vacante.collaboratorId === "null" || !vacante.collaboratorId) {
              return registrarVacante(vacante, newProjectId);
            } else {
              return actualizarColaborador(
                vacante.collaboratorId,
                newProjectId
              );
            }
          } catch (error) {
            showDialog("error", "Error al registrar vacante");
            return null;
          }
        });

        const resultVacancies = await Promise.all(vacantesPromises);

        showDialog("success", "Proyecto registrado exitosamente");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      const errorMessage =
        (err as Error).message ??
        "Error al registrar el proyecto o actualizar el colaborador";
      showDialog("error", errorMessage);
    }
  };

  const registrarVacante = async (
    vacante: ProjectVacancy,
    newProjectId: string
  ) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const managerId = formData.manager_id;
      const managerName = formData.managerName?.trim() || "";
      const vacancieRole = vacante.role?.trim() || "";
      const seniority = vacante.seniority?.trim() || "";
      const time = Number(vacante.time) || 0;

      if (
        !managerId ||
        !managerName ||
        !vacancieRole ||
        !seniority ||
        time <= 0
      ) {
        showDialog("error", "Faltan datos obligatorios para crear la vacante");
        return;
      }

      const vacancieName =
        vacancieRole +
        (vacante.technology.length > 0
          ? " - " + vacante.technology.filter(Boolean).join(", ")
          : "");

      const skills = vacante.technology.map((techName) => {
        const techObj = tecnologiasDisponibles.find((t) => t.name === techName);
        return {
          technologyId: techObj?.id || "",
          name: techName,
        };
      });

      const payload = {
        manager_id: managerId,
        manager_name: managerName,
        vacancieName: vacancieName.trim(),
        projectId: newProjectId?.trim() || "",
        time: time,
        orderDate: vacante.requestDate || today,
        startDate: vacante.startDate || today,
        seniority: seniority,
        skills,
      };

      const result = await registerVacanteService(payload);
      if (
        !result ||
        (typeof result.status === "number" &&
          (result.status < 200 || result.status >= 300))
      ) {
        showDialog("error", "El servidor rechazó el registro del Vacante");
      }
    } catch (err) {
      console.error("Error completo:", err);
      showDialog("error", "Error al registrar vacante. Inténtalo de nuevo.");
      throw err;
    }
  };

  const actualizarColaborador = async (
    colaboradorId: string,
    projectId: string
  ) => {
    try {
      const colaboradorData = colaboradores.find((c) => c.id === colaboradorId);

      if (!colaboradorData) {
        console.error("No se encontró el colaborador con ID:", colaboradorId);
        showDialog("error", "No se encontró el colaborador");
        return;
      }

      const vacanteAsociada = formData.vacancies.find(
        (v) => String(v.collaboratorId) === String(colaboradorId)
      );

      const proyectosActuales = Array.isArray(colaboradorData.Proyectos)
        ? colaboradorData.Proyectos.map((p) => ({
          rol: p.rol || "",
          projectId: p.projectId?.id || p.projectId || "",
          tecnologias: Array.isArray(p.tecnologias)
            ? p.tecnologias.join(", ")
            : p.tecnologias || "",
          horasAsignadas: Number(p.horasAsignadas) || 0,
          seniority: p.seniority || "",
        }))
        : [];

      const proyectosActualizados = [...proyectosActuales];

      if (vacanteAsociada) {
        const horasNuevas = Number(vacanteAsociada.time) || 0;
        const nombreProyecto = formData.name ?? "";
        const id = projectId;

        if (nombreProyecto) {
          const nuevoProyecto = {
            rol: vacanteAsociada.role || "",
            projectId: id,
            tecnologias: Array.isArray(vacanteAsociada.technology)
              ? vacanteAsociada.technology.join(", ")
              : vacanteAsociada.technology || "",
            horasAsignadas: horasNuevas,
            seniority: vacanteAsociada.seniority || "",
            orderDate: vacanteAsociada.requestDate || "",
            startDate: vacanteAsociada.startDate || "",
          };

          const idx = proyectosActualizados.findIndex(
            (p) => p.projectId === projectId
          );
          if (idx >= 0) {
            proyectosActualizados[idx] = nuevoProyecto;
          } else {
            proyectosActualizados.push(nuevoProyecto);
          }
        }
      }

      const payload = {
        first_name: colaboradorData.first_name,
        last_name: colaboradorData.last_name,
        email: colaboradorData.email,
        Proyectos: proyectosActualizados,
        tecnologias: colaboradorData.tecnologias ?? [],
        rol: Array.isArray(colaboradorData.roles)
          ? colaboradorData.roles.map((r) => r.rol).join(", ")
          : colaboradorData.roles,
        estado: colaboradorData.estado || "activo",
        horasAsignadas: vacanteAsociada
          ? Number(vacanteAsociada.time)
          : Number(colaboradorData.horasAsignadas),
        last_edited_on: new Date().toISOString(),
        delete_at: null,
      };

      const result = await updateCollaboratorService(colaboradorId, payload);

      if (
        !result ||
        (typeof result.status === "number"
          ? result.status < 200 || result.status >= 300
          : result.status !== "success")
      ) {
        showDialog(
          "error",
          "El servidor rechazó el registrar proyecto al colaborador"
        );
        return;
      }

      showDialog("success", "Colaborador actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el colaborador:", error);
      showDialog("error", "¡Uy! Algo falló");
    }
  };

  const handleVacanteChange = (
    index: number,
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string | string[]>
  ) => {
    const { name, value } = event.target;

    setFormData((prevData) => {
      const updatedVacancies = [...prevData.vacancies];
      updatedVacancies[index] = {
        ...updatedVacancies[index],
        [name as keyof ProjectVacancy]: value,
      };

      return {
        ...prevData,
        vacancies: updatedVacancies,
      };
    });
  };

  const addVacante = () => {
    setFormData((prevData) => ({
      ...prevData,
      vacancies: [
        ...prevData.vacancies,
        {
          role: "",
          collaboratorId: "null",
          technology: [],
          time: 0,
          requestDate: "",
          startDate: "",
          seniority: "",
        },
      ],
    }));
  };

  const removeVacante = (index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      vacancies: prevData.vacancies.filter((_, i) => i !== index),
    }));
  };

  const handleCreateAISuggestion = async () => {
    const SENIORITY_MAP: Record<string, "JR" | "SSR" | "SR"> = {
      "jr": "JR",
      "junior": "JR",
      "ssr": "SSR",
      "semi": "SSR",
      "semi-senior": "SSR",
      "semisenior": "SSR",
      "semi senior": "SSR",
      "ssr advanced": "SR",
      "semi senior advanced": "SR",
      "semi-senior advanced": "SR",
      "sr": "SR",
      "senior": "SR",
    };
    const normalizeSeniority = (s: string) =>
      SENIORITY_MAP[s?.toLowerCase().trim()] ?? "JR";

    const min1 = (n: number | string) => {
      const v = Number(n);
      return Number.isFinite(v) && v > 0 ? v : 1;
    };
    const requiredFields = [
      "name",
      "client",
      "status",
      "managerName",
      "startDate",
      "endDate",
      "category",
    ] as const;

    const newErrors: { [key: string]: boolean } = {};
    requiredFields.forEach((field) => {
      if (!formData[field]) newErrors[field] = true;
    });

    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showDialog("error", "Completá los campos obligatorios antes de continuar.");
      return;
    }
    if (!handleValidateStaff()) return;
    const payload = {
      request_details: {
        request_date: formData.startDate, 
        start_date: formData.startDate,   
        budget: min1(formData.budget),    
        objective: `Proyecto ${formData.name} - ${formData.description || ""}`,
      },
      positions_requested: formData.vacancies.map((v, i) => {
        type PositionRequest = {
          position_id: string;
          role: string;
          technologies: string[];
          seniority: "JR" | "SSR" | "SR" | string;
          assigned_hours_needed: number;
          quantity: number;
          suggested_id?: string;
        };

        const base: PositionRequest = {
          position_id: `${v.role}-${i + 1}`,
          role: (v.role || "").trim(),
          technologies: (v.technology || []).filter(Boolean) as string[],
          seniority: normalizeSeniority(v.seniority || "") as
            | "JR"
            | "SSR"
            | "SR"
            | string,
          assigned_hours_needed: min1(v.time || 0),
          quantity: 1,
        };

        if (v.collaboratorId && v.collaboratorId !== "null") {
          base.suggested_id = v.collaboratorId;
        }

        return base;
      }),
    };
    if (!payload.positions_requested.length) {
      showDialog("error", "Agregá al menos una posición en Staff Requerido.");
      return;
    }
    try {
      const iaResult = await recommendTeam(payload);

      setSuggestionData(iaResult.data);
      setProjectData({
        ...formData,
        image: tempImageUrl,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      router.push(`/pages/suggestionIA`);
    } catch (error) {
      console.error("Error al enviar sugerencia:", error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setTempImageFile(file);
    setTempImageUrl(URL.createObjectURL(file));
  };

  return (
    <>
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "none",
            bgcolor: "#fff",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            align="center"
            sx={{
              textAlign: "left",
              fontSize: "20px",
              fontWeight: 500,
              color: "#002338",
            }}
          >
            Nuevo Proyecto
          </Typography>
          <Grid
            container
            spacing={2.5}
            sx={{ mb: 2, paddingLeft: 3, paddingTop: 2 }}
          >
            <ProjectFormFields
              formData={formData}
              fieldErrors={fieldErrors}
              estadosProyecto={estadosProyecto}
              managers={managers}
              clients={clients}
              tempImageUrl={tempImageUrl}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              handleFileUpload={handleFileUpload}
            />
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                borderTop: "1px solid #ccc",
                paddingY: 1,
                textAlign: "left",
              }}
            >
              <Typography
                sx={{ fontSize: "20px", fontWeight: 500, color: "#002338" }}
              >
                Staff Requerido
              </Typography>
            </Box>
          </Grid>
          <ProjectVacancies
            formData={formData}
            setFormData={setFormData}
            colaboradores={colaboradores}
            tecnologiasDisponibles={tecnologiasDisponibles}
            handleVacanteChange={handleVacanteChange}
            addVacante={addVacante}
            removeVacante={removeVacante}
          />
          <ProjectActions
            onClose={onClose}
            handleSubmit={handleSubmit}
            handleCreateAISuggestion={handleCreateAISuggestion}
          />
        </Paper>
      </Box>
      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
        isShowButton={dialog.isShowButton}
      />
    </>
  );
}
