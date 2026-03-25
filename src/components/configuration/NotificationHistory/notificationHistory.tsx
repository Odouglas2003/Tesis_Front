"use client";
import React, { useEffect, useState } from "react";
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
  Typography,
  Button,
  Card,
  CardContent,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  IconButton,
  Grid2,
  Menu,
  MenuItem,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import FilterListIcon from "@mui/icons-material/FilterList";
import { formatDate } from "@/utils/utils";
import {
  getUsers,
  getNotificationsByManager,
  getNotificationsOrdered,
} from "@/services/api";
import { Notification, User } from "@/types/interface";

export default function Record() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openRows, setOpenRows] = useState<number[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [projectManagers, setProjectManagers] = useState<string[]>([]);
  const [selectedPMs, setSelectedPMs] = useState<string[]>([]);
  const [messageStatus, setMessageStatus] = useState<string[]>(["Leídas"]);
  const messageStatuses = ["Leídas", "No leídos"];
  const [orderBy, setOrderBy] = useState<"newest" | "oldest">("newest");
  const [orderAnchorEl, setOrderAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    getUsers()
      .then((res) => {
        const managers = (res || [])
          .filter((u: User) => u.rol === "manager")
          .map((u: User) => u.email);
        setProjectManagers(managers);
      })
      .catch(() => setProjectManagers([]));
  }, []);

  const loadInitialNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotificationsOrdered(orderBy);
      setNotifications(res.data || res || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialNotifications();
  }, [orderBy]);

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      let finalNotifications: Notification[] = [];

      if (selectedPMs.length > 0) {
        const managerRes = await getNotificationsByManager(selectedPMs);
        finalNotifications = managerRes.data || managerRes || [];
      } else {
        const orderedRes = await getNotificationsOrdered(orderBy);
        finalNotifications = orderedRes.data || orderedRes || [];
      }

      if (messageStatus.length > 0) {
        if (messageStatus.length === messageStatuses.length) {
        } else {
          const selectedStatus = messageStatus[0];

          if (selectedStatus === "Leídas") {
            finalNotifications = finalNotifications.filter(
              (notif) =>
                notif.readers &&
                notif.readers.length > 0 &&
                notif.readers.some((reader) => reader.readAt)
            );
          } else if (selectedStatus === "No leídos") {
            finalNotifications = finalNotifications.filter(
              (notif) =>
                !notif.readers ||
                notif.readers.length === 0 ||
                notif.readers.every((reader) => !reader.readAt)
            );
          }
        }
      }

      if (selectedPMs.length > 0) {
        finalNotifications = [...finalNotifications].sort((a, b) => {
          if (orderBy === "newest") {
            return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
          }
          if (orderBy === "oldest") {
            return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
          }
          return 0;
        });
      }

      setNotifications(finalNotifications || []);
    } catch (error) {
      console.error("Error applying filters:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
      handleCloseFilters();
    }
  };

  const toggleOpen = (index: number) => {
    setOpenRows((prev) =>
      (prev ?? []).includes(index)
        ? (prev ?? []).filter((i) => i !== index)
        : [...(prev ?? []), index]
    );
  };

  const handleOpenFilters = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseFilters = () => {
    setAnchorEl(null);
  };

  const handlePMChange = (pm: string) => {
    const currentIndex = selectedPMs.indexOf(pm);
    const newSelectedPMs = [...selectedPMs];
    if (currentIndex === -1) {
      newSelectedPMs.push(pm);
    } else {
      newSelectedPMs.splice(currentIndex, 1);
    }
    setSelectedPMs(newSelectedPMs);
  };

  const handleStatusChange = (status: string) => {
    const currentIndex = messageStatus.indexOf(status);
    const newMessageStatus = [...messageStatus];
    if (currentIndex === -1) {
      newMessageStatus.push(status);
    } else {
      newMessageStatus.splice(currentIndex, 1);
    }
    setMessageStatus(newMessageStatus);
  };

  const open = Boolean(anchorEl);

  const handleOrderClick = (event: React.MouseEvent<HTMLElement>) => {
    setOrderAnchorEl(event.currentTarget);
  };

  const handleOrderClose = () => {
    setOrderAnchorEl(null);
  };

  const handleOrderSelect = (order: "newest" | "oldest") => {
    setOrderBy(order);
    setOrderAnchorEl(null);
  };

  const paginatedData = notifications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Grid2
      container
      justifyContent="center"
      alignItems="flex-start"
      width="100%"
      sx={{
        marginRight: "55px",
        bgcolor: "#f5f5f5",
      }}
    >
      <Grid2
        container
        size={{ xs: 6, sm: 10, md: 12, lg: 12, xl: 12 }}
        display="flex"
        justifyContent="center"
      >
        <Card
          sx={{
            borderRadius: "20px",
            boxShadow: 3,
            p: { xs: 1, sm: 2, md: 3 },
            width: "100%",
            maxWidth: "100%",
            bgcolor: "#FFFFFF",
          }}
        >
          <CardContent sx={{ p: 0 , bgcolor: "#FFFFFF" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: "29px", mt: "20px" }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 600,
                    fontSize: "18px",
                    color: "#002338",
                  }}
                >
                  Historial
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#002338",
                  }}
                >
                  Registro de lectura de notificaciones.
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontSize: "20px",
                    fontWeight: 500,
                    color: "#002338",
                  }}
                >
                  Ordenar
                </Typography>
                <IconButton
                  onClick={handleOrderClick}
                  sx={{ fontSize: "30px", color: "#002338" }}
                >
                  <KeyboardArrowDownIcon />
                </IconButton>
                <Menu
                  anchorEl={orderAnchorEl}
                  open={Boolean(orderAnchorEl)}
                  onClose={handleOrderClose}
                  PaperProps={{
                    sx: {
                      borderRadius: "12px",
                      boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.12)",
                      border: "1px solid #E0E0E0",
                      mt: 1,
                      minWidth: "220px",
                      "& .MuiList-root": {
                        padding: "8px",
                      },
                    },
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                >
                  <MenuItem
                    onClick={() => handleOrderSelect("newest")}
                    sx={{
                      fontFamily: "Poppins",
                      fontSize: "16px",
                      fontWeight: orderBy === "newest" ? 600 : 400,
                      color: orderBy === "newest" ? "#002338" : "#666666",
                      backgroundColor:
                        orderBy === "newest" ? "#F0FDFC" : "transparent",
                      borderRadius: "8px",
                      margin: "2px 0",
                      padding: "12px 16px",
                      "&:hover": {
                        backgroundColor:
                          orderBy === "newest" ? "#E6FFFE" : "#F5F5F5",
                      },
                      "&:before": {
                        content: orderBy === "newest" ? '"✓"' : '""',
                        marginRight: orderBy === "newest" ? "8px" : "0",
                        color: "#23FFDC",
                        fontWeight: "bold",
                      },
                    }}
                  >
                    Más nuevos a más viejos
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleOrderSelect("oldest")}
                    sx={{
                      fontFamily: "Poppins",
                      fontSize: "16px",
                      fontWeight: orderBy === "oldest" ? 600 : 400,
                      color: orderBy === "oldest" ? "#002338" : "#666666",
                      backgroundColor:
                        orderBy === "oldest" ? "#F0FDFC" : "transparent",
                      borderRadius: "8px",
                      margin: "2px 0",
                      padding: "12px 16px",
                      "&:hover": {
                        backgroundColor:
                          orderBy === "oldest" ? "#E6FFFE" : "#F5F5F5",
                      },
                      "&:before": {
                        content: orderBy === "oldest" ? '"✓"' : '""',
                        marginRight: orderBy === "oldest" ? "8px" : "0",
                        color: "#23FFDC",
                        fontWeight: "bold",
                      },
                    }}
                  >
                    Más viejos a más nuevos
                  </MenuItem>
                </Menu>
                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={handleOpenFilters}
                  sx={{
                    bgcolor: "#23FFDC",
                    color: "#002338",
                    fontWeight: 500,
                    fontFamily: "Poppins",
                    borderRadius: "20px",
                    textTransform: "none",
                    width: "200px",
                    height: "50px",
                    fontSize: "20px",
                  }}
                >
                  Filtros
                </Button>
              </Box>
            </Box>
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: "20px",
                overflow: "hidden",
                width: "100%",
                boxShadow: "none",
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {["Mensaje", "Fecha de envío", "PM"].map((text) => (
                      <TableCell
                        key={text}
                        sx={{
                          bgcolor: "#CCCCCC",
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          fontSize: "16.16px",
                          p: 1.5,
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          color: "#002338",
                        }}
                      >
                        {text}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: "#EDEDED" }}>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        sx={{ textAlign: "center", py: 4 }}
                      >
                        <Typography>Cargando...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        sx={{ textAlign: "center", py: 4 }}
                      >
                        <Typography>
                          No hay notificaciones para mostrar
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell
                          sx={{
                            fontSize: "16px",
                            fontFamily: "Roboto",
                            height: "105px",
                            color: "#002338",
                          }}
                        >
                          {row.message}
                        </TableCell>

                        <TableCell
                          sx={{ fontSize: "16px", fontFamily: "Roboto" , color: "#002338"}}
                        >
                          {formatDate(row.sentAt)}
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "16px",
                            fontFamily: "Roboto",
                            verticalAlign: "center",
                            position: "relative",
                            p: 1.5,
                            width: "400px",
                            color: "#002338",
                          }}
                        >
                          {row.readers && row.readers.length > 0 ? (
                            !openRows.includes(index) ? (
                              <IconButton
                                onClick={() => toggleOpen(index)}
                                size="small"
                              >
                                <KeyboardArrowDownIcon />
                              </IconButton>
                            ) : (
                              <Box
                                sx={{
                                  mt: 0.5,
                                  display: "flex",
                                  alignItems: "flex-start",
                                  flexWrap: "nowrap",
                                  whiteSpace: "normal",
                                  overflowX: "auto",
                                  gap: 2,
                                }}
                              >
                                <Box>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                    mb={0.5}
                                  >
                                    <Typography
                                      fontWeight={600}
                                      fontSize="14px"
                                      fontFamily="Poppins"
                                      color="#002338"
                                    >
                                      Personas:
                                    </Typography>
                                    <IconButton
                                      onClick={() => toggleOpen(index)}
                                      size="small"
                                      sx={{ p: 0.5 }}
                                    >
                                      <KeyboardArrowUpIcon />
                                    </IconButton>
                                  </Box>
                                  {row.readers.map((r, i) => (
                                    <Typography
                                      key={r.email + (r.readAt || "") + i}
                                      fontSize="14px"
                                      fontFamily="Roboto"
                                      sx={{ ml: 1, mt: 0.9 , color: "#002338"}}
                                    >
                                      {r.email.replace(/@mindfactory\.ar$/, "")}
                                    </Typography>
                                  ))}
                                </Box>

                                <Box sx={{ mt: 0 }}>
                                  <Typography
                                    fontWeight={600}
                                    fontSize="14px"
                                    fontFamily="Poppins"
                                    sx={{ mb: 0.2, mt: 1 ,color: "#002338"}}
                                  >
                                    Fechas de lectura:
                                  </Typography>
                                  {row.readers.map((r, i) => (
                                    <Typography
                                      key={r.email + (r.readAt || "") + i}
                                      fontSize="14px"
                                      fontFamily="Roboto"
                                      sx={{ ml: 1, mt: 1, color: "#002338" }}
                                    >
                                      {r.readAt ? formatDate(r.readAt) : " "}
                                    </Typography>
                                  ))}
                                </Box>
                              </Box>
                            )
                          ) : (
                            <Typography
                              fontSize="16px"
                              fontFamily="Roboto"
                              sx={{ ml: 1, color: "#002338" }}
                            >
                              Nadie lo leyó
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[4, 10, 15]}
                component="div"
                count={notifications.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage="Filas por página"
                sx={{
                  bgcolor: "#EDEDED",
                  borderTop: "1px solid #ccc",
                  '& .MuiTablePagination-toolbar': { color: '#002338' },
                  '& .MuiTablePagination-selectLabel': { color: '#002338' },
                  '& .MuiTablePagination-displayedRows': { color: '#002338' },
                  '& .MuiTablePagination-actions .MuiIconButton-root': { color: '#002338' },
                  '& .MuiIconButton-root': { color: '#002338' },
                  '& .MuiSvgIcon-root': { color: '#002338' },
                  '& .MuiSelect-select': { color: '#002338', backgroundColor: '#ffffff' },
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        backgroundColor: '#ffffff',
                        color: '#002338',
                      },
                    },
                    MenuListProps: {
                      sx: {
                        backgroundColor: '#ffffff',
                        color: '#002338',
                        '& .MuiMenuItem-root': { color: '#002338' },
                      },
                    },
                  },
                  sx: { color: '#002338' },
                }}
              />
            </TableContainer>
          </CardContent>
        </Card>
      </Grid2>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseFilters}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: "273px",
            borderRadius: "0px 0px 10px 10px",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            p: 2,
            mt: "20px",
            backgroundColor: '#ffffff',
            color: '#002338',
          },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "18px",
              mb: 1.5,
            }}
          >
            Project Manager
          </Typography>

          <FormGroup>
            {projectManagers.map((pm, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={selectedPMs.indexOf(pm) !== -1}
                    onChange={() => handlePMChange(pm)}
                    sx={{
                      color: "#009DFF",
                      "&.Mui-checked": {
                        color: "#009DFF",
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontSize: "16px",
                    }}
                  >
                    {pm.replace(/@mindfactory\.ar$/, "")}
                  </Typography>
                }
              />
            ))}
          </FormGroup>

          <Divider sx={{ my: 2 }} />

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "18px",
              mb: 1.5,
            }}
          >
            Lectura de mensajes
          </Typography>

          <FormGroup>
            {messageStatuses.map((status, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={messageStatus.indexOf(status) !== -1}
                    onChange={() => handleStatusChange(status)}
                    sx={{
                      color: "#009DFF",
                      "&.Mui-checked": {
                        color: "#009DFF",
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontSize: "16px",
                    }}
                  >
                    {status}
                  </Typography>
                }
              />
            ))}
          </FormGroup>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              sx={{
                bgcolor: "#00FFD1",
                color: "#002338",
                fontWeight: 500,
                fontFamily: "Poppins",
                borderRadius: "25px",
                textTransform: "none",
                width: "200px",
                height: "45px",
                fontSize: "18px",
                "&:hover": {
                  bgcolor: "#00E6BD",
                },
              }}
            >
              Aplicar
            </Button>
          </Box>
        </Box>
      </Popover>
    </Grid2>
  );
}
