"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type Column = { displayName: string; field: string };

export default function ConfigureTablesComponent() {
  // ---- Estados de columnas para cada tabla ----
  const [collaboratorColumns, setCollaboratorColumns] = useState<Column[]>([]);
  const [initialCollaboratorColumns, setInitialCollaboratorColumns] = useState<Column[]>([]);
  const [isEditingCollaborator, setIsEditingCollaborator] = useState(false);

  const [projectColumns, setProjectColumns] = useState<Column[]>([]);
  const [initialProjectColumns, setInitialProjectColumns] = useState<Column[]>([]);
  const [isEditingProject, setIsEditingProject] = useState(false);

  const [vacanColumns, setVacanColumns] = useState<Column[]>([]);
  const [initialVacanColumns, setInitialVacanColumns] = useState<Column[]>([]);
  const [isEditingVacan, setIsEditingVacan] = useState(false);

  // ---- Estados para los títulos ----
  const [collabTitle, setCollabTitle] = useState("Colaboradores");
  const [projectTitle, setProjectTitle] = useState("Proyectos");
  const [vacanTitle, setVacanTitle] = useState("Vacantes");

  // ---- Carga inicial ----
  useEffect(() => {
    fetchColumns("collaborador");
    fetchColumns("proyecto");
    fetchColumns("vacante");
  }, []);

  async function fetchColumns(tableType: string) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/configuration/columns/${tableType}`
      );
      const data = await res.json();
      if (!Array.isArray(data.columns)) throw new Error("Columns no array");
      const cols: Column[] = data.columns.map((c: Column) => ({
        displayName: c.displayName,
        field: c.field,
      }));

      if (tableType === "collaborador") {
        setCollaboratorColumns(cols);
        setInitialCollaboratorColumns(cols);
      } else if (tableType === "proyecto") {
        setProjectColumns(cols);
        setInitialProjectColumns(cols);
      } else {
        setVacanColumns(cols);
        setInitialVacanColumns(cols);
      }
    } catch (err) {
      console.error("Error fetching", tableType, err);
    }
  }

  const handleInputChange =
    (table: string) => (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (table === "collaborador") {
        const arr = [...collaboratorColumns];
        arr[idx].displayName = val;
        setCollaboratorColumns(arr);
      } else if (table === "proyecto") {
        const arr = [...projectColumns];
        arr[idx].displayName = val;
        setProjectColumns(arr);
      } else {
        const arr = [...vacanColumns];
        arr[idx].displayName = val;
        setVacanColumns(arr);
      }
    };

  const handleDeleteColumn = (table: string) => (idx: number) => {
    if (table === "collaborador") {
      setCollaboratorColumns(collaboratorColumns.filter((_, i) => i !== idx));
    } else if (table === "proyecto") {
      setProjectColumns(projectColumns.filter((_, i) => i !== idx));
    } else {
      setVacanColumns(vacanColumns.filter((_, i) => i !== idx));
    }
  };

  async function handleSaveColumns(table: string) {
    let cols: Column[] = [];
    if (table === "collaborador") cols = collaboratorColumns;
    if (table === "proyecto") cols = projectColumns;
    if (table === "vacante") cols = vacanColumns;

    const payload = cols.map((c, i) => ({ ...c, order: i }));
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/configuration/updateColumns`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tableType: table, columns: payload }),
        }
      );
      const data = await res.json();
      if (data.status === "success") {
        if (table === "collaborador") {
          setInitialCollaboratorColumns(collaboratorColumns);
          setIsEditingCollaborator(false);
        }
        if (table === "proyecto") {
          setInitialProjectColumns(projectColumns);
          setIsEditingProject(false);
        }
        if (table === "vacante") {
          setInitialVacanColumns(vacanColumns);
          setIsEditingVacan(false);
        }
      } else {
        console.error("Error guardando", data);
      }
    } catch (err) {
      console.error("Error al guardar columnas", err);
    }
  }

  function resetToInitial(table: string) {
    if (table === "collaborador") {
      setCollaboratorColumns([...initialCollaboratorColumns]);
      setIsEditingCollaborator(false);
    }
    if (table === "proyecto") {
      setProjectColumns([...initialProjectColumns]);
      setIsEditingProject(false);
    }
    if (table === "vacante") {
      setVacanColumns([...initialVacanColumns]);
      setIsEditingVacan(false);
    }
  }

  // ---- Render de cada sección ----
  function renderSection(
    table: "collaborador" | "proyecto" | "vacante"
  ) {
    const isEditing =
      table === "collaborador"
        ? isEditingCollaborator
        : table === "proyecto"
          ? isEditingProject
          : isEditingVacan;
    const cols =
      table === "collaborador"
        ? collaboratorColumns
        : table === "proyecto"
          ? projectColumns
          : vacanColumns;
    const title =
      table === "collaborador"
        ? collabTitle
        : table === "proyecto"
          ? projectTitle
          : vacanTitle;
    const setTitle =
      table === "collaborador"
        ? setCollabTitle
        : table === "proyecto"
          ? setProjectTitle
          : setVacanTitle;

    return (
      <Card
        key={table}
        sx={{
          bgcolor: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderRadius: 3,
          mb: 3,
          border: "1px solid #f0f0f0",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Título editable */}
          <TextField
            fullWidth
            size="small"
            label="Título de columnas"
            value={title}
            disabled={!isEditing}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              mb: 3,
              fontFamily: "Poppins",
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                bgcolor: isEditing ? "#fff" : "#f8f9fa",
                fontSize: "16px"
              },
              "& .MuiInputLabel-root": {
                color: "#000",
                fontSize: "16px"
              }
            }}
          />

          {/* Label para columnas */}
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              color: "#000",
              fontSize: "16px",
              fontFamily: "Poppins",
            }}
          >
            Columnas
          </Typography>

          {/* Chips o inputs de columna */}
          <Box sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 4,
            minHeight: "80px"
          }}>
            {cols.map((col, idx) =>
              isEditing ? (
                <Box key={idx} sx={{ position: "relative", minWidth: "160px" }}>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteColumn(table)(idx)}
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      bgcolor: "#ff4444",
                      color: "#fff",
                      width: 20,
                      height: 20,
                      zIndex: 1,
                      "&:hover": { bgcolor: "#ff0000" },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                  <TextField
                    size="small"
                    value={col.displayName}
                    onChange={handleInputChange(table)(idx)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "20px",
                        fontSize: "16px"
                      }
                    }}
                  />
                </Box>
              ) : (
                <Chip
                  key={idx}
                  label={col.displayName}
                  sx={{
                    bgcolor: "#D9D9D9",
                    color: "#333",
                    borderRadius: "20px",
                    fontSize: "16px",
                    height: "40px",
                    px: "20px",
                    py: "8px",
                   
                  }}
                />
              )
            )}
          </Box>

          {/* Botones al pie */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            {isEditing ? (
              <>
                <Button
                  variant="outlined"
                  onClick={() => resetToInitial(table)}
                  sx={{
                    borderColor: "#0087FF",
                    color: "#0087FF",
                    borderRadius: "20px",
                    fontFamily: "Poppins",
                    height: "50px",
                    width: "200px",
                    fontSize: "20px",
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleSaveColumns(table)}
                  sx={{
                    color: "#23FFDC",
                    backgroundColor: "#002338",
                    borderRadius: "20px",
                    fontFamily: "Poppins",
                    height: "50px",
                    width: "200px",
                    fontSize: "20px",
                  }}
                >
                  Guardar
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() =>
                  table === "collaborador"
                    ? setIsEditingCollaborator(true)
                    : table === "proyecto"
                      ? setIsEditingProject(true)
                      : setIsEditingVacan(true)
                }
                sx={{
                  color: "#23FFDC",
                  backgroundColor: "#002338",
                  borderRadius: "20px",
                  fontFamily: "Poppins",
                  height: "50px",
                  width: "200px",
                  fontSize: "20px",
                }}
              >
                Editar
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (

    <Card sx={{
      boxShadow: 3,
      borderRadius: "20px",
      mt: "-20px",
      mb: 4,
      mr: "30px",
    }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{
            fontWeight: 600,
            color: "#333",
            mb: 1,
            fontFamily: "Poppins",
          }}>
            Configura el aspecto de las tablas
          </Typography>
          <Typography variant="body2" sx={{
            color: "#666",
            fontSize: "0.875rem",
            fontFamily: "Poppins",
          }}>
            Escribe el nombre de cada columna
          </Typography>
        </Box>

        {renderSection("collaborador")}
        {renderSection("proyecto")}
        {renderSection("vacante")}
      </CardContent>
    </Card>
  );
}