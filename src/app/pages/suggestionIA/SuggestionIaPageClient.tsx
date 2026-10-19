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
      seniority: position.seniority_requested,
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
          seniority: position.seniority_requested,
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

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#F8F8F8" }}>
      <Box sx={{ mb: 3 }}>
        <Navbar />
      </Box>

      <Box sx={{ mr: "55px", ml: "55px" }} id="back-button">
        <Box
          onClick={handleBack}
          sx={{
            width: "97px",
            height: "36px ",
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
        </Box>
      </Box>

      <Box
        sx={{
          mr: "55px",
          ml: "55px",
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "20px",
        }}
      >
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
          />
        ))}

        {/* vacantes */}
        <VacancyList vacancies={vacancies} onDelete={deleteVacancy} />

        <Box textAlign="right" mt={4}>
          <Button
            variant="contained"
            size="large"
            onClick={handleCreateProject}
            sx={{
              backgroundColor: "#002338",
              borderRadius: "8px",
              width: "200px",
              height: "50px",
              textTransform: "none",
            }}
          >
            <Typography
              sx={{
                borderRadius: "10px",
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "20px",
                color: "#23FFDC",
              }}
            >
              Crear proyecto
            </Typography>
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
    </div>
  );
}
