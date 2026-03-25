import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  IconButton,
  Collapse,
  Typography,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, ExpandMore, Info } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Employee,
  ColumnConfigColaborador,
  ProjectNew,
  BizneoUser,
} from "@/types/interface";
import ModalComponent from "@/components/message/MessageModal";
import {
  removecollaborator,
  removeAssignedPerson,
  fetchProjects,
  fetchBizneoCollaboratorFull,
} from "@/services/api";
import { formatDate } from "@/utils/utils";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { useAuthRole, isEmployeeUnderManager } from "@/app/hooks/useAuthRole";
import BizneoDetailModal from "@/components/components-collaborators/EmployeeDetailModal/EmployeeDetailModal";
interface Props {
  searchTerm: string;
  collaboratorProp: Employee[];
}

const EmployeeTable: React.FC<
  Props & { columnsprop: ColumnConfigColaborador[] }
> = ({ searchTerm, collaboratorProp, columnsprop }) => {
  const router = useRouter();

  const { isAdmin, isManager, currentUserName } = useAuthRole();

  const [employees, setEmployees] = useState<
    (Employee & {
      alertLevel?: "warning" | "expired" | null;
      contractMessage?: string | null;
    })[]
  >([]);
  const [projects, setProjects] = useState<ProjectNew[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [columns, setColumns] = useState<ColumnConfigColaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [openTech, setOpenTech] = useState<Record<string | number, boolean>>(
    {}
  );

  const isManageable = (emp: Employee) => {
    if (isAdmin) return true;
    if (!(isManager && currentUserName)) return false;
    try {
      return isEmployeeUnderManager(emp, currentUserName as string, projects);
    } catch {
      return false;
    }
  };

  const sortedEmployees = React.useMemo(() => {
    const base = Array.isArray(employees) ? [...employees] : [];
    return base.sort((a, b) => {
      const aCan = isManageable(a as Employee) ? 1 : 0;
      const bCan = isManageable(b as Employee) ? 1 : 0;
      // Primero los que pueden editar (1), luego el resto (0). Si empatan, por nombre
      if (bCan !== aCan) return bCan - aCan;
      const an = `${a.first_name ?? ""} ${a.last_name ?? ""}`.toLowerCase();
      const bn = `${b.first_name ?? ""} ${b.last_name ?? ""}`.toLowerCase();
      return an.localeCompare(bn);
    });
  }, [employees, isAdmin, isManager, currentUserName, projects]);
  const [openProj, setOpenProj] = useState<Record<string | number, boolean>>(
    {}
  );
  const [openRoles, setOpenRoles] = useState<Record<string | number, boolean>>(
    {}
  );

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
    const normalize = (s?: string | number | null) =>
      (s === undefined || s === null ? "" : String(s))
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim();
    type ProjectIdLike = { id?: string; _id?: string; name?: string; nombre?: string } | string;
    type ProjectLike = { projectId?: ProjectIdLike } | { projectId?: undefined };

    const getProjectName = (p: ProjectLike): string => {
      type ProjectNameFallback = { projectName?: string; name?: string; projectId?: ProjectIdLike };

      const pid = (p as ProjectNameFallback).projectId;

      if (pid === undefined || pid === null) {
        const fallback = p as ProjectNameFallback;
        return fallback.projectName ?? fallback.name ?? "";
      }

      if (typeof pid === "object") {
        return pid.name ?? pid.nombre ?? "";
      }

      if (typeof pid === "string") {
        const found = projects.find((proj) => {
          const projId = (proj as { id?: string; _id?: string })?.id ?? (proj as { id?: string; _id?: string })?._id;
          return String(projId) === pid;
        });

        return found?.name ?? pid ?? "";
      }

      return "";
    };

    try {
      setIsLoading(true);
      const hoy = new Date();
      const term = normalize(searchTerm);

      const updatedEmployees = (collaboratorProp || [])
        .filter((employee: Employee) => !(employee as Employee).delete_at)
        .filter((employee: Employee) => {
          if (!term) return true;

          const fullName = normalize(`${employee.first_name ?? ""} ${employee.last_name ?? ""}`);
          const email = normalize(employee.email ?? "");
          const tecnologias = normalize((employee.tecnologias ?? []).join(" "));
          const dni = normalize(employee.dni ?? "");
          const rolesText = normalize(
            (employee.roles ?? [])
              .map((r) => `${r?.rol ?? ""} ${r?.seniority ?? ""}`)
              .join(" ")
          );
          const jornada = normalize(
            typeof employee.jornadaId === "object"
              ? (employee.jornadaId as { name?: string })?.name ?? ""
              : typeof employee.jornadaId === "string"
              ? employee.jornadaId
              : ""
          );
          const projectNames = normalize(
            (Array.isArray(employee.Proyectos) ? employee.Proyectos : [])
              .map((p) => getProjectName(p))
              .filter(Boolean)
              .join(" ")
          );

          return (
            fullName.includes(term) ||
            email.includes(term) ||
            tecnologias.includes(term) ||
            rolesText.includes(term) ||
            projectNames.includes(term) ||
            dni.includes(term) ||
            jornada.includes(term)
          );
        })
        .map((employee: Employee) => {
          let alertLevel: "warning" | "expired" | null = null;
          let contractMessage: string | null = null;

          if (employee.fin_contrato) {
            const fin = new Date(employee.fin_contrato);
            const diffDays = Math.ceil(
              (fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (diffDays < 0) {
              alertLevel = "expired";
              contractMessage = `Contrato expirado hace ${-diffDays} días`;
            } else if (diffDays <= 7) {
              alertLevel = "warning";
              contractMessage = `Quedan ${diffDays} días para fin de contrato`;
            }
          }

          return {
            ...employee,
            estado: employee.estado?.trim() || "",
            alertLevel,
            contractMessage,
          };
        });

      setEmployees(updatedEmployees);
      setError(null);
    } catch (error) {
      setError(
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "Error cargando colaboradores"
      );
    } finally {
      setIsLoading(false);
    }
  }, [collaboratorProp, searchTerm, projects]);


  useEffect(() => {
    (async () => {
      try {
        const p = await fetchProjects();
        setProjects(Array.isArray(p) ? p : []);
      } catch (e) {
        setProjects([]);
      }
    })();
  }, []);

  // Config de columnas
  useEffect(() => {
    setColumns(columnsprop);
  }, [columnsprop]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.pageX - (tableContainerRef.current?.offsetLeft || 0));
    setScrollLeft(tableContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (tableContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1;
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleDelete = async (collaboratorId: string) => {
    const empleado = employees.find((e) => e.id === collaboratorId);
    if (!empleado) return;

    if (empleado.Proyectos?.length) {
      for (const proyecto of empleado.Proyectos) {
        const projId =
          typeof proyecto.projectId === "string"
            ? proyecto.projectId
            : proyecto.projectId?.id;
        if (projId) {
          try {
            await removeAssignedPerson(projId, collaboratorId);
          } catch (err) {
            showDialog("error", `No se pudo quitar del proyecto ${projId}`);
            return;
          }
        }
      }
    }

    try {
      const res = await removecollaborator(collaboratorId);
      if ((res as { status: string })?.status === "error") {
        showDialog(
          "error",
          (res as { status: string }).status || "Error al eliminar colaborador"
        );
        return;
      }
      showDialog("success", "Colaborador eliminado correctamente");
      setEmployees((prev) => prev.filter((e) => e.id !== collaboratorId));
    } catch (err) {
      showDialog("error", "Ocurrió un error inesperado al eliminar");
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const toggleTech = (id: number | string) =>
    setOpenTech((p: { [key: string]: boolean }) => ({ ...p, [id]: !p[id] }));
  const toggleProj = (id: number | string) =>
    setOpenProj((p: { [key: string]: boolean }) => ({ ...p, [id]: !p[id] }));
  const [bizneoOpen, setBizneoOpen] = useState(false);
  const [bizneoLoading, setBizneoLoading] = useState(false);
  const [bizneoError, setBizneoError] = useState<string | null>(null);
  const [bizneoData, setBizneoData] = useState<BizneoUser | null>(null);

  const handleOpenBizneo = async (emp: Employee) => {
    const bizneoId = emp.bizneoId;

    if (!bizneoId) {
      setBizneoError("Este colaborador no tiene bizneoId asociado.");
      setBizneoData(null);
      setBizneoOpen(true);
      return;
    }
    setBizneoOpen(true);
    setBizneoLoading(true);
    setBizneoError(null);
    setBizneoData(null);
    try {
      const data = await fetchBizneoCollaboratorFull(bizneoId);
      setBizneoData(data);
    } catch (e: unknown) {
      setBizneoError(e instanceof Error ? e.message : "No se pudo cargar el detalle de Bizneo");
    } finally {
      setBizneoLoading(false);
    }
  };

  const handleCloseBizneo = () => {
    setBizneoOpen(false);
    setBizneoData(null);
    setBizneoError(null);
  };

  return (
    <>
      <Paper
        sx={{
          overflow: "hidden",
          marginLeft: "60px",
          marginRight: "60px",
          borderRadius: "20px",
          backgroundColor: "#ffffff",
        }}
      >
        <TableContainer
          component={Paper}
          ref={tableContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          sx={{
            maxHeight: 700,
            borderRadius: "20px",
            backgroundColor: "#ffffff",
          }}
        >
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {isLoading ? (
                  <TableCell colSpan={10} align="center">
                    Cargando configuración...
                  </TableCell>
                ) : error ? (
                  <TableCell
                    colSpan={10}
                    align="center"
                    style={{ color: "red" }}
                  >
                    {error}
                  </TableCell>
                ) : columns.length === 0 ? (
                  <TableCell colSpan={10} align="center">
                    No se encontraron columnas configuradas
                  </TableCell>
                ) : (
                  <>
                    {columns.map((column) => (
                      <TableCell
                        key={column.field}
                        align="center"
                        sx={{
                          backgroundColor: "#BDE0FF",
                          textAlign: "center",
                          fontWeight: "500",
                          fontFamily: "Poppins",
                          fontSize: "16.16px",
                          color: "#000000DE",
                        }}
                      >
                        {column.displayName}
                      </TableCell>
                    ))}
                    {(isAdmin || isManager) && (
                      <TableCell
                        align="left"
                        sx={{
                          backgroundColor: "#BDE0FF",
                          textAlign: "center",
                          fontWeight: "500",
                          fontFamily: "Poppins",
                          fontSize: "16.16px",
                          color: "#000000DE",
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
              {sortedEmployees
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee, index) => {
                  const key = `${employee.dni ?? employee.id ?? index
                    }-${index}`;
                  const canManage = isManageable(employee as Employee);

                  return (
                    <TableRow
                      key={key}
                      sx={
                        !canManage && isManager
                          ? { backgroundColor: "#f5f7fa", opacity: 0.7 }
                          : undefined
                      }
                    >
                      <TableCell align="center">
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          gap={1}
                        >
                          <Typography
                            sx={{
                              fontFamily: "Roboto",
                              fontWeight: 400,
                              color: "#000000DE",
                              textAlign: "center",
                            }}
                          >
                            {employee.first_name}
                          </Typography>

                          {employee.last_edited_by &&
                            employee.last_edited_on && (
                              <Tooltip
                                title={`Última modificación por ${employee.last_edited_by
                                  } el ${new Date(
                                    employee.last_edited_on
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

                          {employee.alertLevel && (
                            <Tooltip title={employee.contractMessage || ""}>
                              <IconButton size="small">
                                {employee.alertLevel === "expired" ? (
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

                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontFamily: "Roboto",
                            fontWeight: 400,
                            color: "#000000DE",
                            textAlign: "center",
                          }}
                        >
                          {employee.last_name}
                        </Typography>
                      </TableCell>

                      {/* Roles */}
                      <TableCell
                        align="center"
                        sx={{ p: 0, minWidth: "220px", maxWidth: "320px" }}
                      >
                        {employee.roles && employee.roles.length > 0 ? (
                          <Box>
                            <Box
                              display="flex"
                              alignItems="center"
                              sx={{
                                cursor:
                                  employee.roles.length > 1
                                    ? "pointer"
                                    : "default",
                              }}
                              justifyContent="center"
                              onClick={
                                employee.roles.length > 1
                                  ? () =>
                                    setOpenRoles((prev) => ({
                                      ...prev,
                                      [employee.dni ?? employee.id ?? index]:
                                        !prev[
                                        employee.dni ?? employee.id ?? index
                                        ],
                                    }))
                                  : undefined
                              }
                            >
                              <Typography
                                sx={{
                                  fontFamily: "Roboto",
                                  fontWeight: 400,
                                  color: "#000000DE",
                                  textAlign: "center",
                                }}
                              >
                                {employee.roles[0].rol} -{" "}
                                {employee.roles[0].seniority}
                                {employee.roles.length > 1 && (
                                  <ExpandMore
                                    sx={{
                                      ml: 0.5,
                                      transform: openRoles[
                                        employee.dni ?? employee.id ?? index
                                      ]
                                        ? "rotate(180deg)"
                                        : "none",
                                      transition: "transform .2s",
                                    }}
                                  />
                                )}
                              </Typography>
                            </Box>
                            <Collapse
                              in={
                                openRoles[employee.dni ?? employee.id ?? index]
                              }
                              unmountOnExit
                            >
                              {employee.roles.slice(1).map((r, i) => (
                                <Typography
                                  key={i}
                                  sx={{
                                    fontFamily: "Roboto",
                                    fontWeight: 400,
                                    color: "#000000DE",
                                    textAlign: "center",
                                  }}
                                >
                                  {r.rol} - {r.seniority}
                                </Typography>
                              ))}
                            </Collapse>
                          </Box>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      {/* Proyectos */}
                      <TableCell
                        align="center"
                        sx={{ p: 0, minWidth: "220px", maxWidth: "320px" }}
                      >
                        {employee.Proyectos?.length ? (
                          <Box>
                            <Box
                              display="flex"
                              alignItems="center"
                              sx={{ cursor: "pointer" }}
                              justifyContent="center"
                              onClick={() =>
                                toggleProj(employee.dni ?? employee.id ?? index)
                              }
                            >
                              <Typography
                                sx={{
                                  fontFamily: "Roboto",
                                  fontWeight: 400,
                                  color: "#000000DE",
                                  textAlign: "center",
                                }}
                              >
                                {typeof employee.Proyectos[0]?.projectId ===
                                  "string"
                                  ? (employee.Proyectos[0]?.projectId as string)
                                  : employee.Proyectos[0]?.projectId?.name ||
                                  "-"}
                                {employee.Proyectos.length > 1 && (
                                  <ExpandMore
                                    sx={{
                                      ml: 0.5,
                                      transform: openProj[
                                        employee.dni ?? employee.id ?? index
                                      ]
                                        ? "rotate(180deg)"
                                        : "none",
                                      transition: "transform .2s",
                                    }}
                                  />
                                )}
                              </Typography>
                            </Box>
                            <Collapse
                              in={
                                openProj[employee.dni ?? employee.id ?? index]
                              }
                              unmountOnExit
                            >
                              {employee.Proyectos.filter(
                                (p) =>
                                  p.projectId && typeof p.projectId !== "string"
                              ).map((p) => {
                                const key =
                                  (p.projectId as { id: string }).id ??
                                  `${employee.id}-p`;
                                return (
                                  <Typography
                                    key={key}
                                    sx={{
                                      fontFamily: "Roboto",
                                      fontWeight: 400,
                                      color: "#000000DE",
                                      textAlign: "center",
                                    }}
                                  >
                                    {(p.projectId as { name: string }).name}
                                  </Typography>
                                );
                              })}
                            </Collapse>
                          </Box>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      {/* Tecnologías */}
                      <TableCell align="center" sx={{ p: 0 }}>
                        {employee.tecnologias?.length ? (
                          <Box>
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              onClick={() =>
                                toggleTech(employee.dni ?? employee.id ?? index)
                              }
                              sx={{ cursor: "pointer" }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: "Roboto",
                                  fontWeight: 400,
                                  color: "#000000DE",
                                  textAlign: "center",
                                }}
                              >
                                {employee.tecnologias[0]}
                                {employee.tecnologias.length > 1 && (
                                  <ExpandMore
                                    sx={{
                                      ml: 0.5,
                                      transform: openTech[
                                        employee.dni ?? employee.id ?? index
                                      ]
                                        ? "rotate(180deg)"
                                        : "none",
                                      transition: "transform .2s",
                                    }}
                                  />
                                )}
                              </Typography>
                            </Box>
                            <Collapse
                              in={
                                openTech[employee.dni ?? employee.id ?? index]
                              }
                              unmountOnExit
                            >
                              {employee.tecnologias.slice(1).map((t) => (
                                <div key={t}>{t}</div>
                              ))}
                            </Collapse>
                          </Box>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      {/* Estado */}
                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontFamily: "Roboto",
                            fontWeight: 400,
                            color: "#000000DE",
                            textAlign: "center",
                          }}
                        >
                          {typeof employee.jornadaId === "object" && (employee.jornadaId)?.name}
                        </Typography>
                      </TableCell>

                      {/* Fin de contrato */}
                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontFamily: "Roboto",
                            fontWeight: 400,
                            color: "#000000DE",
                            textAlign: "center",
                          }}
                        >
                          {employee.fin_contrato
                            ? formatDate(employee.fin_contrato)
                            : "-"}
                        </Typography>
                      </TableCell>

                      {/* Horas asignadas */}
                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontFamily: "Roboto",
                            fontWeight: 400,
                            color: "#000000DE",
                            textAlign: "center",
                          }}
                        >
                          {typeof (employee as { horasAsignadas: number }).horasAsignadas === "number"
                            ? (employee as { horasAsignadas: number }).horasAsignadas
                            : "-"}
                        </Typography>
                      </TableCell>

                      {/* 
                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontFamily: "Roboto",
                            fontWeight: 400,
                            color: "#000000DE",
                            textAlign: "center",
                          }}
                        >
                          {typeof (employee as { honorarios: number }).honorarios !== "undefined"
                            ? (employee as { honorarios: number }).honorarios
                            : "-"}
                        </Typography>
                      </TableCell>
*/}
                      {(isAdmin || isManager) && (
                        <TableCell align="center">
                          <Box display="flex" justifyContent="center">
                            <Tooltip
                              title={
                                canManage
                                  ? "Ver detalle"
                                  : "No podés ver el detalle de este colaborador"
                              }
                            >
                              <span>
                                <IconButton
                                  disabled={!canManage}
                                  onClick={() =>
                                    router.push(
                                      `/pages/detail/collaborator_detail/${employee.id}`
                                    )
                                  }
                                >
                                  <Edit />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Ver detalle Bizneo">
                              <span>
                                <IconButton onClick={() => handleOpenBizneo(employee as Employee)}>
                                  <VisibilityIcon fontSize="inherit" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip
                              title={
                                canManage
                                  ? "Eliminar"
                                  : "No podés eliminar este colaborador"
                              }
                            >
                              <span>
                                <IconButton
                                  color="error"
                                  disabled={!canManage}
                                  onClick={() =>
                                    employee.id && handleDelete(employee.id)
                                  }
                                >
                                  <Delete />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          labelRowsPerPage="Filas por página"
          rowsPerPageOptions={[4, 10, 20]}
          component="div"
          count={employees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '& .MuiTablePagination-toolbar': { color: '#002338' },
            '& .MuiTablePagination-selectLabel': { color: '#002338' },
            '& .MuiTablePagination-displayedRows': { color: '#002338' },
            '& .MuiTablePagination-actions .MuiIconButton-root': { color: '#002338' },
          }}
          SelectProps={{
            sx: {
              color: '#002338',
              '& .MuiSvgIcon-root': { color: '#002338' },
            },
            MenuProps: {
              PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
              MenuListProps: { sx: { bgcolor: '#FFFFFF' } },
            },
          }}
        />
      </Paper>
      <BizneoDetailModal
        open={bizneoOpen}
        onClose={handleCloseBizneo}
        loading={bizneoLoading}
        error={bizneoError}
        data={bizneoData}
      />

      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </>
  );
};

export default EmployeeTable;
