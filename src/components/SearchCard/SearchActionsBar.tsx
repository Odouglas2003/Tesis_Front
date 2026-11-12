"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddProyecto from "../add_cards/Proyecto/ProjectModal";
import AddColaborador from "../add_cards/colaboradores/addCollaboratorsModal";
import AddVacante from "../add_cards/vacante/page";
import Shearch from "../shearch/SearchBar";
import { SearchCardToggleProps } from "@/types/interface";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import { useAuthRole } from "@/app/hooks/useAuthRole";
import { useProjectSuggestion } from "@/context/ProjectSuggestionContext";
import { useAppTheme } from "@/app/ThemeProviderClient";
import { UI } from "@/theme/appPalette";

type Props = SearchCardToggleProps & {
  onAssignmentFilterChange?: (estado: string | null) => void;
};

const SearchCardToggle: React.FC<Props> & { onAddSuccess?: () => void } = ({
  viewMode,
  setViewMode,
  setSearchTerm,
  currentSection,
  onAddSuccess,
  onAssignmentFilterChange: _onAssignmentFilterChange,
}) => {
  const { colors } = useAppTheme();
  const { projectData, reset } = useProjectSuggestion();
  const [openModal, setOpenModal] = useState(false);
  const { isAdmin, isManager } = useAuthRole();



  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    reset();
    setOpenModal(false);
  };
  const handleSuccessAndClose = () => {
    handleCloseModal();
    onAddSuccess?.();
  };

  useEffect(() => {
    if (projectData) setOpenModal(true);
  }, [projectData]);

  const canAddInCurrentSection = () => {
    if (isAdmin) return true;
    if (isManager && currentSection === "vacante") return true;
    return false;
  };

  const renderModalContent = () => {
    switch (currentSection) {
      case "proyecto":
        return (
          <AddProyecto
            onClose={handleCloseModal}
            onSuccess={handleSuccessAndClose}
            projectData={projectData}
          />
        );
      case "colaboradores":
        return (
          <AddColaborador
            onClose={handleCloseModal}
            onSuccess={handleSuccessAndClose}
          />
        );
      case "vacante":
        return (
          <AddVacante
            onClose={handleCloseModal}
            onSuccess={handleSuccessAndClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box sx={{ flex: "1 1 320px", minWidth: 0 }}>
          <Shearch onSearch={setSearchTerm} />
        </Box>

        <Box
          role="group"
          aria-label="Vista"
          sx={{
            display: "flex",
            p: "3px",
            backgroundColor: "#E9EEF3",
            borderRadius: "8px",
          }}
        >
          {([
            { mode: "cards", label: "Tarjetas", icon: <SpaceDashboardIcon sx={{ fontSize: 18 }} /> },
            { mode: "table", label: "Tabla", icon: <ViewCompactIcon sx={{ fontSize: 18 }} /> },
          ] as const).map((option) => {
            const selected = (viewMode === "table") === (option.mode === "table");
            return (
              <Button
                key={option.mode}
                onClick={() => setViewMode(option.mode)}
                aria-pressed={selected}
                startIcon={option.icon}
                sx={{
                  minHeight: 38,
                  px: 1.75,
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textTransform: "none",
                  color: selected ? UI.ink : "#44586B",
                  backgroundColor: selected ? "#FFFFFF" : "transparent",
                  boxShadow: selected ? "0 1px 2px rgba(15,34,51,0.12)" : "none",
                  "&:hover": { backgroundColor: selected ? "#FFFFFF" : "rgba(255,255,255,0.5)" },
                }}
              >
                {option.label}
              </Button>
            );
          })}
        </Box>

        {canAddInCurrentSection() && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{
              minHeight: 44,
              px: 2,
              borderRadius: "8px",
              backgroundColor: colors.button || UI.blue,
              color: colors.text || "#FFFFFF",
              fontSize: "0.875rem",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "none",
              width: { xs: "100%", sm: "auto" },
              "&:hover": { backgroundColor: colors.button || UI.blue, filter: "brightness(0.88)", boxShadow: "none" },
            }}
          >
            Agregar
          </Button>
        )}
      </Box>

      <Modal
        open={openModal}
        onClose={(_event, reason) => {
          // Evita perder lo cargado por un Escape o un clic fuera del formulario.
          if (reason === "escapeKeyDown" || reason === "backdropClick") return;
          handleCloseModal();
        }}
      >
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95vw", md: "1042px" },
            maxHeight: "95vh",
            overflowY: "auto",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8EF",
            boxShadow: "0 24px 64px rgba(15,34,51,0.18)",
            borderRadius: "16px",
            p: { xs: 2, md: 3 },
            textAlign: "center",
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {renderModalContent()}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default SearchCardToggle;
