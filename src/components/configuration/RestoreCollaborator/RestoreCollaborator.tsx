"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import SearchIcon from "@mui/icons-material/Search";
import { Employee } from "@/types/interface";
import ModalComponent from "@/components/message/MessageModal";
import { getSoftDeletedCollaborators, restoreCollaborator } from "@/services/api";
import { useAppTheme } from "@/app/ThemeProviderClient";

const RestoreCollaborator: React.FC = () => {
  const { colors } = useAppTheme();

  const [collaborators, setCollaborators] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [restoringIds, setRestoringIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

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

  const fetchSoftDeletedCollaborators = async (search = "") => {
    const isInitialLoad = !search && collaborators.length === 0;
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setSearchLoading(true);
    }
    
    try {
      const data = await getSoftDeletedCollaborators({
        search,
        limit: 100
      });
      setCollaborators(data || []);
    } catch (error) {
      console.error("Error al cargar colaboradores eliminados:", error);
      showDialog("error", "Error al cargar los colaboradores eliminados");
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchSoftDeletedCollaborators();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSoftDeletedCollaborators(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleRestoreCollaborator = (collaboratorId: string) => {
    const collaborator = collaborators.find(c => {
      const mongoId = (c as Employee & { _id?: string })._id || c.id;
      return String(mongoId) === collaboratorId;
    });
    
    if (!collaborator) {
      showDialog("error", "No se puede restaurar este colaborador: Colaborador no encontrado.");
      return;
    }
    
    const collaboratorName = `${collaborator.first_name} ${collaborator.last_name}`.trim();

    showDialog(
      "warning",
      `¿Estás seguro de que quieres restaurar a ${collaboratorName}? Esta acción lo marcará como activo nuevamente.`,
      async () => {
        const finalId = String((collaborator as Employee & { _id?: string })._id || collaborator.id || collaboratorId);
        setRestoringIds(prev => new Set(prev).add(finalId));
        
        try {
          await restoreCollaborator(finalId);
          
          await fetchSoftDeletedCollaborators(searchTerm);
          
          showDialog("success", "Colaborador restaurado correctamente.");
        } catch (err) {
          console.error("Error al restaurar colaborador:", err);
          const errorMessage = (err as Error)?.message || "Error desconocido al restaurar el colaborador";
          showDialog("error", `Error al restaurar el colaborador: ${errorMessage}`);
        } finally {
          setRestoringIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(finalId);
            return newSet;
          });
        }
      }
    );
  };

  const formatDate = (dateString: string | null | Date) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: "1200px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        border: "1px solid #e0e0e0",
        bgcolor: "#ffffff",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "20px",
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: "#000",
              fontWeight: 500,
              fontFamily: "Poppins, sans-serif",
              fontSize: "24px",
            }}
          >
            Restaurar Colaboradores
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#000",
              fontWeight: 400,
              fontFamily: "Poppins, sans-serif",
              fontSize: "16px",
            }}
          >
            Colaboradores inactivos o eliminados
          </Typography>
        </Box>

        <Chip
          icon={<RestoreIcon />}
          label={`${collaborators.length} colaboradores inactivos`}
          sx={{
            backgroundColor: colors.button || "#23FFDC",
            color: "#002338",
            fontSize: "16px",
            fontWeight: 500,
            fontFamily: "Poppins, sans-serif",
            height: "40px",
          }}
        />
      </Box>

      {/* Campo de búsqueda */}
      <Box sx={{ px: 3, pb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {searchLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <SearchIcon />
                )}
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "#f5f5f5",
              fontFamily: "Poppins, sans-serif",
              fontSize: "16px",
              "& fieldset": {
                borderColor: "#e0e0e0",
              },
              "&:hover fieldset": {
                borderColor: colors.button || "#23FFDC",
              },
              "&.Mui-focused fieldset": {
                borderColor: colors.button || "#23FFDC",
              },
            },
          }}
        />
      </Box>

      {/* Contenido principal */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : collaborators.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <Typography
            sx={{
              color: "#666",
              fontSize: "18px",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            {searchTerm 
              ? `No se encontraron colaboradores eliminados que coincidan con "${searchTerm}"`
              : "No hay colaboradores eliminados para restaurar"
            }
          </Typography>
        </Box>
      ) : (
        <Box>
          <Card
            sx={{
              borderRadius: "20px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              overflow: "hidden",
              backgroundColor: "#f9f9f9",
              marginLeft: "16px",
              marginRight: "16px",
              marginBottom: "16px",
            }}
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ backgroundColor: "transparent" }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#CCCCCC" }}>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        color: "#000",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "16px",
                      }}
                    >
                      Nombre
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        color: "#000",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "16px",
                      }}
                    >
                      Email
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        color: "#000",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "16px",
                      }}
                    >
                      Estado
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        color: "#000",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "16px",
                      }}
                    >
                      Fecha de baja
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        color: "#000",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "16px",
                      }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {collaborators.map((collaborator, index) => {
                    const validId = (collaborator as Employee & { _id?: string })._id || collaborator.id;
                    const hasValidId = !!validId;
                    
                    return (
                    <TableRow
                      key={collaborator.id || `collaborator-${index}`}
                      sx={{ backgroundColor: "#EDEDED" }}
                    >
                      <TableCell
                        sx={{
                          fontFamily: "Roboto, sans-serif",
                          fontSize: "16px",
                          color: "#002338",
                        }}
                      >
                        {`${collaborator.first_name} ${collaborator.last_name}`.trim()}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "Roboto, sans-serif",
                          fontSize: "16px",
                          color: "#002338",
                        }}
                      >
                        {collaborator.email}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={collaborator.estado || "Inactivo"}
                          size="small"
                          sx={{
                            backgroundColor: "#ffebee",
                            color: "#c62828",
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "Roboto, sans-serif",
                          fontSize: "16px",
                          color: "#002338",
                        }}
                      >
                        {formatDate(collaborator.delete_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!hasValidId || restoringIds.has(String(validId || ''))}
                          onClick={() => {
                            const idToUse = String(validId || '');
                            if (idToUse && idToUse !== '') {
                              handleRestoreCollaborator(idToUse);
                            }
                          }}
                          startIcon={
                            restoringIds.has(String(validId || '')) ? (
                              <CircularProgress size={16} />
                            ) : (
                              <RestoreIcon />
                            )
                          }
                          sx={{
                            backgroundColor: "#23FFDC",
                            color: "#002338",
                            fontSize: "12px",
                            fontWeight: 500,
                            textTransform: "none",
                            borderRadius: "12px",
                            minWidth: "120px",
                            height: "32px",
                            fontFamily: "Poppins, sans-serif",
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "#1ee6c9" },
                            "&:disabled": {
                              backgroundColor: "#e0e0e0",
                              color: "#9e9e9e",
                            },
                          }}
                        >
                          {restoringIds.has(String(validId || ''))
                            ? "Restaurando..."
                            : "Restaurar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </Card>
  );
};

export default RestoreCollaborator;