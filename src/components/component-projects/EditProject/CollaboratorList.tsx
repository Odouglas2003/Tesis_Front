"use client";
import { Box, Typography, Card, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { AssignedPersons, Employee } from "@/types/interface";
import {
  removeAssignedPerson,
  updateAssignedPersonToProject,
  updateCollaboratorServiceedit,
  getColabById,
  getHistoryBlocks,       // 👈 nuevo
  recordDailyHistory,     // 👈 nuevo
} from "@/services/api";
import React, { useState } from "react";
import ModalComponent from "@/components/message/MessageModal";
import { useAuthRole } from "@/app/hooks/useAuthRole";

interface CollaboratorListProps {
  collaborator: AssignedPersons[];
  onDelete: (id: string) => void;
  projectId: string;
  onUpdateTime: (colabId: string, newHoras: number) => void;
}

export default function CollaboratorList({
  collaborator,
  onDelete,
  projectId,
  onUpdateTime,
}: CollaboratorListProps) {
  const { currentUserId } = useAuthRole();

  const [editing, setEditing] = useState<{ [projectId: string]: boolean }>({});
  const [horas, setHoras] = useState<{ [id: string]: number }>(
    Object.fromEntries(collaborator.map((c) => [c.id, c.horasAsignadas]))
  );

  React.useEffect(() => {
    setHoras(Object.fromEntries(collaborator.map((c) => [c.id, c.horasAsignadas])));
  }, [collaborator]);

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

  if (!collaborator.length) return null;

  const colaboradoresPorRol: { [rol: string]: AssignedPersons[] } = {};
  collaborator
    .filter((colab) => colab.rol.toLowerCase() !== "manager")
    .forEach((colab) => {
      if (!colaboradoresPorRol[colab.rol]) colaboradoresPorRol[colab.rol] = [];
      colaboradoresPorRol[colab.rol].push(colab);
    });

  // === helpers ===
  const makeDateKey = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const toSnap = (p: {
    projectId: string;
    projectName?: string;
    role?: string | null;
    hoursAssigned?: number | null;
  }) => ({
    projectId: p.projectId,
    projectName: p.projectName ?? "",
    role: p.role ?? null,
    hoursAssigned: typeof p.hoursAssigned === "number" ? p.hoursAssigned : null,
  });

  const readTodayPreviousSnaps = async (collabId: string): Promise<{
    projectId: string;
    projectName: string;
    role: string | null;
    hoursAssigned: number | null;
  }[]> => {
    const todayKey = makeDateKey();
    try {
      const hist = await getHistoryBlocks(collabId);
      const history = Array.isArray(hist?.history) ? hist.history : [];
      const todayBlock = [...history].reverse().find((b: { dateKey: string }) => b.dateKey === todayKey);
      if (todayBlock) {
        return (todayBlock.next ?? []).map((s: {
          projectId: string;
          projectName?: string;
          role?: string;
          hoursAssigned?: number;
        }) => ({
          projectId: s.projectId,
          projectName: s.projectName ?? "",
          role: s.role ?? null,
          hoursAssigned: typeof s.hoursAssigned === "number" ? s.hoursAssigned : null,
        }));
      }
      const lastBlock = [...history].reverse()[0];
      if (lastBlock) {
        return (lastBlock.next ?? []).map((s: {
          projectId: string;
          projectName?: string;
          role?: string;
          hoursAssigned?: number;
        }) => ({
          projectId: s.projectId,
          projectName: s.projectName ?? "",
          role: s.role ?? null,
          hoursAssigned: typeof s.hoursAssigned === "number" ? s.hoursAssigned : null,
        }));
      }
    } catch {
      // fallback
    }
    return [];
  };

  // === borrar colaborador + historial ===
  const handleDelete = async (colabId: string) => {
    try {
      const colab = collaborator.find((c) => c.id === colabId);
      const todayKey = makeDateKey();

      // 1️⃣ Obtener estado previo
      let previousSnaps = await readTodayPreviousSnaps(colabId);
      if (!previousSnaps.length && colab) {
        previousSnaps = [
          {
            projectId,
            projectName: "",
            role: colab.rol,
            hoursAssigned: colab.horasAsignadas,
          },
        ];
      }

      // 2️⃣ Ejecutar eliminación
      await removeAssignedPerson(projectId, colabId);
      onDelete(colabId);

      // 3️⃣ Calcular siguiente estado (sin el proyecto eliminado)
      interface PreviousSnap {
        projectId: string;
        projectName?: string;
        role?: string;
        hoursAssigned?: number;
      }

      const nextSnaps: PreviousSnap[] = (previousSnaps as PreviousSnap[]).filter(
        (s: PreviousSnap) => String(s.projectId) !== String(projectId)
      );

      // 4️⃣ Registrar historial (solo back, no mostrar)
      try {
        await recordDailyHistory(colabId, {
          userId: currentUserId || undefined,
          dateKey: todayKey,
          previous: previousSnaps.map(toSnap),
          next: nextSnaps.map(toSnap),
        });
        console.log("✅ Historial diario actualizado (eliminación)");
      } catch (err) {
        console.warn("⚠️ No se pudo guardar historial diario:", err);
      }

      showDialog(
        "success",
        `Colaborador "${colab?.name ?? ""}" desvinculado correctamente.`
      );
    } catch (error: unknown) {
      showDialog(
        "error",
        (error as { message: string })?.message ||
          "No se pudo desvincular al colaborador. Intenta nuevamente."
      );
    }
  };

  const handleHorasChange = (id: string, value: string) => {
    const num = Number(value);
    if (!isNaN(num)) {
      setHoras((prev) => ({ ...prev, [id]: num }));
    }
  };

  const handleHorasBlur = async (colab: AssignedPersons) => {
    setEditing((prev) => ({ ...prev, [colab.id]: false }));
    if (horas[colab.id] !== colab.horasAsignadas) {
      const oldAssigned = colab.horasAsignadas;
      const newAssigned = horas[colab.id];
      try {
        await updateAssignedPersonToProject(projectId, colab.id, {
          name: colab.name,
          rol: colab.rol,
          seniority: colab.seniority,
          tecnologias: colab.tecnologias,
          horasAsignadas: horas[colab.id],
        });
        onUpdateTime(colab.id, horas[colab.id]);
        const result = await actualizarHorasGlobales(
          colab.id,
          oldAssigned,
          newAssigned
        );
        if (result.status !== "success") {
          throw new Error("Error al actualizar horas globales");
        } else {
          showDialog(
            "success",
            `Horas del colaborador "${colab.name}" actualizadas correctamente.`
          );
        }
      } catch (error: unknown) {
        showDialog(
          "error",
          (error as { message: string })?.message ||
            "No se pudo actualizar las horas. Intenta nuevamente."
        );
        setHoras((prev) => ({ ...prev, [colab.id]: colab.horasAsignadas }));
      }
    }
  };

  const actualizarHorasGlobales = async (
    collaboratorId: string,
    oldAssigned: number,
    newAssigned: number
  ) => {
    const result = await getColabById(collaboratorId);
    if (result.status === "success") {
      const collaboratorData = result.collaborator as Employee;
      const currentGlobal = Number(collaboratorData.horasAsignadas ?? 0);
      const diff = newAssigned - oldAssigned;
      const updatedGlobal = currentGlobal + diff;

      const proyectosParsed = (collaboratorData?.Proyectos ?? []).map(
        (p): {
          projectId: string;
          rol: string;
          tecnologias: string;
          horasAsignadas: number;
          seniority: string;
        } => {
          if (typeof p === "string") {
            return {
              projectId: p,
              rol: "",
              tecnologias: "",
              horasAsignadas: 0,
              seniority: "",
            };
          }
          const proj = p as unknown as Record<string, unknown>;
          let pid = "";
          const projIdField = proj["projectId"];
          if (typeof projIdField === "string") pid = projIdField;
          else if (typeof projIdField === "object" && projIdField !== null) {
            const obj = projIdField as Record<string, unknown>;
            pid = String(obj.id ?? obj._id ?? obj.projectId ?? "");
          } else {
            pid = String(projIdField ?? "");
          }
          const rol = String(proj["rol"] ?? "");

          // normalize tecnologias to a single string (could be array or string)
          const tecnologiasField = proj["tecnologias"];
          let tecnologias = "";
          if (Array.isArray(tecnologiasField)) {
            tecnologias = (tecnologiasField as unknown as string[]).join(", ");
          } else {
            tecnologias = String(tecnologiasField ?? "");
          }

          const horasAsignadas = Number(proj["horasAsignadas"] ?? 0);
          const seniority = String(proj["seniority"] ?? "");

          return {
            projectId: pid,
            rol,
            tecnologias,
            horasAsignadas,
            seniority,
          };
        }
      );

      return await updateCollaboratorServiceedit(collaboratorId, {
        Proyectos: proyectosParsed,
        dni: Number(collaboratorData?.dni ?? 0),
        horasAsignadas: updatedGlobal,
        roles: collaboratorData?.roles ?? [],
        created_at: collaboratorData?.created_at
          ? new Date(collaboratorData.created_at)
          : null,
        fin_contrato: collaboratorData?.fin_contrato
          ? new Date(collaboratorData.fin_contrato)
          : null,
        image: collaboratorData?.image ?? null,
        last_edited_by: collaboratorData?.last_edited_by ?? "",
        last_edited_on: new Date().toISOString(),
      });
    }
    return result;
  };

  return (
    <Box>
      {Object.entries(colaboradoresPorRol).map(([rol, colaboradores]) => (
        <Box key={rol} sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "18px",
              color: "#1a73e8",
              mb: 1,
            }}
          >
            {rol}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {colaboradores.map((v) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={v.id}>
                <Card
                  sx={{
                    p: 2,
                    minWidth: "289px",
                    maxWidth: "400px",
                    width: "100%",
                    height: "162px",
                    borderRadius: "10px",
                    bgcolor: "#CDCDCD",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Info label="Colaborador" value={v.name} />
                  <Info label="Tecnología" value={v.tecnologias.join(", ")} multiline />

                  <Stack direction="row" gap={1} mb={"0.5px"} alignItems="center">
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "16px",
                        color: "#002338",
                      }}
                    >
                      Horas asignadas:
                    </Typography>
                    {editing[v.id] ? (
                      <input
                        type="number"
                        value={horas[v.id]}
                        min={0}
                        style={{
                          fontFamily: "Poppins",
                          fontWeight: 300,
                          fontSize: "16px",
                          color: "#002338",
                          width: "60px",
                        }}
                        autoFocus
                        onChange={(e) => handleHorasChange(v.id, e.target.value)}
                        onBlur={() => handleHorasBlur(v)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: 300,
                          fontSize: "16px",
                          color: "#002338",
                        }}
                      >
                        {horas[v.id]}
                      </Typography>
                    )}
                  </Stack>

                  <Stack
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      right: 16,
                      zIndex: 2,
                      background: "transparent",
                    }}
                    direction="row"
                    alignItems={"center"}
                    justifyContent={"flex-end"}
                    gap={1}
                  >
                    {editing[v.id] ? (
                      <SaveIcon
                        sx={{ color: "#000", fontSize: "24px", cursor: "pointer" }}
                        titleAccess="Guardar horas"
                        onClick={() => handleHorasBlur(v)}
                      />
                    ) : (
                      <EditIcon
                        sx={{ color: "#000", fontSize: "24px", cursor: "pointer" }}
                        titleAccess="Editar horas"
                        onClick={() => setEditing((prev) => ({ ...prev, [v.id]: true }))}
                      />
                    )}
                    <DeleteIcon
                      fontSize="inherit"
                      sx={{ color: "#D61010", width: "24px", height: "24px", cursor: "pointer" }}
                      onClick={() => handleDelete(v.id)}
                    />
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </Box>
  );
}

function Info({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <Stack direction="row" gap={1} mb={"0.5px"}>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "16px",
          color: "#002338",
          flexShrink: 0,
        }}
      >
        {label}:
      </Typography>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 300,
          fontSize: "16px",
          color: "#002338",
          wordBreak: multiline ? "break-word" : "normal",
          overflow: "hidden",
          textOverflow: multiline ? "initial" : "ellipsis",
          whiteSpace: multiline ? "normal" : "nowrap",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
