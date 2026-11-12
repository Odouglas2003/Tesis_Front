"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/pages";
import { useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import ProjectHeader from "../../../components/NewProject-Suggestion/ProjectHeader";
import RoleSection from "../../../components/NewProject-Suggestion/RoleSection";
import VacancyList from "../../../components/NewProject-Suggestion/VacancyList";
import { useProjectSuggestion } from "@/context/ProjectSuggestionContext";
import ModalComponent from "@/components/message/MessageModal";
import { registerProjectWithRelationsService } from "@/services/api";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { VacanciePayload, Position, Candidate } from "@/types/interface";
import { UI, cardSx } from "@/theme/appPalette";

export default function SuggestionIaPageClient() {
  const router = useRouter();
  const { suggestionData, projectData } = useProjectSuggestion();

  const [vacancies, setVacancies] = useState<VacanciePayload[]>([]);
  const [positions, setPositions] = useState<Position[]>(
    suggestionData?.positions ?? [] // inicial seguro si aún no hay datos
  );
  const [dialog, setDialog] = useState<{
    open: boolean;
    variant: "success" | "error" | "warning";
    message?: string;
    onConfirm?: () => void;
  }>({ open: false, variant: "success" });

  useEffect(() => {
    if (suggestionData?.positions) {
      setPositions(suggestionData.positions);
    }
  }, [suggestionData]);

  useEffect(() => {
    if (!suggestionData || !projectData) {
      router.push("/pages/projects");
    }
  }, [suggestionData, projectData, router]);

  if (!suggestionData || !projectData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography fontSize={20} color="black">
          Redireccionando...
        </Typography>
      </Box>
    );
  }

  const showDialog = (
    variant: "success" | "error" | "warning",
    message?: string,
    onConfirm?: () => void
  ) => setDialog({ open: true, variant, message, onConfirm });

  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

  const deleteVacancy = (vacancie: VacanciePayload) => {
    setVacancies((prev) =>
      prev.filter((v) => v.vacancieName !== vacancie.vacancieName)
    );
  };

  const createVacancy = (position: Position) => {
    const dataVacancie = {
      manager_id: projectData.manager_id || "",
      manager_name: projectData.manager_name || "",
      vacancieName: position.role_requested,
      time: getPositionTime(position.role_requested) || "0",
      orderDate:
        getPositionRequestDate(position.role_requested) ||
        new Date().toISOString().slice(0, 10),
      startDate:
        getPositionStartDate(position.role_requested) ||
        new Date().toISOString().slice(0, 10),
      seniority: getPositionSeniority(position),
      skills: arrayToObjectArray(position.technologies_requested),
    };
    setVacancies((prev) => [...prev, dataVacancie]);
  };

  const selectCandidate = (position_id: string, candidate: Candidate) => {
    setPositions((prevPositions) =>
      prevPositions.map((position) =>
        position.position_id !== position_id
          ? position
          : {
              ...position,
              candidates: position.candidates.map((c) => ({
                ...c,
                selected: c.id === candidate.id ? !c.selected : false, // toggle
              })),
            }
      )
    );
  };

  const handleCreateProject = async () => {
    const collaborators = positions.flatMap((position) =>
      position.candidates
        .filter((c) => c.selected)
        .map((cand) => ({
          id: cand.id,
          name: cand.name,
          rol: position.role_requested,
          seniority: getPositionSeniority(position),
          projectHours: Number(getPositionTime(position.role_requested)) || 0,
          prevProjectHours: 0,
          assignToProject: true,
        }))
    );

    const vacanciesPayload = vacancies.map((v) => ({
      ...v,
      time: Number(v.time ?? (v as VacanciePayload).hours ?? 0),
    }));

    const cat = (
      ["gobierno", "privado", "inversion"].includes(
        projectData.category?.toLowerCase?.() || ""
      )
        ? projectData.category.toLowerCase() === "gobierno"
          ? "Gobierno"
          : projectData.category.toLowerCase() === "privado"
          ? "Privado"
          : "Inversion"
        : null
    ) as "Gobierno" | "Privado" | "Inversion" | null;

    const payload = {
      project: {
        managerId: projectData.manager_id || null,
        managerName:
          projectData.managerName || projectData.manager_name || null,
        name: projectData.name,
        image: projectData.image || null,
        client: projectData.client || null,
        status: projectData.status || null,
        projectType: "horas",
        startDate: projectData.startDate || null,
        endDate: projectData.endDate || null,
        description: projectData.description || null,
        category: cat || "Sin categoría",
        budget: projectData.budget !== "" ? Number(projectData.budget) : null,
        managerVisibleInOrgChart: true,
        ia_generated: true,
        assignedPersons: collaborators.map((c) => ({
          id: c.id,
          name: c.name,
          rol: c.rol,
          seniority: c.seniority,
          horasAsignadas: String(c.projectHours),
          tecnologias:
            positions.find((p) => p.role_requested === c.rol)
              ?.technologies_requested ?? [],
          orderDate: getPositionRequestDate(c.rol),
          startDate: getPositionStartDate(c.rol),
        })),
      },
      collaborators,
      vacancies: vacanciesPayload,
      ia_generated: true,
    };

    try {
      showDialog("success", "Creando proyecto...");
      const result = await registerProjectWithRelationsService(payload);
      if (typeof result === "object" && result !== null) {
        if (result.status === "error") {
          showDialog("error", result.message || "No se pudo crear el proyecto");
          return;
        }
        showDialog("success", "Proyecto (y relaciones) creados correctamente");
        setTimeout(() => router.push("/pages/projects"), 1800);
      } else {
        showDialog("error", "No se pudo crear el proyecto");
      }
    } catch (e) {
      console.error(e);
      showDialog("error", "No se pudo crear el proyecto");
    }
  };

  // Las fechas del staff pueden llegar como Date (valor inicial del formulario) o como texto.
  function toDateString(value: unknown): string | undefined {
    if (!value) return undefined;
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? undefined : value.toISOString().slice(0, 10);
    }
    const text = String(value);
    return text ? text.slice(0, 10) : undefined;
  }
  function findVacancy(roleRequested: string) {
    return projectData?.vacancies?.find((v) => v.role === roleRequested);
  }
  // El motor IA recibe la seniority abreviada (JR/SSR/SR); para guardar y mostrar usamos la elegida en el formulario.
  function getPositionSeniority(position: Position): string {
    return findVacancy(position.role_requested)?.seniority || position.seniority_requested;
  }
  function getPositionTime(roleRequested: string): string | undefined {
    const vacancy = findVacancy(roleRequested);
    return vacancy?.time ? String(vacancy.time) : undefined;
  }
  function getPositionStartDate(roleRequested: string): string | undefined {
    return toDateString(findVacancy(roleRequested)?.startDate);
  }
  function getPositionRequestDate(roleRequested: string): string | undefined {
    return toDateString(findVacancy(roleRequested)?.requestDate);
  }
  function arrayToObjectArray(arr: string[]): { name: string }[] {
    return arr.map((item) => ({ name: item }));
  }
  const handleBack = () => router.push("/pages/projects");

  const coveredRoles =
    positions.filter((position) => position.candidates.some((c) => c.selected)).length +
    vacancies.length;

  return (
    <Box sx={{ minHeight: "100vh", width: "100%", pb: 6 }}>
      <Navbar />

      <Box
        component="main"
        sx={{
          maxWidth: UI.maxWidth,
          mx: "auto",
          px: { xs: 2, md: 3 },
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <Button
          id="back-button"
          onClick={handleBack}
          startIcon={<KeyboardArrowLeftIcon />}
          sx={{ alignSelf: "flex-start", minHeight: 44, color: UI.blue, fontWeight: 600, textTransform: "none", ml: -1 }}
        >
          Volver
        </Button>

        {/* datos del proyecto */}
        <ProjectHeader project={projectData} />

        {/* roles */}
        {positions.map((position) => (
          <RoleSection
            key={position.position_id}
            position={position}
            onSelect={selectCandidate}
            onCreateVacancy={createVacancy}
            time={getPositionTime(position.role_requested) || "0"}
            seniorityLabel={getPositionSeniority(position)}
          />
        ))}

        {/* vacantes */}
        <VacancyList vacancies={vacancies} onDelete={deleteVacancy} />

        <Box
          sx={{
            ...cardSx,
            px: 3,
            py: 2,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Typography sx={{ fontSize: "0.875rem", color: UI.inkSoft }}>
            <Box component="strong" sx={{ color: UI.ink }}>
              {Math.min(coveredRoles, positions.length)} de {positions.length}
            </Box>{" "}
            roles cubiertos
          </Typography>
          <Button
            variant="contained"
            onClick={handleCreateProject}
            sx={{ minHeight: 44, px: 2.5, borderRadius: "8px", fontWeight: 600, textTransform: "none" }}
          >
            Crear proyecto
          </Button>
        </Box>
      </Box>

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
