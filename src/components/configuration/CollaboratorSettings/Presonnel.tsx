"use client";

import { useEffect, useState } from "react";
import { getPersonnel, getBasicFields, getExtraFields } from "@/services/api";
import PersonnelModal from "./PersonnelModal";

/* MUI */
import {
  Box,
  Button,
  IconButton,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { FieldDef } from "./types";

type FieldValue = string | number | boolean | string[] | undefined;

type ExtraData = Record<string, FieldValue>;

interface Person {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  birthDate?: string; // ISO 'YYYY-MM-DD'
  idExterno?: string;

  extraData?: ExtraData;

  [key: string]: unknown;
}

type EditRecord = { _id: string } & Partial<Record<string, FieldValue>>;

export default function PersonnelPage() {
  /* Estado de datos */
  const [people, setPeople] = useState<Person[]>([]);
  const [basic, setBasic] = useState<FieldDef[]>([]);
  const [extra, setExtra] = useState<FieldDef[]>([]);

  /* Loading flags */
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [loadingFields, setLoadingFields] = useState(true);

  /* Modal */
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EditRecord | undefined>(undefined);

  /* Cargar datos al montar */
  useEffect(() => {
    (async () => {
      setLoadingFields(true);
      const [b, e] = await Promise.all([
        getBasicFields() as Promise<FieldDef[]>,
        getExtraFields() as Promise<FieldDef[]>,
      ]);

      setBasic(b);
      setExtra(e);
      setLoadingFields(false);
    })();

    loadPeople();
  }, []);

  /* Helper para recargar personal */
  const loadPeople = async () => {
    setLoadingPeople(true);
    const data = (await getPersonnel()) as Person[];
    setPeople(data);
    setLoadingPeople(false);
  };

  /* Columnas (básicas + extra) */
  const cols = [...basic, ...extra];

  /* Cerrar modal */
  const handleClose = () => {
    setOpen(false);
    setEditing(undefined);
  };

  return (
    <Box p={3}>
      {/* Botón agregar */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ mb: 2 }}
        onClick={() => {
          setEditing(undefined);
          setOpen(true);
        }}
      >
        Agregar personal
      </Button>

      {/* Tabla */}
      {loadingPeople || loadingFields ? (
        <CircularProgress size={24} />
      ) : (
        <TableContainer sx={{ maxHeight: 700, borderRadius: "20px" }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {cols.map((c) => (
                  <TableCell
                    key={c.key}
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
                    {c.label}
                  </TableCell>
                ))}
                <TableCell /> {/* Acciones */}
              </TableRow>
            </TableHead>

            <TableBody>
              {people.map((p) => (
                <TableRow hover key={p._id}>
                  {cols.map((c) => {
                    const rawFromExtra = p.extraData?.[c.key];
                    const rawFromBase = (p as Record<string, unknown>)[c.key] as FieldValue;
                    const raw = rawFromExtra !== undefined ? rawFromExtra : rawFromBase;

                    const val =
                      c.type === "boolean"
                        ? (raw ? "✔️" : "")
                        : Array.isArray(raw)
                        ? raw.join(", ")
                        : raw ?? "";

                    return (
                      <TableCell align="center" key={c.key}>
                        {val}
                      </TableCell>
                    );
                  })}

                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => {
                        const baseValues: Record<string, FieldValue> = {};
                        for (const c of cols) {
                          const v =
                            p.extraData?.[c.key] ??
                            ((p as Record<string, unknown>)[c.key] as FieldValue);
                          if (v !== undefined) baseValues[c.key] = v;
                        }

                        const edit: EditRecord = {
                          _id: p._id,
                          ...baseValues,
                        };

                        setEditing(edit);
                        setOpen(true);
                      }}
                    >
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {!people.length && (
                <TableRow>
                  <TableCell colSpan={cols.length + 1}>
                    <Typography variant="body2" color="text.secondary">
                      No hay personal cargado.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal alta / edición */}
      <PersonnelModal
        open={open}
        onClose={handleClose}
        onSaved={loadPeople} /* refresca lista tras guardar */
        basic={basic}
        extra={extra}
        editRecord={editing}
      />
    </Box>
  );
}
