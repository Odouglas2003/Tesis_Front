"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { User } from "@/types/interface";
import ModalComponent from "@/components/message/MessageModal";
import { getUsers, updateUser, eliminarUsuarioPorEmail } from "@/services/api";
import { useAppTheme } from "@/app/ThemeProviderClient";


const Credentials: React.FC = () => {
  const { colors } = useAppTheme();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [roles, setRoles] = useState<{ [email: string]: string }>({});
  const [statuses, setStatuses] = useState<{ [email: string]: string }>({});
  const [anchorEls, setAnchorEls] = useState<{
    [email: string]: HTMLElement | null;
  }>({});
  const [statusAnchorEls, setStatusAnchorEls] = useState<{
    [email: string]: HTMLElement | null;
  }>({});

  const [dialog, setDialog] = useState<{
    open: boolean;
    variant: "success" | "error" | "warning";
    message?: string;
    onConfirm?: () => void;
  }>({ open: false, variant: "success" });

  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

  const showDialog = (
    variant: "success" | "error" | "warning",
    message?: string,
    onConfirm?: () => void
  ) => setDialog({ open: true, variant, message, onConfirm });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data: User[] = await getUsers();
        const activeUsers = data.filter((user) => !user.delete_at);
        setUsers(activeUsers);

        const initialRoles: { [email: string]: string } = {};
        const initialStatuses: { [email: string]: string } = {};
        activeUsers.forEach((user) => {
          initialRoles[user.email] = user.rol;
          initialStatuses[user.email] = user.status;
        });

        setRoles(initialRoles);
        setStatuses(initialStatuses);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        showDialog("error", "Error al cargar los usuarios");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleOpenMenu = (
    email: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEls((prev) => ({ ...prev, [email]: event.currentTarget }));
  };

  const handleCloseMenu = (email: string) => {
    setAnchorEls((prev) => ({ ...prev, [email]: null }));
  };

  const handleOpenStatusMenu = (
    email: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setStatusAnchorEls((prev) => ({ ...prev, [email]: event.currentTarget }));
  };

  const handleCloseStatusMenu = (email: string) => {
    setStatusAnchorEls((prev) => ({ ...prev, [email]: null }));
  };

  const handleRoleChange = (email: string, newRole: string) => {
    setRoles((prev) => ({ ...prev, [email]: newRole }));
    handleCloseMenu(email);
  };

  const handleStatusChange = (email: string, newStatus: string) => {
    setStatuses((prev) => ({ ...prev, [email]: newStatus }));
    handleCloseStatusMenu(email);
  };

  const handleDeleteUser = (email: string): void => {
    showDialog(
      "warning",
      `¿Estás seguro que deseas eliminar este usuario ${email}?`,
      async () => {
        try {
          await eliminarUsuarioPorEmail(email);

          setUsers((prevUsers) =>
            prevUsers.filter((user) => user.email !== email)
          );
          setRoles((prevRoles) => {
            const newRoles = { ...prevRoles };
            delete newRoles[email];
            return newRoles;
          });
          setStatuses((prevStatuses) => {
            const newStatuses = { ...prevStatuses };
            delete newStatuses[email];
            return newStatuses;
          });

          showDialog("success", "Usuario eliminado correctamente");
        } catch (error) {
          console.error("Error al eliminar usuario:", error);
          showDialog("error", "Error al borrar el usuario");
        }
      }
    );
  };

  const saveAllChanges = async () => {
    try {
      const updatePromises = users.map((user) =>
        updateUser(user.email, {
          rol: roles[user.email],
          status: statuses[user.email],
        })
      );

      await Promise.all(updatePromises);
      showDialog("success", "Todos los cambios se han guardado correctamente");
      setIsEditMode(false);
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      showDialog("error", "Error al guardar algunos cambios");
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "active":
        return "Activo";
      case "pending":
        return "Pendiente";
      case "denied":
      case "rejected":
        return "Denegado";
      default:
        return status;
    }
  };

  const uniqueUsers = users.filter(
    (user, index, self) =>
      index === self.findIndex((u) => u.email === user.email)
  );

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
            Configura tus credenciales
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
            Usuarios y roles activos
          </Typography>
        </Box>

        {isEditMode ? (
          <Button
            variant="contained"
            onClick={saveAllChanges}
            sx={{
              borderRadius: "20px",
              backgroundColor: colors.button || "#002338",
              color: "#23FFDC",
              fontSize: "20px",
              width: "200px",
              fontWeight: 500,
              textTransform: "none",
              height: "50px",
              fontFamily: "Poppins, sans-serif",
              px: 3,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#002338",
              },
            }}
          >
            Guardar
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={toggleEditMode}
            sx={{
              borderRadius: "20px",
              backgroundColor: colors.button || "#23FFDC",
              color: "#002338",
              fontSize: "20px",
              width: "200px",
              fontWeight: 500,
              textTransform: "none",
              height: "50px",
              fontFamily: "Poppins, sans-serif",
              px: 3,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#23FFDC",
              },
            }}
          >
            Editar
          </Button>
        )}
      </Box>

      {/* Contenido principal */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
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
                  <TableRow
                    sx={{
                      backgroundColor: isEditMode ? "#ADD8E6" : "#CCCCCC",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        color: "#000",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "16px",
                      }}
                    >
                      Nombre y apellido
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
                      Rol
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
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(isEditMode ? users : uniqueUsers).map((user, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: isEditMode ? "#FFFFFF" : "#EDEDED",
                      }}
                    >
                      <TableCell
                        sx={{
                          fontFamily: "Roboto, sans-serif",
                          fontSize: "16px",
                          color: "#002338",
                        }}
                      >
                        {user.name}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "Roboto, sans-serif",
                          fontSize: "16px",
                          color: "#002338",
                        }}
                      >
                        {user.email}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "Roboto, sans-serif",
                          fontSize: "16px",
                          color: "#002338",
                        }}
                      >
                        {isEditMode ? (
                          <>
                            <Button
                              variant="outlined"
                              onClick={(e) => handleOpenMenu(user.email, e)}
                              endIcon={<ArrowDropDownIcon />}
                              sx={{
                                backgroundColor: "#ffffff",
                                borderColor: "#E0E0E0",
                                borderRadius: "8px",
                                textTransform: "none",
                                color: "#002338",
                                "&:hover": {
                                  backgroundColor: "#f5f5f5",
                                  borderColor: "#BDBDBD",
                                },
                              }}
                            >
                              {roles[user.email]}
                            </Button>
                            <Menu
                              anchorEl={anchorEls[user.email]}
                              open={Boolean(anchorEls[user.email])}
                              onClose={() => handleCloseMenu(user.email)}
                              PaperProps={{
                                sx: {
                                  backgroundColor: '#ffffff',
                                  color: '#002338',
                                }
                              }}
                            >
                              {["administrador", "manager", "visitante"].map(
                                (role) => (
                                  <MenuItem
                                    key={role}
                                    onClick={() =>
                                      handleRoleChange(user.email, role)
                                    }
                                    selected={roles[user.email] === role}
                                    sx={{ color: '#002338' }}
                                  >
                                    {role}
                                  </MenuItem>
                                )
                              )}
                            </Menu>
                          </>
                        ) : (
                          <Typography>{roles[user.email]}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditMode ? (
                          <>
                            <Button
                              variant="outlined"
                              onClick={(e) =>
                                handleOpenStatusMenu(user.email, e)
                              }
                              endIcon={<ArrowDropDownIcon />}
                              sx={{
                                backgroundColor: "#ffffff",
                                borderColor: "#E0E0E0",
                                borderRadius: "8px",
                                textTransform: "none",
                                color: "#002338",
                                "&:hover": {
                                  backgroundColor: "#f5f5f5",
                                  borderColor: "#BDBDBD",
                                },
                              }}
                            >
                              {getStatusLabel(statuses[user.email])}
                            </Button>
                            <Menu
                              anchorEl={statusAnchorEls[user.email]}
                              open={Boolean(statusAnchorEls[user.email])}
                              onClose={() => handleCloseStatusMenu(user.email)}
                              PaperProps={{ sx: { backgroundColor: '#ffffff', color: '#002338' } }}
                            >
                              {[
                                { value: "active", label: "Activo" },
                                { value: "pending", label: "Pendiente" },
                                { value: "rejected", label: "Denegado" },
                              ].map((status) => (
                                <MenuItem
                                  key={status.value}
                                  onClick={() =>
                                    handleStatusChange(user.email, status.value)
                                  }
                                  selected={
                                    statuses[user.email] === status.value
                                  }
                                  sx={{ color: '#002338' }}
                                >
                                  {status.label}
                                </MenuItem>
                              ))}
                            </Menu>
                          </>
                        ) : (
                          <Typography sx={{ color: '#002338' }}>
                            {getStatusLabel(statuses[user.email])}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDeleteUser(user.email)}
                          sx={{
                            color: isEditMode ? "#FF0000" : "#9e9e9e",
                            cursor: isEditMode ? "pointer" : "default",
                            "&:hover": {
                              backgroundColor: isEditMode
                                ? "rgba(255, 0, 0, 0.08)"
                                : "transparent",
                            },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
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

export default Credentials;
