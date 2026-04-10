import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Box,
  Tooltip,

} from "@mui/material";
import { formatDateUTC } from "@/utils/utils";
import { Edit, Delete, Info } from "@mui/icons-material";
import { useAuthRole } from "@/app/hooks/useAuthRole";
import { useColumns } from "@/app/hooks/useColumns";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { Project, User, Employee } from "@/types/interface";
import {
  fetchDeleteProjectById,
  updateCollaboratorAfterProjectDeletion,
} from "@/services/api";
import { useRouter } from "next/navigation";
import ModalComponent from "@/components/message/MessageModal";
import { useAppTheme } from "@/app/ThemeProviderClient";

export function ProjectTable({
  searchTerm,
  projectsProp,
  usersProps,
  collaboratorProp,
}: {
  searchTerm: string;
  projectsProp: Project[];
  usersProps: User[];
  collaboratorProp: Employee[];
}) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(0);
  const {
    columns,
    loading: loadingColumns,
    error: errorColumns,
  } = useColumns("proyecto");
  const [, setManagers] = useState<{ name: string }[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const { isAdmin, currentUser } = useAuthRole();
  const [dialog, setDialog] = useState<{
    open: boolean;
    variant: "success" | "error" | "warning";
    message?: string;
    onConfirm?: () => void;
  }>({ open: false, variant: "success" });
  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

  useEffect(() => {
    if (!projectsProp) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredProjects = projectsProp
      .filter((item) => {
        const name = item.name || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .map((item) => {
        // startDate como Date | null
        let start: Date | null = null;
        if (item.startDate) {
          const d = new Date(item.startDate as unknown as string);
          if (!isNaN(d.getTime())) start = d;
        }

        // endDate como Date | null
        let end: Date | null = null;
        if (item.endDate) {
          const d = new Date(item.endDate as unknown as string);
          if (!isNaN(d.getTime())) end = d;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let alertLevel: "warning" | "expired" | null = null;
        let contractMessage: string | null = null;
        let daysRemaining: number | null = null;

        if (end) {
          const endAtMidnight = new Date(end);
          endAtMidnight.setHours(0, 0, 0, 0);
          const diffTime = endAtMidnight.getTime() - today.getTime();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (daysRemaining <= 30) {
            alertLevel = daysRemaining <= 0 ? "expired" : "warning";
            contractMessage =
              daysRemaining <= 0 ? "Proyecto vencido" : `Vence en ${daysRemaining} días`;
          }
        }

        return {
          ...item,
          name: item.name || "",
          client: item.client || "",
          managerName: item.managerName || "",
          status: item.status ? item.status.trim() : "Ejecución",
          phase: item.phase || "",
          projectType: item.projectType || "",
          startDate: start,
          endDate: end,
          alertLevel,
          daysRemaining,
          contractMessage,
          budget: item.budget ?? null,
        };
      });

    setProjects(filteredProjects);
  }, [projectsProp, searchTerm]);

  useEffect(() => {
    const filteredManagers = usersProps
      .filter((user) => user.rol === "manager")
      .map((user) => ({
        name: user.name,
      }));

    setManagers(filteredManagers);
  }, [usersProps]);

  const handleDelete = async (projectId: string) => {
    const proyectoSeleccionado = projects.find((p) => p.id === projectId);

    if (!proyectoSeleccionado) {
      alert("No se encontró el proyecto.");
      return;
    }

    const nombreProyecto = proyectoSeleccionado.name;
    const colaboradoresDelProyecto: Employee[] = collaboratorProp.filter(
      (colab: Employee) =>
        colab.Proyectos?.filter(
          (p) =>
            p.projectId?.toString().toLowerCase() ===
            nombreProyecto.toLowerCase()
        ).length > 0
    );

    try {
      const result = await fetchDeleteProjectById(projectId);
      if (result.status === "success") {
        setDialog({
          open: true,
          variant: "success",
          message: "El proyecto se eliminó correctamente",
        });

        setProjects((prev) => prev.filter((p) => p.id !== projectId));

        for (const colab of colaboradoresDelProyecto) {
          const proyectosRestantes = colab.Proyectos.filter(
            (p) =>
              p.projectId?.toString().toLowerCase() !==
              nombreProyecto.toLowerCase()
          );

          const proyectoEliminado = colab.Proyectos.find(
            (p) =>
              p.projectId?.toString().toLowerCase() ===
              nombreProyecto.toLowerCase()
          );
          const horasARestar = proyectoEliminado?.horasAsignadas || 0;

          const nuevasHoras = Math.max(
            (colab.horasAsignadas || 0) - horasARestar,
            0
          );

          await updateCollaboratorAfterProjectDeletion(colab.id, {
            Proyectos: proyectosRestantes,
            setHorasAsignadas: nuevasHoras,
            last_edited_by: currentUser,
          });
        }
      } else {
        setDialog({
          open: true,
          variant: "error",
          message: "Error al eliminar el proyecto en el backend.",
        });
      }
    } catch (err) {
      console.error("Error de red al eliminar el proyecto:", err);
    }
  };


  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <>
      <Paper
        sx={{
          overflow: "hidden",
          borderRadius: "24px",
          backgroundColor: colors.card,
          border: "1px solid rgba(18,48,77,0.08)",
          boxShadow: "0 18px 45px rgba(18,48,77,0.08)",
        }}
      >
        <TableContainer sx={{ maxHeight: 700, borderRadius: "24px", backgroundColor: colors.card }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {loadingColumns ? (
                  <TableCell colSpan={9} align="center">
                    Cargando configuración...
                  </TableCell>
                ) : errorColumns ? (
                  <TableCell
                    colSpan={9}
                    align="center"
                    style={{ color: "red" }}
                  >
                    {errorColumns}
                  </TableCell>
                ) : columns.length === 0 ? (
                  <TableCell colSpan={9} align="center">
                    No se encontraron columnas configuradas
                  </TableCell>
                ) : (
                  <>
                    {columns.map((column) => (
                      <TableCell
                        key={column.field}
                        align="center"
                        style={{
                          backgroundColor: "rgba(42,108,168,0.10)",
                          textAlign: "center",
                          fontWeight: "600",
                          fontFamily: "Poppins",
                          fontSize: "15px",
                          color: colors.primary,
                        }}
                      >
                        {column.displayName}
                      </TableCell>
                    ))}

                    {isAdmin && (
                      <TableCell
                        align="left"
                        sx={{
                          backgroundColor: "rgba(42,108,168,0.10)",
                          textAlign: "center",
                          fontWeight: "600",
                          fontFamily: "Poppins",
                          fontSize: "15px",
                          color: colors.primary,
                        }}
                      >
                        Acciones
                      </TableCell>
                    )}
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {projects
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((project) => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={project.id}
                  >
                    <TableCell align="center" sx={{ color: colors.primary }}>{project.name}</TableCell>

                    <TableCell align="center" sx={{ color: colors.primary }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={1}
                      >
                        <span>{project.client}</span>

                        {project.last_edited_by && project.last_edited_on && (
                          <Tooltip
                            title={`Última modificación por ${project.last_edited_by
                              } el ${new Date(
                                project.last_edited_on
                              ).toLocaleString("es-ES", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}`}
                          >
                            <IconButton size="small">
                              <Info fontSize="small" color="primary" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {project.alertLevel && (
                          <Tooltip title={project.contractMessage || ""}>
                            <IconButton size="small">
                              {project.alertLevel === "expired" ? (
                                <PriorityHighIcon
                                  fontSize="small"
                                  color="error"
                                />
                              ) : (
                                <ReportProblemIcon
                                  fontSize="small"
                                  sx={{ color: "warning.main" }}
                                />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell align="center" sx={{ color: colors.primary }}>{project.managerName}</TableCell>

                    <TableCell align="center" sx={{ color: colors.primary }}>{project.status}</TableCell>

                    <TableCell align="center" sx={{ color: colors.primary }}>
                      {formatDateUTC(project.startDate)}
                    </TableCell>

                    <TableCell align="center" sx={{ color: colors.primary }}>
                     {formatDateUTC(project.endDate)}
                    </TableCell>
                      
                    <TableCell align="center" sx={{ color: colors.primary }}>{project.category}</TableCell>


                    <TableCell align="center" sx={{ color: colors.primary }}>
                      {project.assignedPersons
                        ? project.assignedPersons.length
                        : 0}
                    </TableCell>
                    <TableCell align="center" sx={{ color: colors.primary }}>
                      <Box display="flex" justifyContent="center">
                        {isAdmin || project.managerName === currentUser ? (
                          <>
                            <Tooltip title="Ver detalle del proyecto">
                              <span>
                                <IconButton
                                  onClick={() => {
                                    router.push(
                                      `/pages/detail/project_detail/${project.id}`
                                    );
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title="Eliminar proyecto">
                              <span>
                                <IconButton
                                  color="error"
                                  onClick={() => {
                                    const colaboradoresDelProyecto =
                                      project.assignedPersons || [];
                                    setDialog({
                                      open: true,
                                      variant: "warning",
                                      message: `¿Estás seguro de continuar? Esto eliminará el proyecto "${project.name
                                        }" y desvinculará a ${colaboradoresDelProyecto.length
                                        } colaborador${colaboradoresDelProyecto.length === 1
                                          ? ""
                                          : "es"
                                        } asociado${colaboradoresDelProyecto.length === 1
                                          ? ""
                                          : "s"
                                        }.`,
                                      onConfirm: () => handleDelete(project.id),
                                    });
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#999" }}>
                            No permitido
                          </span>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          labelRowsPerPage="Filas por página"
          rowsPerPageOptions={[4, 10, 20]}
          component="div"
          count={projects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            color: colors.primary,
            bgcolor: "rgba(252,254,255,0.82)",
            // ensure displayed rows and label use black text
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              color: colors.primary,
            },
          }}
          SelectProps={{
            sx: { color: colors.primary },
            MenuProps: {
              PaperProps: {
                sx: { bgcolor: colors.card, color: colors.primary },
              },
            },
          }}
        />
      </Paper>


      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </>
  );
}
