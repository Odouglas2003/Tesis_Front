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
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import FilterListIcon from "@mui/icons-material/FilterList";
import { getAllNotifications, getUsers } from "@/services/api";
import { Notification, User } from "@/types/interface";

export default function Record() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openRows, setOpenRows] = useState<number[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [projectManagers, setProjectManagers] = useState<string[]>([]);
  const [selectedPMs, setSelectedPMs] = useState<string[]>([]);
  const [messageStatus, setMessageStatus] = useState<string[]>(["Leídas"]);
  const messageStatuses = ["Leídas", "No leídos"];

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

  useEffect(() => {
    setLoading(true);
    getAllNotifications()
      .then((res) => {
        setNotifications(res.data || []);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      let filtered: Notification[] = [];

      const res = await getAllNotifications();
      const allNotifs = res.data || [];

      if (selectedPMs.length > 0) {
        filtered = allNotifs.map((n: Notification) => ({
          ...n,
          readers: selectedPMs.map((email) => {
            const found = (n.readers || []).find((r) => r.email === email);
            return {
              email,
              readAt: found ? found.readAt : null,
              _id: found ? found._id || "" : "", // Ensure _id is always a string
            };
          }),
        }));
      } else {
        filtered = allNotifs;
      }

      if (messageStatus.length > 0) {
        const isRead = messageStatus[0] === "Leídas";
        filtered = filtered.filter((n) =>
          isRead
            ? n.readers.some((r) => r.readAt)
            : n.readers.some((r) => !r.readAt)
        );
      }

      setNotifications(filtered);
    } catch (e) {
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
          }}
        >
          <CardContent sx={{ p: 0 }}>
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
                  }}
                >
                  Historial
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontSize: "16px",
                    fontWeight: 400,
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
                <KeyboardArrowDownIcon
                  sx={{ fontSize: "30px", color: "#002338" }}
                />
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
                        }}
                      >
                        {text}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: "#EDEDED" }}>
                  {paginatedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          fontSize: "16px",
                          fontFamily: "Roboto",
                          height: "105px",
                        }}
                      >
                        {row.message}
                      </TableCell>

                      <TableCell
                        sx={{ fontSize: "16px", fontFamily: "Roboto" }}
                      >
                        {new Date(row.sentAt).toLocaleString("es-AR")}
                      </TableCell>

                      <TableCell
                        sx={{
                          fontSize: "16px",
                          fontFamily: "Roboto",
                          verticalAlign: "center",
                          position: "relative",
                          p: 1.5,
                          width: "400px",
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
                                    sx={{ ml: 1, mt: 0.9 }}
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
                                  sx={{ mb: 0.2, mt: 1 }}
                                >
                                  Fechas de lectura:
                                </Typography>
                                {row.readers.map((r, i) => (
                                  <Typography
                                    key={r.email + (r.readAt || "") + i}
                                    fontSize="14px"
                                    fontFamily="Roboto"
                                    sx={{ ml: 1, mt: 1 }}
                                  >
                                    {r.readAt
                                      ? new Date(r.readAt).toLocaleString(
                                          "es-AR"
                                        )
                                      : " "}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          )
                        ) : (
                          <Typography
                            fontSize="16px"
                            fontFamily="Roboto"
                            sx={{ ml: 1 }}
                          >
                            Nadie lo leyó
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
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
                sx={{ bgcolor: "#EDEDED", borderTop: "1px solid #ccc" }}
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
