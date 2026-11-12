"use client";

import { useEffect, useState } from "react";
import { deleteSkill, getSkills } from "@/services/api";

import SkillsModal from "./SkillsModal";

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
import { Skill } from "@/types/interface";
import AddSkill from "./AddSkill";

export default function Skills() {
  /* Estado de datos */
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillDelete, setSkillDelete] = useState<Skill | undefined>(undefined);

  /* Loading flags */
  const [loadingSkills, setLoadingSkills] = useState(true);

  /* Modal */
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | undefined>(undefined);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [modalMessage, setModalMessage] = useState("Desea eliminar esta skill?");
  const [modalVariant, setModalVariant] = useState<"error" | "success" | "warning">("warning");

  /* Cargar datos al montar */
  useEffect(() => {
    loadSkill();
  }, []);

  const loadSkill = async () => {
    setLoadingSkills(true);
    const data = await getSkills();
    setSkills(data);
    setLoadingSkills(false);
  };

  /* Cerrar modal */
  const handleClose = () => {
    setOpen(false);
    setEditing(undefined);
  };



  const confirmDelete = (row: Skill) => {
    setSkillDelete(row);
    setModalMessage(`¿Desea eliminar el skill ${row.name}?`);
    setModalVariant("warning");
    setOpenModalConfirm(true);
  };

  async function handleDelete() {
    if (!skillDelete?.id) {
      return;
    }
    setModalMessage("Desea eliminar el skill " + skillDelete.name + " ?");
    setModalVariant("warning");

    const res = await deleteSkill(skillDelete.id);
    if (res.message || res.data || res.success || res) {
      setModalMessage(res.message || "Skill eliminada");
      setModalVariant("success");
      setOpenModalConfirm(true);
      loadSkill();
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
      <AddSkill onCreated={loadSkill} />

      <Card
        sx={{
          borderRadius: "10px",
          boxShadow: "none",
          width: "100%",
          maxWidth: "100%",
          p: "4px",
          bgcolor: "#FFFFFF",
        }}
      >
        <CardContent >
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
                Listado de Skill
              </Typography>
            </Box>

            {/* Tabla */}
            {loadingSkills ? (
              <CircularProgress size={24} />
            ) : (
              <TableContainer sx={{ maxHeight: 700, borderRadius: "10px" }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" style={{ backgroundColor: "#F5F7FA", fontWeight: 700, fontFamily: "inherit", fontSize: "12px", color: "#566779" }}>
                        Nombre
                      </TableCell>
                      <TableCell align="center" style={{ backgroundColor: "#F5F7FA", fontWeight: 700, fontFamily: "inherit", fontSize: "12px", color: "#566779" }}>
                        Descripción
                      </TableCell>
                      <TableCell align="center" style={{ backgroundColor: "#F5F7FA", fontWeight: 700, fontFamily: "inherit", fontSize: "12px", color: "#566779" }}>
                        Activo
                      </TableCell>
                      <TableCell align="center" style={{ backgroundColor: "#F5F7FA", fontWeight: 700, fontFamily: "inherit", fontSize: "12px", color: "#566779" }}>
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {skills.map((j) => (
                      <TableRow hover key={j.id}>
                        <TableCell align="center" sx={{ color: "#12304D" }}>{j.name}</TableCell>
                        <TableCell align="center" sx={{ color: "#12304D" }}>{j.description}</TableCell>
                        <TableCell align="center" sx={{ color: "#12304D" }}>{j.status ? "Si" : "No"}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => { setEditing(j); setOpen(true); }}>
                            <EditIcon fontSize="inherit" sx={{ color: "#12304D" }} />
                          </IconButton>
                          <IconButton size="small" onClick={() => confirmDelete(j)}>
                            <TrashIcon fontSize="inherit" sx={{ color: "#9F2D12" }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!skills.length && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography variant="body2" color="text.secondary">
                            No hay skills cargadas.
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
              <SkillsModal
                open={open}
                onClose={handleClose}
                onSaved={loadSkill}
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
        onConfirm={handleDelete}
        onClose={() => setOpenModalConfirm(false)}
      />
    </Grid2>
  );
}
