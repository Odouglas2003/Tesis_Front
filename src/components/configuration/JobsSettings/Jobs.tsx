"use client";

import { useEffect, useState } from "react";
import { getJobs } from "@/services/api";

import JobsModal from "./JobsModal";

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
import { deleteJob } from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";
import { Job } from "@/types/interface";
import AddJob from "./AddJob";

export default function Jobs() {
  /* Estado de datos */
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobDelete, setJobDelete] = useState<Job | undefined>(undefined);

  /* Loading flags */
  const [loadingJobs, setLoadingJobs] = useState(true);

  /* Modal */
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Job | undefined>(undefined);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [modalMessage, setModalMessage] = useState(
    "Desea eliminar el puesto de trabajo?"
  );
  const [modalVariant, setModalVariant] = useState<
    "error" | "success" | "warning"
  >("warning");

  /* Cargar datos al montar */
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoadingJobs(true);
    const data = await getJobs();

    setJobs(data);
    setLoadingJobs(false);
  };

  /* Cerrar modal */
  const handleClose = () => {
    setOpen(false);
    setEditing(undefined);
  };

 

  const handleClickDelete = (job: Job) => {
    setJobDelete(job);
    setModalMessage("Desea eliminar el puesto de trabajo" + job.name + " ?");
    setModalVariant("warning");
    setOpenModalConfirm(true);
  };

  async function handleDelete() {
    if (!jobDelete?.id) {
      return;
    }
    setModalMessage(
      "Desea eliminar el puesto de trabajo" + jobDelete.name + " ?"
    );
    setModalVariant("warning");
    // return;
    const res = await deleteJob(jobDelete.id);
    if (res.message) {
      setModalMessage(res.message || "Puesto de trabajo eliminado");
      setModalVariant("success");
      setOpenModalConfirm(true);
      loadJobs();
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
      <AddJob onCreated={loadJobs} />

      <Card
        sx={{
          borderRadius: "20px",
          boxShadow: 3,
          width: "100%",
          maxWidth: "100%",
          p: "4px",
          bgcolor: "#FFFFFF",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box p={3}>
            <Box display={"flex"} justifyContent="space-between" mb={2}>
              <Box
                display={"flex"}
                alignItems="center"
                id="jobs-title"
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
                  Puestos de trabajo
                </Typography>
              </Box>
            </Box>

            {/* Tabla */}
            {loadingJobs ? (
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
                    {jobs.map((j) => (
                      <TableRow hover key={j.id}>
                        <TableCell align="center" sx={{ color: "#002338" }}>{j.name}</TableCell>
                        <TableCell align="center" sx={{ color: "#002338" }}>{j.description}</TableCell>
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

                    {!jobs.length && (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography variant="body2" color="text.secondary">
                            No hay puestos de trabajo cargados.
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
              <JobsModal
                open={open}
                onClose={handleClose}
                onSaved={loadJobs}
                editRecord={editing}
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
