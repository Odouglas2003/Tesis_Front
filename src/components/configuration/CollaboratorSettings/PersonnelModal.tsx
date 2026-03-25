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
import { createPersonnel, updatePersonnel } from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";
import type { SelectChangeEvent } from "@mui/material/Select";

type FieldValue = string | number | boolean | string[] | undefined;

type FormState = Record<string, FieldValue>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  basic: FieldDef[];
  extra: FieldDef[];
  editRecord?: { _id: string } & Partial<FormState>;
}

const emptyForm: FormState = {};

export default function PersonnelModal({
  open,
  onClose,
  onSaved,
  basic,
  extra,
  editRecord,
}: Props) {
  /* estado local */
  const [form, setForm] = useState<FormState>(emptyForm);
  const [openModal, setOpenModal] = useState(false);

  /* sincroniza al abrir o cambiar registro */
  useEffect(() => {
    if (open) {
      setForm(editRecord ? { ...editRecord } : emptyForm);
    }
  }, [open, editRecord]);

  const set = (k: string, v: FieldValue) =>
    setForm((p) => ({ ...p, [k]: v }));

  /* inputs dinámicos */
  const renderField = (f: FieldDef) => {
    const val = form[f.key] ?? (f.type === "multiselect" ? [] : "");

    if (f.type === "string" || f.type === "number") {
      return (
        <TextField
          value={val ?? ""}
          type={f.type === "number" ? "number" : "text"}
          onChange={(e) => {
            const raw = e.target.value;
            const v: FieldValue =
              f.type === "number"
                ? raw === "" ? undefined : Number(raw)
                : raw;
            set(f.key, v);
          }}
          fullWidth
        />
      );
    }

    if (f.type === "date") {
      const display = typeof val === "string" && val ? val.slice(0, 10) : "";
      return (
        <TextField
          value={display}
          type="date"
          onChange={(e) => {
            const v = e.target.value;
            set(f.key, v === "" ? undefined : v);
          }}
          fullWidth
        />
      );
    }

    if (f.type === "boolean") {
      // usamos Select con "", "true", "false" para controlar undefined/boolean
      const display =
        typeof form[f.key] === "boolean"
          ? String(form[f.key])
          : "";
      return (
        <Select
          value={display}
          onChange={(e: SelectChangeEvent) => {
            const v = e.target.value;
            set(f.key, v === "" ? undefined : v === "true");
          }}
          fullWidth
          displayEmpty
        >
          <MenuItem value="">
            <em>Sin selección</em>
          </MenuItem>
          <MenuItem value="true">Sí</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </Select>
      );
    }

    if (f.type === "select") {
      return (
        <Select
          value={(val as string) ?? ""}
          onChange={(e: SelectChangeEvent) =>
            set(f.key, e.target.value === "" ? undefined : e.target.value)
          }
          fullWidth
          displayEmpty
        >
          <MenuItem value="">
            <em>Sin selección</em>
          </MenuItem>
          {f.options?.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </Select>
      );
    }

    if (f.type === "multiselect") {
      const arr = Array.isArray(val) ? (val as string[]) : [];
      return (
        <Select
          multiple
          value={arr}
          onChange={(e: SelectChangeEvent<string[]>) => {
            const v = e.target.value;
            const next = Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [];
            set(f.key, next.length ? next : undefined);
          }}
          fullWidth
          renderValue={(selected) =>
            (selected as string[]).length
              ? (selected as string[]).join(", ")
              : "Sin selección"
          }
        >
          {f.options?.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </Select>
      );
    }

    return null;
  };

  /* guardar */
  async function handleSave() {
    const payload = {
      idExterno: (form["idExterno"] as string) || undefined,
      first_name: form["first_name"] as string | undefined,
      last_name: form["last_name"] as string | undefined,
      email: form["email"] as string | undefined,
      birthDate: form["birthDate"] as string | undefined,
      extraData: extra.reduce<Record<string, FieldValue>>((acc, f) => {
        const v = form[f.key];
        if (v !== undefined && !(Array.isArray(v) && v.length === 0)) {
          acc[f.key] = v;
        }
        return acc;
      }, {}),
    };

    const res = editRecord?._id
      ? await updatePersonnel(editRecord._id, payload)
      : await createPersonnel(payload);

    if (res.ok) {
      onSaved();
      onClose();
      setOpenModal(true);
    } else {
      const msg = await res.json().catch(() => ({}));
      alert((msg as { message?: string }).message || "Error al guardar");
    }
  }

  const allFields = [...basic, ...extra];

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editRecord ? "Editar personal" : "Nuevo personal"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {allFields.map((f) => (
              <div key={f.key}>
                <label>{f.label}</label>
                {renderField(f)}
              </div>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <ModalComponent
        open={openModal}
        variant="success"
        message="Personal guardado exitosamente"
        onClose={() => setOpenModal(false)}
      />
    </>
  );
}
