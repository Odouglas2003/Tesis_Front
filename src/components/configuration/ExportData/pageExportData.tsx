"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ModalComponent from "@/components/message/MessageModal";

import { runFullSync, preserveBizneoCollaborator } from "@/services/api";
import {
  CambioCollab,
  FullSyncResponse,
  SkippedItem,
  BackendCollabLite,
} from "@/types/interface";

const ExportData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [restoringIds, setRestoringIds] = useState<Set<string>>(new Set());

  const [agregadosColab, setAgregadosColab] = useState<CambioCollab[]>([]);
  const [actualizadosColab, setActualizadosColab] = useState<CambioCollab[]>([]);

  const [ejecucionOk, setEjecucionOk] = useState<boolean | null>(null);

  const [inactivosBizneo, setInactivosBizneo] = useState<SkippedItem[]>([]);
  const [inactivosDb, setInactivosDb] = useState<CambioCollab[]>([]);
  const [inactivosDbTotal, setInactivosDbTotal] = useState(0);

  const [dialog, setDialog] = useState<{
    open: boolean;
    variant: "success" | "error" | "warning";
    message?: string;
    onConfirm?: () => void;
  }>({ open: false, variant: "success" });

  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));
  const showDialog = (
    variant: "success" | "error" | "warning",
    message?: string,
    onConfirm?: () => void
  ) => setDialog({ open: true, variant, message, onConfirm });

  const joinName = (first?: string, last?: string) =>
    [first?.trim(), last?.trim()].filter(Boolean).join(" ") || "(Sin nombre)";

  const toCambio = (c: BackendCollabLite): CambioCollab => ({
    id: String(c._id ?? ""),
    name: joinName(c.first_name, c.last_name),
    email: c.email ?? null,
    changes: Array.isArray(c.changes) ? c.changes : [],
  });

  const onReestablecer = async (collaboratorId: string) => {
    const colaborador = inactivosDb.find(c => c.id === collaboratorId);
    const nombreColaborador = colaborador?.name || "este colaborador";
    
    showDialog(
      "warning",
      `¿Estás seguro de que quieres reestablecer a ${nombreColaborador}? Esta acción lo marcará como activo nuevamente.`,
      async () => {
        setRestoringIds(prev => new Set(prev).add(collaboratorId));
        
        try {
          await preserveBizneoCollaborator(collaboratorId);
          
          setInactivosDb(prev => prev.filter(c => c.id !== collaboratorId));
          
          showDialog("success", "Colaborador reestablecido correctamente.");
        } catch (err) {
          console.error("Error al reestablecer colaborador:", err);
          
          const errorMessage = (err as Error)?.message || "Error desconocido al reestablecer el colaborador";
          showDialog("error", `Error al reestablecer el colaborador: ${errorMessage}`);
        } finally {
          setRestoringIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(collaboratorId);
            return newSet;
          });
        }
      }
    );
  };

  const onExportar = async () => {
    setLoading(true);
    setEjecucionOk(null);
    setAgregadosColab([]);
    setActualizadosColab([]);

    try {
      const data: FullSyncResponse = await runFullSync({
        limit: 200,
        perPage: 25,
        startPage: 1,
        maxPages: null,
        delayMs: 200,
      });

      const collab = data?.report?.collaborators;
      if (!collab) {
        setEjecucionOk(true);
        showDialog("success", "Exportación finalizada (sin cambios).");
        return;
      }

      const created = Array.isArray(collab.created) ? collab.created : [];
      const updated = Array.isArray(collab.updated) ? collab.updated : [];

      const fromBizneo = collab.inactive?.from_bizneo ?? { total: 0, items: [] };
      const inDb = collab.inactive?.in_db ?? { total: 0, items: [] };

      setAgregadosColab(created.map(toCambio));
      setActualizadosColab(updated.map(toCambio));

      setInactivosDb(
        inDb.items.map((p) =>
          toCambio({ ...p, changes: [] } as BackendCollabLite)
        )
      );
      setInactivosDbTotal(Number(inDb.total || 0));

      setInactivosBizneo(
        Array.isArray(fromBizneo.items) ? fromBizneo.items : []
      );

      setEjecucionOk(true);
      showDialog("success", "Exportación/sincronización finalizada correctamente.");
    } catch (err) {
      console.error("Error al exportar:", err);
      setEjecucionOk(false);
      showDialog("error", "Ocurrió un error durante la exportación.");
    } finally {
      setLoading(false);
    }
  };

  const totalCambiosColab = agregadosColab.length + actualizadosColab.length;
  const huboCambios = totalCambiosColab > 0;

  const renderList = (empty: boolean, children: React.ReactNode) =>
    empty ? (
      <Typography sx={{ color: "#002338" }}>—  —</Typography>
    ) : (
      <List dense sx={{ bgcolor: "rgba(255,255,255,0.6)", borderRadius: 1 }}>
        {children}
      </List>
    );

  return (
    <Card
      sx={{
        width: "99.9%",
        maxWidth: "1200px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        border: "1px solid #e0e0e0",
        backgroundColor: '#ffffff'
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", m: 2.5 }}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: "#000",
              fontWeight: 500,
              fontFamily: "Poppins, sans-serif",
              fontSize: "24px",
            }}
          >
            Importar Datos de Bizneo
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#000",
              fontWeight: 400,
              fontFamily: "Poppins, sans-serif",
              fontSize: "16px",
            }}
          >
            Muestra los cambios (agregados/actualizados) realizados durante la importación
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          onClick={onExportar}
          disabled={loading}
          sx={{
            borderRadius: "20px",
            backgroundColor: "#23FFDC",
            color: "#002338",
            fontSize: "20px",
            width: "240px",
            fontWeight: 500,
            textTransform: "none",
            height: "50px",
            fontFamily: "Poppins, sans-serif",
            px: 3,
            boxShadow: "none",
            "&:hover": { backgroundColor: "#23FFDC" },
          }}
        >
          {loading ? "Importando..." : "Importar datos"}
        </Button>
      </Box>

      {/* Cuadro de resultados */}
      <Box
        sx={{
          mx: 2,
          mb: 2.5,
          borderRadius: "20px",
          overflow: "hidden",
          backgroundColor: "#ADD8E6",
          border: "1px solid #B0CFE1",
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            {ejecucionOk === true ? (
              <CheckCircleOutlineIcon sx={{ color: "#0b5" }} />
            ) : (
              <InfoOutlinedIcon sx={{ color: "#002338" }} />
            )}
            <Typography variant="h6" sx={{ m: 0, color: "#002338", fontFamily: "Poppins, sans-serif" }}>
              Resultado de la Importación
            </Typography>
          </Box>

          <Typography sx={{ color: "#002338", mb: 2, fontFamily: "Roboto, sans-serif" }}>
            {ejecucionOk === null &&
              "Presioná “Importar datos” para iniciar la sincronización con Bizneo."}
            {ejecucionOk === true &&
              (huboCambios
                ? `Se detectaron ${totalCambiosColab} cambios en colaboradores.`
                : "No hubo cambios (todo estaba actualizado).")}
            {ejecucionOk === false && "La importación falló. Reintentalo más tarde."}
          </Typography>

          <Divider sx={{ borderColor: "#8fb8d1", mb: 2 }} />

          <Grid container spacing={3}>
            {/* Colaboradores */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "#002338", fontFamily: "Poppins, sans-serif", mb: 1 }}
              >
                Colaboradores
              </Typography>

              {/* Agregados Colab */}
              <Accordion
                elevation={0}
                disableGutters
                sx={{ bgcolor: "transparent", border: "1px solid #B0CFE1", borderRadius: 1, mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600, color: "#002338" }}>
                    Agregados ({agregadosColab.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {renderList(
                    agregadosColab.length === 0,
                    agregadosColab.map((p) => (
                      <ListItem key={`added-colab-${p.id}`} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={p.name}
                          secondary={p.email ?? ""}
                          primaryTypographyProps={{ sx: { color: "#001a29" } }}
                          secondaryTypographyProps={{ sx: { color: "#2f4b5c" } }}
                        />
                      </ListItem>
                    ))
                  )}
                </AccordionDetails>
              </Accordion>

              {/* Actualizados Colab */}
              <Accordion
                elevation={0}
                disableGutters
                sx={{ bgcolor: "transparent", border: "1px solid #B0CFE1", borderRadius: 1, mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600, color: "#002338" }}>
                    Actualizados ({actualizadosColab.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {renderList(
                    actualizadosColab.length === 0,
                    actualizadosColab.map((p) => (
                      <ListItem key={`updated-colab-${p.id}`} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={p.name}
                          secondary={
                            (p.email ?? "N/A") +
                            (p.changes && p.changes.length > 0
                              ? ` · Cambios: ${p.changes.join(", ")}`
                              : "")
                          }
                          primaryTypographyProps={{ sx: { color: "#001a29" } }}
                          secondaryTypographyProps={{ sx: { color: "#2f4b5c" } }}
                        />
                      </ListItem>
                    ))
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Inactivos */}
            <Grid item xs={12} md={6} mt={4.5}>
              {/* Inactivos (Bizneo) */}
              <Accordion
                elevation={0}
                disableGutters
                sx={{ bgcolor: "transparent", border: "1px solid #B0CFE1", borderRadius: 1, mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600, color: "#8b0000" }}>
                    Inactivos detectados desde Bizneo ({inactivosBizneo.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {renderList(
                    inactivosBizneo.length === 0,
                    inactivosBizneo.map((s, idx) => (
                      <ListItem key={`inactive-bizneo-${idx}`} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={`Motivo: ${s.reason}`}
                          secondary={
                            s?.hint?.email
                              ? `Email: ${s.hint.email}${s?.hint?.id ? ` · id:${s.hint.id}` : ""}`
                              : s?.hint?.id
                              ? `id:${s.hint.id}`
                              : ""
                          }
                          primaryTypographyProps={{ sx: { color: "#8b0000" } }}
                          secondaryTypographyProps={{ sx: { color: "#2f4b5c" } }}
                        />
                      </ListItem>
                    ))
                  )}
                </AccordionDetails>
              </Accordion>

              {/* Inactivos (Base de datos) */}
              <Accordion
                elevation={0}
                disableGutters
                sx={{ bgcolor: "transparent", border: "1px solid #B0CFE1", borderRadius: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600, color: "#8b0000" }}>
                    Inactivos en base de datos ({inactivosDb.length}
                    {inactivosDbTotal > inactivosDb.length ? ` de ${inactivosDbTotal}` : ""})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {inactivosDb.length === 0 ? (
                    <Typography sx={{ color: "#002338" }}>—  —</Typography>
                  ) : (
                    <List dense sx={{ bgcolor: "rgba(255,255,255,0.6)", borderRadius: 1 }}>
                      {inactivosDb.map((p) => (
                        <ListItem key={`inactive-db-${p.id}`} sx={{ py: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <ListItemText
                            primary={p.name}
                            secondary={p.email ?? ""}
                            primaryTypographyProps={{ sx: { color: "#8b0000" } }}
                            secondaryTypographyProps={{ sx: { color: "#2f4b5c" } }}
                          />
                          <Button
                            variant="contained"
                            size="small"
                            disabled={restoringIds.has(p.id)}
                            onClick={() => onReestablecer(p.id)}
                            startIcon={restoringIds.has(p.id) ? <CircularProgress size={16} /> : undefined}
                            sx={{
                              backgroundColor: "#23FFDC",
                              color: "#002338",
                              fontSize: "12px",
                              fontWeight: 500,
                              textTransform: "none",
                              borderRadius: "12px",
                              minWidth: "100px",
                              height: "32px",
                              fontFamily: "Poppins, sans-serif",
                              boxShadow: "none",
                              "&:hover": { backgroundColor: "#1ee6c9" },
                              "&:disabled": { 
                                backgroundColor: "#e0e0e0", 
                                color: "#9e9e9e" 
                              }
                            }}
                          >
                            {restoringIds.has(p.id) ? "Reestableciendo..." : "Reestablecer"}
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </Card>
  );
};

export default ExportData;
