"use client";

import { useEffect, useState } from "react";
import { getJourneyModes } from "@/services/api";

import JourneyModal from "./JourneyModal";

import {
  Grid2,
  Box,
  IconButton,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import TrashIcon from "@mui/icons-material/Delete";
import { deleteJourney } from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";
import { jornada } from "@/types/interface";
import AddJourney from "./AddJourney";

export default function Journey() {
  /* Estado de datos */
  const [journeys, setJourneys] = useState<jornada[]>([]);
  const [journeyDelete, setJourneyDelete] = useState<jornada | undefined>(undefined);

  /* Loading flags */
  const [loadingJourneys, setLoadingJourneys] = useState(true);

  /* Modal */
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<jornada | undefined>(undefined);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [modalMessage, setModalMessage] = useState(
    "Desea eliminar la jornada de trabajo?"
  );
  const [modalVariant, setModalVariant] = useState<
    "error" | "success" | "warning"
  >("warning");

  /* Cargar datos al montar */
  useEffect(() => {
    loadJourneys();
  }, []);

  const loadJourneys = async () => {
    setLoadingJourneys(true);
    const data = await getJourneyModes();

    setJourneys(data);
    setLoadingJourneys(false);
  };

  /* Cerrar modal */
  const handleClose = () => {
    setOpen(false);
    setEditing(undefined);
  };

 

  const handleClickDelete = (journey: jornada) => {
    setJourneyDelete(journey);
    setModalMessage("Desea eliminar la jornada de trabajo" + journey.name + " ?");
    setModalVariant("warning");
    setOpenModalConfirm(true);
  };

  async function handleDelete() {
    if (!journeyDelete?.id) {
      return;
    }
    setModalMessage(
      "Desea eliminar la jornada de trabajo" + journeyDelete.name + " ?"
    );
    setModalVariant("warning");
    // return;
    const res = await deleteJourney(journeyDelete.id);
    if (res.message) {
      setModalMessage(res.message || "Jornada de trabajo eliminada");
      setModalVariant("success");
      setOpenModalConfirm(true);
      loadJourneys();
    } else {
      alert("Error al eliminar");
    }
  }

  return (
    <Grid2
      container
      justifyContent="center"
      alignItems="flex-start"
      width="99.9%"
    >
      <AddJourney onCreated={loadJourneys} />

      <Card
        sx={{
          borderRadius: "20px",
          boxShadow: 3,
          width: "100%",
          maxWidth: "100%",
          p: "4px",
          bgcolor: "#ffffffff",
        }}
      >
        <CardContent sx={{ p: 0, bgcolor: "#ffffffff" }}>
          <Box p={3}>
            <Box display={"flex"} justifyContent="space-between" mb={2}>
              <Box
                display={"flex"}
                alignItems="center"
                id="journey-title"
                sx={{
                  fontSize: "1.25rem",
                  color: "#000",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 600,
                    fontSize: "18px",
                    color: "#002338",
                  }}
                >
                  Jornadas de trabajo
                </Typography>
              </Box>
            </Box>

            {/* Tabla */}
            {loadingJourneys ? (
              <CircularProgress size={24} />
            ) : (
              <TableContainer sx={{ maxHeight: 700, borderRadius: "20px" }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        style={{
                          backgroundColor: "#BDE0FF",
                          textAlign: "center",
                          fontWeight: "500",
                          fontFamily: "Poppins",
                          fontSize: "16.16px",
                          color: "#000000",
                        }}
                      >
                        {"Nombre"}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          backgroundColor: "#BDE0FF",
                          textAlign: "center",
                          fontWeight: "500",
                          fontFamily: "Poppins",
                          fontSize: "16.16px",
                          color: "#000000",
                        }}
                      >
                        {"Descripción"}
                      </TableCell>
                       <TableCell
                        align="center"
                        style={{
                          backgroundColor: "#BDE0FF",
                          textAlign: "center",
                          fontWeight: "500",
                          fontFamily: "Poppins",
                          fontSize: "16.16px",
                          color: "#000000",
                        }}
                      >
                        {"Horas"}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          backgroundColor: "#BDE0FF",
                          textAlign: "center",
                          fontWeight: "500",
                          fontFamily: "Poppins",
                          fontSize: "16.16px",
                          color: "#000000",
                        }}
                      >
                        {"Activo"}
                      </TableCell>


                      <TableCell
                        align="center"
                        style={{
                          backgroundColor: "#BDE0FF",
                          textAlign: "center",
                          fontWeight: "500",
                          fontFamily: "Poppins",
                          fontSize: "16.16px",
                          color: "#000000",
                        }}
                      >
                        {"Acciones"}
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {journeys.map((j) => (
                      <TableRow hover key={j.id}>
                        <TableCell align="center" sx={{ color: "#002338" }}>{j.name}</TableCell>
                        <TableCell align="center" sx={{ color: "#002338" }}>{j.description}</TableCell>
                        <TableCell align="center" sx={{ color: "#002338" }}>{j.hours}</TableCell>
                        <TableCell align="center" sx={{ color: "#002338" }}>
                          {j.status == true ? "Si" : "No"}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditing(j);
                              setOpen(true);
                            }}
                          >
                            <EditIcon
                              fontSize="inherit"
                              sx={{ color: "#002338" }}
                            />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              handleClickDelete(j);
                            }}
                          >
                            <TrashIcon
                              fontSize="inherit"
                              sx={{ color: "#ff0000ff" }}
                            />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!journeys.length && (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography variant="body2" color="text.secondary">
                            No hay jornadas de trabajo cargados.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Modal alta / edición */}
            {editing && (
              <JourneyModal
                open={open}
                onClose={handleClose}
                onSaved={loadJourneys}
                editRecord={{
                  ...editing,
                  description: editing.description ?? "",
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
      <ModalComponent
        open={openModalConfirm}
        variant={modalVariant}
        message={modalMessage}
        onConfirm={() => {
          if (modalVariant === "warning") {
            handleDelete();
          }
        }}
        onClose={() => setOpenModalConfirm(false)}
      />
    </Grid2>
  );
}
