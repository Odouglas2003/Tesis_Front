"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Tooltip,
  Modal,
  Grid,
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
    <Box
      sx={{
        width: "100%",
        p: { xs: 1.25, md: 1.5 },
        borderRadius: "22px",
        backgroundColor: "rgba(252,254,255,0.82)",
        border: "1px solid rgba(18,48,77,0.08)",
        boxShadow: "0 16px 36px rgba(18,48,77,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md>
          <Shearch onSearch={setSearchTerm} />
        </Grid>

        <Grid item xs={6} sm="auto">
          <Tooltip title={viewMode === "table" ? "Ver Cards" : "Ver Tabla"}>
            <Button
              variant="contained"
              onClick={() =>
                setViewMode(viewMode === "table" ? "cards" : "table")
              }
              startIcon={
                viewMode === "table" ? (
                  <ViewCompactIcon sx={{ color: "white" }} />
                ) : (
                  <SpaceDashboardIcon sx={{ color: "white" }} />
                )
              }
              sx={{
                borderRadius: "16px",
                backgroundColor: colors.button || "#123B66",
                color: colors.text || "#7DEBDC",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 600,
                height: "50px",
                px: 3,
                boxShadow: "none",
                width: "100%",
                "&:hover": { backgroundColor: colors.primary || "#12304D", boxShadow: "none" },

              }}
            >
              {viewMode === "table" ? "Ver Cards" : "Ver Tabla"}
            </Button>
          </Tooltip>
        </Grid>



        {canAddInCurrentSection() && (
          <Grid item xs={12} sm="auto">
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: "24px" }} />}
              onClick={handleOpenModal}
              sx={{
                borderRadius: "16px",
                backgroundColor: colors.secondary || "#2A6CA8",
                color: "#F7FBFF",
                fontSize: "16px",
                fontWeight: 600,
                textTransform: "none",
                height: "50px",
                fontFamily: "Poppins, sans-serif",
                px: 3,
                boxShadow: "none",
                width: "100%",
                "&:hover": { backgroundColor: colors.primary || "#12304D", boxShadow: "none" },
              }}
            >
              Agregar
            </Button>
          </Grid>
        )}
      </Grid>

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
            backgroundColor: "#FCFEFF",
            border: "1px solid rgba(18,48,77,0.10)",
            boxShadow: 24,
            borderRadius: "24px",
            p: 2,
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
