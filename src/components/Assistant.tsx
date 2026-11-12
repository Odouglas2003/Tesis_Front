"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import {
  Box, Button, Dialog,
  Fab, IconButton, Paper, TextField, Tooltip, Typography,
} from "@mui/material";
import {
  Close, DeleteOutline, History, Mic, MicOff, Send, VolumeOff, VolumeUp,
} from "@mui/icons-material";
import useSpeechSynthesis from "@/app/hooks/useSpeechSynthesis";
import api from "@/services/http";
import { AUTH_LOGO_SRC } from "@/theme/appPalette";

interface Message { autor: "user" | "assistant"; texto: string; }
interface JarvisAction {
  type: "create_vacancy" | "create_project" | "assign_collaborator" |
    "remove_assignment" | "close_vacancy" | "update_project" | "create_notification" |
    "create_collaborator";
  title: string;
  payload: Record<string, unknown>;
}
interface ActionHistoryItem {
  _id: string;
  title: string;
  status: "success" | "error";
  createdAt: string;
}
interface RecognitionEvent { results: ArrayLike<{ 0: { transcript: string } }>; }
interface RecognitionErrorEvent { error: string; }
interface Recognition {
  lang: string; interimResults: boolean; continuous: boolean;
  start(): void; stop(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onend: (() => void) | null; onerror: ((event: RecognitionErrorEvent) => void) | null;
}
type RecognitionConstructor = new () => Recognition;

const welcomeMessage: Message = {
  autor: "assistant",
  texto: "¡Hola! Soy JARVIS. Tocá el micrófono y conversemos. ¿En qué te ayudo?",
};

const actionLabels: Record<string, string> = {
  vacancieName: "Vacante", time: "Horas", orderDate: "Fecha de pedido",
  startDate: "Inicio", endDate: "Fin", seniority: "Seniority",
  description: "Descripción", name: "Nombre", client: "Cliente",
  managerName: "Manager", status: "Estado", projectType: "Tipo",
  category: "Categoría", budget: "Presupuesto", rol: "Rol",
  horasAsignadas: "Horas asignadas", tecnologias: "Tecnologías",
  changes: "Cambios", recipients: "Destinatarios", alertLevel: "Nivel",
  message: "Mensaje", first_name: "Nombre", last_name: "Apellido",
  email: "Email", dni: "DNI", jornada: "Jornada",
  start_contrato: "Inicio de contrato", fin_contrato: "Fin de contrato",
};

// Limpia markdown que pueda devolver el modelo (negritas, títulos, imágenes, links) para mostrarlo y leerlo en voz alta.
const toPlainText = (text: string) =>
  text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[*]\s+/gm, "- ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const visibleActionFields = (payload: Record<string, unknown>) =>
  Object.entries(payload).filter(([key, value]) =>
    actionLabels[key] && value !== "" && value !== null && value !== undefined
  );

const JARVIS = {
  bg: "#0B1E30",
  panel: "#102A42",
  core: "#0E2740",
  teal: "#72E6D9",
  tealSoft: "#9FE9E0",
  blue: "#2E8BE0",
  text: "#E6F4F7",
  muted: "#9FB9C9",
  line: "rgba(114,230,217,0.25)",
  font: "'Plus Jakarta Sans', system-ui, sans-serif",
};

const jarvisKeyframes = {
  "@keyframes tmSpin": { to: { transform: "rotate(360deg)" } },
  "@keyframes tmSpinRev": { to: { transform: "rotate(-360deg)" } },
  "@keyframes tmPulse": { "0%": { transform: "scale(1)", opacity: 0.7 }, "100%": { transform: "scale(1.7)", opacity: 0 } },
  "@keyframes tmBreathe": { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.07)" } },
  "@keyframes tmWave": { "0%,100%": { transform: "scaleY(.25)" }, "50%": { transform: "scaleY(1)" } },
  "@media (prefers-reduced-motion: reduce)": { "& *": { animation: "none !important" } },
};

// Esfera de JARVIS: logo de TeamMatch en el centro con anillos en movimiento.
function JarvisOrb({ active, listening, speaking, compact = false, onClick }: { active: boolean; listening: boolean; speaking: boolean; compact?: boolean; onClick?: () => void }) {
  const size = compact ? 68 : 320;
  const accent = listening ? JARVIS.teal : speaking ? JARVIS.tealSoft : JARVIS.teal;
  const speed = listening || speaking ? 0.55 : active ? 0.8 : 1;
  const ring = { position: "absolute", borderRadius: "50%", boxSizing: "border-box" } as const;
  const coreSize = compact ? 54 : 168;
  return <Box
    component={onClick ? "button" : "span"}
    type={onClick ? "button" : undefined}
    onClick={onClick}
    aria-label={onClick ? "Activar conversación con JARVIS" : undefined}
    sx={{ ...jarvisKeyframes, position: "relative", width: size, height: size, flexShrink: 0, border: 0, p: 0, borderRadius: "50%", cursor: onClick ? "pointer" : "inherit", display: "flex", alignItems: "center", justifyContent: "center", background: compact ? "transparent" : "radial-gradient(circle, rgba(46,139,224,0.22) 0%, rgba(11,30,48,0) 68%)" }}
  >
    {!compact && <Box component="span" sx={{ ...ring, inset: 6, border: "1px dashed rgba(114,230,217,0.45)", animation: `tmSpin ${40 * speed}s linear infinite` }}>
      <Box component="span" sx={{ position: "absolute", top: -5, left: "50%", width: 9, height: 9, ml: "-5px", borderRadius: "50%", bgcolor: accent, boxShadow: `0 0 12px ${accent}` }} />
    </Box>}
    <Box component="span" sx={{ ...ring, inset: compact ? 0 : 30, border: "2px solid transparent", borderTopColor: accent, borderBottomColor: compact ? "rgba(46,139,224,0.55)" : "rgba(114,230,217,0.35)", animation: `tmSpin ${(compact ? 5 : 6) * speed}s linear infinite` }} />
    {!compact && <Box component="span" sx={{ ...ring, inset: 50, border: "2px solid transparent", borderLeftColor: JARVIS.blue, borderRightColor: "rgba(46,139,224,0.4)", animation: `tmSpinRev ${9 * speed}s linear infinite` }} />}
    <Box component="span" sx={{ ...ring, inset: compact ? 6 : 72, border: `1px solid ${compact ? JARVIS.blue : accent}`, animation: `tmPulse ${active ? 1.4 : 2.4}s ease-out infinite` }} />
    <Box component="span" sx={{ position: "relative", width: coreSize, height: coreSize, borderRadius: "50%", bgcolor: JARVIS.core, border: "1px solid rgba(114,230,217,0.6)", boxShadow: compact ? "0 6px 20px rgba(11,30,48,0.35)" : "0 0 40px rgba(46,139,224,0.45), inset 0 0 24px rgba(114,230,217,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box component="img" src={AUTH_LOGO_SRC} alt={compact ? "" : "TeamMatch"} sx={{ width: compact ? 38 : 116, height: compact ? 38 : 116, objectFit: "contain", animation: `tmBreathe ${active ? 1.6 : 3.2}s ease-in-out infinite` }} />
    </Box>
  </Box>;
}

function VoiceWave({ active }: { active: boolean }) {
  return <Box aria-hidden sx={{ ...jarvisKeyframes, display: "flex", alignItems: "center", gap: "5px", height: 32 }}>
    {[0, 0.15, 0.3, 0.45, 0.6, 0.45, 0.3, 0.15, 0].map((delay, index) => <Box key={index} component="span" sx={{ width: 4, height: 28, borderRadius: "2px", bgcolor: JARVIS.teal, opacity: active ? 1 : 0.35, transformOrigin: "center", transform: "scaleY(.25)", animation: active ? `tmWave 1.1s ease-in-out ${delay}s infinite` : "none" }} />)}
  </Box>;
}

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationMode, setConversationMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [pendingAction, setPendingAction] = useState<JarvisAction | null>(null);
  const [executingAction, setExecutingAction] = useState(false);
  const [showActionHistory, setShowActionHistory] = useState(false);
  const [actionHistory, setActionHistory] = useState<ActionHistoryItem[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [engineState, setEngineState] = useState<"unknown" | "starting" | "ready">("unknown");
  const engineReadyRef = useRef(false);
  const engineWaitRef = useRef<Promise<boolean> | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const heardSpeechRef = useRef(false);
  const conversationRef = useRef(false);
  const sendRef = useRef<(text: string) => void>(() => undefined);
  const { speak, speaking, cancel, supported: voiceSupported } = useSpeechSynthesis({ lang: "es-AR" });

  // El motor de IA corre en el plan gratuito de Render y se apaga sin uso.
  // Lo despertamos y esperamos a que responda antes de enviar mensajes.
  const waitForEngine = (): Promise<boolean> => {
    if (engineReadyRef.current) return Promise.resolve(true);
    if (engineWaitRef.current) return engineWaitRef.current;
    setEngineState("starting");
    const run = async () => {
      const deadline = Date.now() + 240_000;
      let lastWake = 0;
      while (Date.now() < deadline) {
        try {
          const response = await api.get("/api/ia/status", { timeout: 15_000 });
          if (response.data?.ready) {
            engineReadyRef.current = true;
            setEngineState("ready");
            return true;
          }
          // Render solo despierta el motor gratuito con visitas desde un navegador.
          const wakeUrl = response.data?.wakeUrl;
          if (wakeUrl && Date.now() - lastWake > 20_000) {
            lastWake = Date.now();
            void fetch(wakeUrl, { mode: "no-cors", cache: "no-store" }).catch(() => undefined);
          }
        } catch {
          /* el backend también puede estar despertando: reintentamos */
        }
        await new Promise((resolve) => setTimeout(resolve, 4_000));
      }
      setEngineState("unknown");
      return false;
    };
    engineWaitRef.current = run().finally(() => { engineWaitRef.current = null; });
    return engineWaitRef.current;
  };

  const markEngineAsleep = () => {
    engineReadyRef.current = false;
    setEngineState("unknown");
  };

  const setConversation = (active: boolean) => {
    conversationRef.current = active;
    setConversationMode(active);
  };

  const startListening = () => {
    if (!recognitionRef.current || !conversationRef.current) return;
    try {
      heardSpeechRef.current = false;
      setIsListening(true);
      recognitionRef.current.start();
    } catch {
      setIsListening(false);
    }
  };

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const browser = window as typeof window & {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    };
    const RecognitionApi = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!RecognitionApi) return;

    const recognition = new RecognitionApi();
    recognition.lang = "es-AR";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      heardSpeechRef.current = Boolean(transcript);
      setIsListening(false);
      setUserInput(transcript);
      if (transcript) sendRef.current(transcript);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (conversationRef.current && !heardSpeechRef.current) {
        setTimeout(startListening, 500);
      }
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error !== "no-speech") setConversation(false);
    };
    recognitionRef.current = recognition;
    setSpeechSupported(true);
    return () => recognition.stop();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("jarvis_conversation_id");
    const id = stored || crypto.randomUUID();
    if (!stored) localStorage.setItem("jarvis_conversation_id", id);
    setConversationId(id);
  }, []);

  useEffect(() => {
    if (open) void waitForEngine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !conversationId) return;
    void Promise.all([
      api.get("/api/ia/chat/history", { params: { conversationId } }),
      api.get("/api/ia/actions/history", { params: { conversationId } }),
    ]).then(([chatResponse, actionsResponse]) => {
      const storedMessages = (chatResponse.data?.messages || []).map((message: { role: string; content: string }) => ({
        autor: message.role === "assistant" ? "assistant" as const : "user" as const,
        texto: message.content,
      }));
      if (storedMessages.length) setMessages([welcomeMessage, ...storedMessages]);
      setActionHistory(actionsResponse.data?.actions || []);
    }).catch((error) => console.error("No se pudo cargar la memoria de JARVIS:", error));
  }, [open, conversationId]);

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? userInput).trim();
    if (!text || isLoading) return;
    const history = messages.slice(1);
    setMessages((current) => [...current, { autor: "user", texto: text }]);
    setUserInput("");
    setPendingAction(null);
    setIsLoading(true);

    const postChat = () => api.post("/api/ia/chat", { message: text, history, conversationId });

    try {
      if (!(await waitForEngine())) {
        throw new Error("El motor de IA no respondió a tiempo.");
      }
      let response;
      try {
        response = await postChat();
      } catch (error) {
        const statusCode = (error as { response?: { status?: number } }).response?.status;
        const engineAsleep = !statusCode || statusCode === 502 || statusCode === 503 || statusCode === 504;
        if (!engineAsleep) throw error;
        markEngineAsleep();
        if (!(await waitForEngine())) throw error;
        response = await postChat();
      }
      const data = response.data;
      const answer = toPlainText(data.answer || "No pude generar una respuesta.");
      setMessages((current) => [...current, { autor: "assistant", texto: answer }]);
      setPendingAction(data.action || null);

      if (voiceEnabled) {
        speak(answer, () => setTimeout(startListening, 350));
      } else {
        setTimeout(startListening, 350);
      }
    } catch (error) {
      console.error("Error al hablar con JARVIS:", error);
      setMessages((current) => [...current, {
        autor: "assistant", texto: "No pude conectarme en este momento. Intentá nuevamente.",
      }]);
      setConversation(false);
    } finally {
      setIsLoading(false);
    }
  };
  sendRef.current = sendMessage;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage();
  };

  const toggleConversation = () => {
    if (!recognitionRef.current) return;
    if (conversationRef.current) {
      setConversation(false);
      recognitionRef.current.stop();
      cancel();
      return;
    }
    cancel();
    setConversation(true);
    conversationRef.current = true;
    startListening();
  };

  const activateJarvis = () => {
    setOpen(true);
    setConversation(true);
    conversationRef.current = true;
    const greeting = "Hola, ¿cómo estás? Soy JARVIS. ¿En qué puedo ayudarte?";
    if (voiceEnabled && voiceSupported) {
      speak(greeting, () => setTimeout(startListening, 300));
    } else {
      setTimeout(startListening, 300);
    }
  };

  const closeJarvis = () => {
    setConversation(false);
    recognitionRef.current?.stop();
    cancel();
    setOpen(false);
  };

  const clearConversation = () => {
    setConversation(false);
    recognitionRef.current?.stop();
    cancel();
    setMessages([welcomeMessage]);
    setUserInput("");
    setPendingAction(null);
    if (conversationId) {
      void api.delete("/api/ia/chat/history", { params: { conversationId } });
    }
  };

  const executeAction = async () => {
    if (!pendingAction || executingAction) return;
    setExecutingAction(true);
    cancel();
    try {
      const response = await api.post("/api/ia/actions/execute", { action: pendingAction, conversationId });
      const text = response.data?.message || "Acción realizada correctamente.";
      setMessages((current) => [...current, { autor: "assistant", texto: text }]);
      setPendingAction(null);
      void api.get("/api/ia/actions/history", { params: { conversationId } })
        .then((result) => setActionHistory(result.data?.actions || []));
      if (voiceEnabled) speak(text, () => setTimeout(startListening, 350));
    } catch (error) {
      console.error("Error ejecutando acción de JARVIS:", error);
      const detail = (error as { response?: { data?: { error?: string; message?: string } } })
        .response?.data;
      const errorText = detail?.error || detail?.message || "No pude realizar la acción. Revisá los datos e intentá nuevamente.";
      setMessages((current) => [...current, { autor: "assistant", texto: errorText }]);
      setConversation(false);
    } finally {
      setExecutingAction(false);
    }
  };

  const engineStarting = engineState === "starting";
  const status = engineStarting ? "Iniciando asistente…" : isListening ? "Escuchando" : isLoading ? "Pensando" : speaking ? "Hablando" : conversationMode ? "Listo para continuar" : "Asistente inteligente";
  const active = isListening || isLoading || speaking || engineStarting;

  const lastMessages = messages.slice(-2);

  return <>
    <Tooltip title="Activar JARVIS" placement="left">
      <Fab onClick={activateJarvis} aria-label="Abrir JARVIS" sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300, width: 68, height: 68, bgcolor: "transparent", boxShadow: "none", "&:hover": { bgcolor: "transparent" }, "&:active": { boxShadow: "none" } }}>
        <JarvisOrb compact active={false} listening={false} speaking={false} />
      </Fab>
    </Tooltip>

    <Dialog open={open} onClose={closeJarvis} fullScreen PaperProps={{ sx: { borderRadius: 0, border: 0, bgcolor: JARVIS.bg, color: JARVIS.text, fontFamily: JARVIS.font, backgroundImage: "linear-gradient(180deg, #081726 0%, #0B1E30 45%, #0D2A44 100%)", overflow: "hidden", "& .MuiTypography-root, & .MuiInputBase-root, & .MuiButton-root": { fontFamily: "inherit" } } }}>
      <Box sx={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 0.5, px: { xs: 2, md: 3 }, py: 1.5, borderBottom: "1px solid rgba(114,230,217,0.18)" }}>
        <Box sx={{ flexGrow: 1 }}><Typography sx={{ letterSpacing: ".24em", fontWeight: 700, fontSize: "1rem", color: JARVIS.text }}>JARVIS</Typography><Typography sx={{ color: JARVIS.muted, fontSize: ".75rem" }}>Asistente de TeamMatch</Typography></Box>
        <Tooltip title={voiceEnabled ? "Silenciar voz" : "Activar voz"}><IconButton aria-label={voiceEnabled ? "Silenciar voz" : "Activar voz"} onClick={() => { cancel(); setVoiceEnabled((value) => !value); }} sx={{ color: JARVIS.tealSoft, width: 44, height: 44 }}>{voiceEnabled ? <VolumeUp /> : <VolumeOff />}</IconButton></Tooltip>
        <Tooltip title="Historial"><IconButton aria-label="Historial de acciones" onClick={() => setShowActionHistory((value) => !value)} sx={{ color: JARVIS.tealSoft, width: 44, height: 44 }}><History /></IconButton></Tooltip>
        <Tooltip title="Nueva conversación"><IconButton aria-label="Nueva conversación" onClick={clearConversation} sx={{ color: JARVIS.tealSoft, width: 44, height: 44 }}><DeleteOutline /></IconButton></Tooltip>
        <IconButton aria-label="Cerrar JARVIS" onClick={closeJarvis} sx={{ color: JARVIS.tealSoft, width: 44, height: 44 }}><Close /></IconButton>
      </Box>

      <Box sx={{ position: "relative", zIndex: 1, flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 2, pt: 2, pb: 12 }}>
        <JarvisOrb active={active || conversationMode} listening={isListening} speaking={speaking} onClick={toggleConversation} />
        <Box sx={{ mt: 1.5 }}><VoiceWave active={isListening || speaking} /></Box>
        <Typography sx={{ mt: 1.25, color: JARVIS.teal, letterSpacing: ".28em", fontWeight: 700, fontSize: ".8125rem", textTransform: "uppercase" }}>{status}</Typography>
        <Typography sx={{ mt: 0.5, color: JARVIS.muted, fontSize: ".8125rem", textAlign: "center" }}>{engineStarting ? "Despertando el motor de IA. Puede tardar hasta un minuto; podés escribir igual y te respondo apenas esté listo." : conversationMode ? "Tocá el logo para finalizar" : "Tocá el logo para comenzar a hablar"}</Typography>

        <Box ref={chatRef} sx={{ mt: 2.5, width: "min(760px, 92vw)", maxHeight: 135, overflowY: "auto", textAlign: "center" }}>
          {lastMessages.map((message, index) => <Typography key={index} sx={{ mb: 1, color: message.autor === "assistant" ? JARVIS.text : JARVIS.muted, fontSize: message.autor === "assistant" ? "1.0625rem" : ".875rem", lineHeight: 1.55, whiteSpace: "pre-line", textAlign: "left" }}>{message.autor === "assistant" ? toPlainText(message.texto) : message.texto}</Typography>)}
        </Box>

        {pendingAction && <Box component="section" aria-label="Acción pendiente" sx={{ mt: 2, width: "min(560px, 92vw)", p: 2.5, borderRadius: "12px", bgcolor: JARVIS.panel, border: "1px solid rgba(114,230,217,0.35)", display: "flex", flexDirection: "column", gap: 1.75 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
            <Typography component="h2" sx={{ fontWeight: 700, fontSize: "1rem" }}>{pendingAction.title}</Typography>
            <Box component="span" sx={{ px: 1.25, py: 0.4, borderRadius: "999px", bgcolor: "rgba(114,230,217,0.16)", color: JARVIS.tealSoft, fontSize: ".75rem", fontWeight: 700, whiteSpace: "nowrap" }}>Esperando confirmación</Box>
          </Box>
          <Box component="dl" sx={{ m: 0, display: "flex", flexDirection: "column", gap: 1 }}>
            {visibleActionFields(pendingAction.payload).map(([key, value]) => <Box key={key} sx={{ display: "flex", justifyContent: "space-between", gap: 2, fontSize: ".875rem" }}>
              <Box component="dt" sx={{ color: JARVIS.muted }}>{actionLabels[key]}</Box>
              <Box component="dd" sx={{ m: 0, fontWeight: 600, textAlign: "right" }}>{Array.isArray(value) ? value.join(", ") : typeof value === "object" ? Object.entries(value as Record<string, unknown>).map(([field, content]) => `${actionLabels[field] || field}: ${String(content)}`).join(" · ") : String(value)}</Box>
            </Box>)}
          </Box>
          <Box sx={{ display: "flex", gap: 1.25 }}>
            <Button onClick={() => void executeAction()} disabled={executingAction} sx={{ flex: 1, minHeight: 44, borderRadius: "8px", bgcolor: JARVIS.teal, color: JARVIS.bg, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: JARVIS.tealSoft }, "&.Mui-disabled": { bgcolor: "rgba(114,230,217,0.4)", color: JARVIS.bg } }}>{executingAction ? "Procesando..." : "Confirmar"}</Button>
            <Button onClick={() => setPendingAction(null)} disabled={executingAction} sx={{ flex: 1, minHeight: 44, borderRadius: "8px", border: "1px solid rgba(159,233,224,0.5)", color: JARVIS.text, fontWeight: 600, textTransform: "none" }}>Cancelar</Button>
          </Box>
        </Box>}
      </Box>

      {showActionHistory && <Paper sx={{ position: "absolute", zIndex: 5, top: 80, right: 24, width: "min(380px, calc(100vw - 48px))", maxHeight: "60vh", overflow: "auto", p: 2, borderRadius: "12px", bgcolor: JARVIS.panel, color: JARVIS.text, border: `1px solid ${JARVIS.line}`, boxShadow: "0 12px 32px rgba(0,0,0,0.35)" }}><Typography fontWeight={700} sx={{ mb: 1 }}>Historial de acciones</Typography>{actionHistory.length === 0 && <Typography variant="body2" sx={{ color: JARVIS.muted }}>Todavía no hay acciones.</Typography>}{actionHistory.map((item) => <Box key={item._id} sx={{ display: "flex", justifyContent: "space-between", gap: 1, py: 1, borderBottom: "1px solid rgba(114,230,217,0.12)" }}><Typography variant="body2">{item.title}</Typography><Typography variant="caption" sx={{ fontWeight: 700, color: item.status === "success" ? JARVIS.teal : "#FFB4A3" }}>{item.status === "success" ? "OK" : "Error"}</Typography></Box>)}</Paper>}

      <Box component="form" onSubmit={handleSubmit} sx={{ position: "absolute", zIndex: 4, bottom: 20, left: "50%", transform: "translateX(-50%)", width: "min(720px, calc(100vw - 32px))", display: "flex", alignItems: "center", gap: 0.5, p: 0.75, borderRadius: "12px", bgcolor: JARVIS.panel, border: `1px solid ${JARVIS.line}` }}>
        <IconButton aria-label={conversationMode ? "Pausar micrófono" : "Activar micrófono"} onClick={toggleConversation} disabled={!speechSupported} sx={{ width: 44, height: 44, color: conversationMode ? "#FFB4A3" : JARVIS.tealSoft, "&.Mui-disabled": { color: "rgba(159,185,201,0.4)" } }}>{conversationMode ? <MicOff /> : <Mic />}</IconButton>
        <TextField fullWidth variant="standard" placeholder="Escribí o hablá con JARVIS..." value={userInput} onChange={(event) => setUserInput(event.target.value)} disabled={isLoading} autoComplete="off" inputProps={{ "aria-label": "Mensaje para JARVIS" }} InputProps={{ disableUnderline: true, sx: { color: JARVIS.text, px: 1, fontSize: ".9375rem", "& input::placeholder": { color: JARVIS.muted, opacity: 1 } } }} />
        <IconButton type="submit" aria-label="Enviar" disabled={!userInput.trim() || isLoading} sx={{ width: 44, height: 44, color: JARVIS.tealSoft, "&.Mui-disabled": { color: "rgba(159,185,201,0.4)" } }}><Send /></IconButton>
      </Box>
    </Dialog>
  </>;
}
