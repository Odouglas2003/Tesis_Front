"use client";

import { useEffect, useState } from "react";
import {
  getBasicFields,
  getExtraFields,
  deleteExtraField,
} from "@/services/api";

import FieldDefTable from "./FieldDefTable";
import FieldModal from "./FieldModal";

/* MUI */
import {
  Box,
  Button,
  Divider,
  Typography,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { FieldDef } from "./types";

export default function ColumnsPage() {
  /* estado */
  const [basic, setBasic] = useState<FieldDef[]>([]);
  const [extra, setExtra] = useState<FieldDef[]>([]);
  const [loadingBasic, setLoadingBasic] = useState(true);
  const [loadingExtra, setLoadingExtra] = useState(true);

  /* modal */
  const [open, setOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldDef | undefined>(
    undefined
  );

  /* cargar datos al montar */
  useEffect(() => {
    (async () => {
      setLoadingBasic(true);
      const basics = await getBasicFields();
      setBasic(basics);
      setLoadingBasic(false);
    })();

    loadExtra();
  }, []);

  /* helper para recargar extras */
  const loadExtra = async () => {
    setLoadingExtra(true);
    const extras = await getExtraFields();
    setExtra(extras);
    setLoadingExtra(false);
  };

  /* borrar columna extra */
  const handleDelete = async (id: string) => {
    if (!confirm("¿Borrar columna extra?")) return;
    const res = await deleteExtraField(id);

    if (res.status === 409) {
      alert("Campo en uso – no se puede borrar");
      return;
    }
    loadExtra();
  };

  /* editar columna extra */
  const handleEdit = (field: FieldDef) => {
    setEditingField(field); // pasa campo al modal
    setOpen(true);
  };

  /* cerrar modal */
  const handleClose = () => {
    setOpen(false);
    setEditingField(undefined);
  };

  return (
    <Box p={3}>
      {/* — Datos básicos — */}
      <Typography variant="h5" gutterBottom sx={{ color: "black" }}>
        Datos del colaborador
      </Typography>

      {loadingBasic ? (
        <CircularProgress size={24} />
      ) : (
        <FieldDefTable fields={basic} readOnly />
      )}

      <Divider sx={{ my: 4 }} />

      {/* — Datos extras — */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" sx={{ color: "black" }}>
          Datos extras
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingField(undefined); // modo alta
            setOpen(true);
          }}
        >
          Agregar campo
        </Button>
      </Box>

      {loadingExtra ? (
        <CircularProgress size={24} sx={{ mt: 2 }} />
      ) : (
        <FieldDefTable
          fields={extra}
          onDelete={handleDelete}
          onEdit={handleEdit} /* ← habilita lápiz */
        />
      )}

      {/* Modal alta / edición */}
      <FieldModal
        open={open}
        onClose={handleClose}
        onSaved={loadExtra}
        editField={editingField} /* undefined = alta */
      />
    </Box>
  );
}
