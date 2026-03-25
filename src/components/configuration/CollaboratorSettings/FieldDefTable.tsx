"use client";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { FieldDef } from "./types";

interface Props {
  fields: FieldDef[];
  readOnly?: boolean;
  onEdit?: (field: FieldDef) => void;
  onDelete?: (id: string) => void;
}

export default function FieldDefTable({
  fields,
  readOnly = false,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Box sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><strong>Columna</strong></TableCell>
            <TableCell><strong>Tipo</strong></TableCell>
            <TableCell><strong>Opciones</strong></TableCell>
            {!readOnly && <TableCell align="right"><strong>Acciones</strong></TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {fields.map((f) => (
            <TableRow key={f._id}>
              <TableCell>{f.label}</TableCell>
              <TableCell>{f.type}</TableCell>
              <TableCell>
                {f.options?.length ? f.options.join(", ") : "-"}
              </TableCell>
              {!readOnly && (
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEdit?.(f)}>
                    <Edit fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete?.(f._id)}
                  >
                    <Delete fontSize="inherit" />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
          {!fields.length && (
            <TableRow>
              <TableCell colSpan={readOnly ? 3 : 4}>
                <Typography variant="body2" color="text.secondary">
                  Sin campos definidos.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
