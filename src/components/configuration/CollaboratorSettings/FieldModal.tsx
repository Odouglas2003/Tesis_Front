"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import { FieldDef } from "./types";
import { createExtraField, updateExtraField } from "@/services/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editField?: FieldDef; // undefined → alta
}

const TYPES = ["string", "number", "boolean", "select", "multiselect", "date"];

export default function FieldModal({
  open,
  onClose,
  onSaved,
  editField,
}: Props) {
  /* estado local de inputs */
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [type, setType] = useState<FieldDef["type"]>("string");
  const [options, setOptions] = useState("");

  /* rellena/limpia cuando se abre */
  useEffect(() => {
    if (open) {
      if (editField) {
        setLabel(editField.label);
        setKey(editField.key);
        setType(editField.type);
        setOptions(editField.options?.join(", ") ?? "");
      } else {
        setLabel("");
        setKey("");
        setType("string");
        setOptions("");
      }
    }
  }, [open, editField]);

  const isSelect = type === "select" || type === "multiselect";

  /* guardar */
  async function handleSave() {
    const payload: Partial<FieldDef> = {
      label,
      key: key || label.replace(/\s+/g, "").toLowerCase(),
      type,
      options: isSelect
        ? options
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean)
        : [],
    };

    const res = editField
      ? await updateExtraField(editField._id, payload)
      : await createExtraField(payload);

    if (res.ok) {
      onSaved();
      onClose();
    } else {
      const msg = await res.json();
      alert(msg.message || "Error");
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editField ? "Editar campo" : "Nuevo campo extra"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Etiqueta"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            fullWidth
          />

          <TextField
            label="Key (opcional)"
            helperText="Identificador sin espacios. Se genera si lo dejas vacío."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            fullWidth
          />

          <Select
            value={type}
            onChange={(e) => setType(e.target.value as FieldDef["type"])}
            fullWidth
            disabled={!!editField} 
          >
            {TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>

          {isSelect && (
            <TextField
              label="Opciones (separadas por coma)"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              fullWidth
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
