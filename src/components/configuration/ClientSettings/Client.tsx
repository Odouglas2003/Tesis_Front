"use client";
import { useEffect, useState } from "react";
import { getClient, deleteClient } from "@/services/api";
import ClientModal from "./ClientModal";
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
import ModalComponent from "@/components/message/MessageModal";
import type { Client } from "@/types/interface";
import AddClient from "./AddClient";


export default function Client() {
  /* Estado de datos */
  const [clients, setClients] = useState<Client[]>([]);
  const [clientDelete, setClientDelete] = useState<Client | undefined>(
    undefined
  );

  /* Loading flags */
  const [loadingClients, setLoadingClients] = useState(true);

  /* Modal */
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client>();
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [modalMessage, setModalMessage] = useState(
    "Desea eliminar el cliente?"
  );
  const [modalVariant, setModalVariant] = useState<
    "error" | "success" | "warning"
  >("warning");

  /* Cargar datos al montar */
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoadingClients(true);
    const data = await getClient();
    setClients(Array.isArray(data) ? data : []);
    setLoadingClients(false);
  };

  /* Cerrar modal */
  const handleClose = () => {
    setOpen(false);
    setEditing(undefined);
  };

  const handleClickDelete = (client: Client) => {
    setClientDelete(client);
    setModalMessage("Desea eliminar el cliente" + client.name + " ?");
    setModalVariant("warning");
    setOpenModalConfirm(true);
  };

  async function handleDelete() {
    if (!clientDelete?.id) {
      return;
    }
    setModalMessage("Desea eliminar el cliente" + clientDelete.name + " ?");
    setModalVariant("warning");

    const res = await deleteClient(clientDelete.id);
    if (res.message || res.status === "success") {
      setModalMessage(res.message || "Cliente eliminado");
      setModalVariant("success");
      setOpenModalConfirm(true);
      loadClients();
    } else {
      alert("Error al eliminar");
    }
  }

  return (
    <Grid2
      container
      justifyContent="center"
      alignItems="flex-start"
      width="100%"
      sx={{
      }}
    >
      <AddClient onCreated={loadClients} />

      <Card
        sx={{
          borderRadius: "10px",
          boxShadow: "none",
          width: "100%",
          maxWidth: "100%",
          p: "4px",
          backgroundColor: "#ffffffff",
        }}
      >
        <CardContent>
          <Box>
            <Box display={"flex"} justifyContent="space-between" mb={2}>
              <Typography
                sx={{
                  fontFamily: "inherit",
                  fontWeight: 600,
                  fontSize: "18px",
                  color: "#12304D",
                }}
              >
                Listado de Clientes
              </Typography>
            </Box>

            {/* Tabla */}
            {loadingClients ? (
              <CircularProgress size={24} />
            ) : (
              <TableContainer
                sx={{
                  maxHeight: 700,
                  borderRadius: "10px",
                }}
              >
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        style={{
                          backgroundColor: "#F5F7FA",
                          textAlign: "center",
                          fontWeight: 700,
                          fontFamily: "inherit",
                          fontSize: "12px",
                          color: "#566779",
                        }}
                      >
                        {"Nombre"}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          backgroundColor: "#F5F7FA",
                          textAlign: "center",
                          fontWeight: 700,
                          fontFamily: "inherit",
                          fontSize: "12px",
                          color: "#566779",
                        }}
                      >
                        {"CUIT"}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          backgroundColor: "#F5F7FA",
                          textAlign: "center",
                          fontWeight: 700,
                          fontFamily: "inherit",
                          fontSize: "12px",
                          color: "#566779",
                        }}
                      >
                        {"Razón Social"}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          backgroundColor: "#F5F7FA",
                          textAlign: "center",
                          fontWeight: 700,
                          fontFamily: "inherit",
                          fontSize: "12px",
                          color: "#566779",
                        }}
                      >
                        {"Descripción"}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          backgroundColor: "#F5F7FA",
                          textAlign: "center",
                          fontWeight: 700,
                          fontFamily: "inherit",
                          fontSize: "12px",
                          color: "#566779",
                        }}
                      >
                        {"Activo"}
                      </TableCell>

                      <TableCell
                        align="center"
                        style={{
                          backgroundColor: "#F5F7FA",
                          textAlign: "center",
                          fontWeight: 700,
                          fontFamily: "inherit",
                          fontSize: "12px",
                          color: "#566779",
                        }}
                      >
                        {"Acciones"}
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {clients.map((c) => (
                      <TableRow hover key={c.id}>
                        <TableCell
                          align="center"
                          sx={{ fontFamily: "inherit", fontSize: "16px", color: "#12304D" }}
                        >
                          {c.name}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontFamily: "inherit", fontSize: "16px", color: "#12304D" }}
                        >
                          {c.cuit}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontFamily: "inherit", fontSize: "16px", color: "#12304D" }}
                        >
                          {c.razonSocial}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontFamily: "inherit", fontSize: "16px", color: "#12304D" }}
                        >
                          {c.description}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontFamily: "inherit", fontSize: "16px", color: "#12304D" }}
                        >
                          {c.status == true ? "Si" : "No"}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditing(c);
                              setOpen(true);
                            }}
                          >
                            <EditIcon
                              fontSize="inherit"
                              sx={{ color: "#12304D" }}
                            />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              handleClickDelete(c);
                            }}
                          >
                            <TrashIcon
                              fontSize="inherit"
                              sx={{ color: "#9F2D12" }}
                            />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!clients.length && (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography variant="body2" color="text.secondary">
                            No hay clientes cargados.
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
              <ClientModal
                open={open}
                onClose={handleClose}
                onSaved={loadClients}
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
