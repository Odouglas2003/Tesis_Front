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
  onAssignmentFilterChange,
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
    <Box sx={{ width: "100%" }}>
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
                borderRadius: "20px",
                backgroundColor: colors.button || "#05223c",
                color: "#fff",
                textTransform: "none",
                fontSize: "18px",
                fontWeight: 500,
                height: "50px",
                px: 3,
                boxShadow: "none",
                width: "100%",
                "&:hover": { backgroundColor: "#16324c", boxShadow: "none" },

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
                borderRadius: "20px",
                backgroundColor: "#23FFDC",
                color: "#002338",
                fontSize: "20px",
                fontWeight: 500,
                textTransform: "none",
                height: "50px",
                fontFamily: "Poppins, sans-serif",
                px: 3,
                boxShadow: "none",
                width: "100%",
                "&:hover": { backgroundColor: "#1be0e0", boxShadow: "none" },
              }}
            >
              Agregar
            </Button>
          </Grid>
        )}
      </Grid>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "1042px",
            backgroundColor: "white",
            border: "2px solid #4F82FF",
            boxShadow: 24,
            borderRadius: "12px",
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
