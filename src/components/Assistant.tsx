"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import {
  Alert, Box, Button, Dialog,
  Fab, IconButton, Paper, TextField, Tooltip, Typography,
} from "@mui/material";
import {
  Close, DeleteOutline, History, Mic, MicOff, Send, VolumeOff, VolumeUp,
} from "@mui/icons-material";
import useSpeechSynthesis from "@/app/hooks/useSpeechSynthesis";
import api from "@/services/http";

interface Message { autor: "user" | "assistant"; texto: string; }
interface JarvisAction {
  type: "create_vacancy" | "create_project" | "assign_collaborator" |
    "remove_assignment" | "close_vacancy" | "update_project" | "create_notification";
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
  message: "Mensaje",
};

const visibleActionFields = (payload: Record<string, unknown>) =>
  Object.entries(payload).filter(([key, value]) =>
    actionLabels[key] && value !== "" && value !== null && value !== undefined
  );

const orbNodes = [
  [50, 12], [28, 20], [71, 21], [15, 38], [40, 35], [61, 39], [84, 40],
  [25, 55], [50, 53], [74, 57], [13, 68], [37, 72], [61, 70], [86, 68],
  [28, 86], [51, 88], [72, 84], [48, 24], [35, 48], [65, 51],
];
const orbLinks = [[0,1],[0,2],[1,3],[1,4],[2,4],[2,6],[3,4],[3,7],[4,5],[4,7],[4,8],[5,6],[5,8],[5,9],[6,9],[7,8],[7,10],[7,11],[8,9],[8,11],[8,12],[9,12],[9,13],[10,11],[11,12],[11,14],[11,15],[12,13],[12,15],[12,16],[13,16],[14,15],[15,16],[4,17],[17,2],[17,5],[4,18],[18,7],[18,8],[5,19],[19,8],[19,9]];

function JarvisOrb({ active, listening, speaking, compact = false, onClick }: { active: boolean; listening: boolean; speaking: boolean; compact?: boolean; onClick?: () => void }) {
  const size = compact ? 62 : 280;
  const color = listening ? "#72f6ff" : speaking ? "#72e6d9" : active ? "#46bfff" : "#2a89b8";
  return <Box onClick={onClick} role={onClick ? "button" : undefined} aria-label={onClick ? "Activar conversación con JARVIS" : undefined} sx={{ position: "relative", width: size, height: size, cursor: onClick ? "pointer" : "default", flexShrink: 0, filter: `drop-shadow(0 0 ${compact ? 8 : 24}px ${color})`, transition: "filter .4s", "&:hover": onClick ? { transform: "scale(1.025)" } : undefined }}>
    <Box sx={{ position: "absolute", inset: compact ? 2 : 8, borderRadius: "50%", border: `1px solid ${color}`, opacity: .55, animation: "orbSpin 12s linear infinite", "&::before": { content: '""', position: "absolute", inset: compact ? 4 : 18, borderRadius: "50%", border: `1px dashed ${color}`, animation: "orbSpin 7s linear infinite reverse" }, "@keyframes orbSpin": { to: { transform: "rotate(360deg)" } } }} />
    <Box sx={{ position: "absolute", inset: compact ? 8 : 32, borderRadius: "50%", background: "radial-gradient(circle at 42% 38%, rgba(190,252,255,.7) 0%, rgba(40,181,225,.32) 18%, rgba(2,32,60,.2) 55%, rgba(1,10,25,.05) 72%)", boxShadow: `inset 0 0 ${compact ? 14 : 45}px ${color}, 0 0 ${compact ? 12 : 35}px rgba(65,205,255,.35)`, animation: active ? "orbBreathe .9s ease-in-out infinite alternate" : "orbBreathe 3s ease-in-out infinite alternate", "@keyframes orbBreathe": { from: { transform: "scale(.96)", opacity: .78 }, to: { transform: "scale(1.03)", opacity: 1 } } }} />
    <Box component="svg" viewBox="0 0 100 100" sx={{ position: "absolute", inset: compact ? 9 : 35, width: compact ? 44 : 210, height: compact ? 44 : 210, overflow: "visible", animation: "networkFloat 8s ease-in-out infinite", "@keyframes networkFloat": { "0%,100%": { transform: "rotate(-2deg) scale(.98)" }, "50%": { transform: "rotate(3deg) scale(1.02)" } } }}>
      {orbLinks.map(([from, to], index) => <line key={index} x1={orbNodes[from][0]} y1={orbNodes[from][1]} x2={orbNodes[to][0]} y2={orbNodes[to][1]} stroke={color} strokeWidth={compact ? .55 : .35} opacity={compact ? .65 : .48} />)}
      {orbNodes.map(([x, y], index) => <circle key={index} cx={x} cy={y} r={compact ? 1.5 : 1.05 + (index % 3) * .25} fill="#d9fdff" opacity={.75 + (index % 3) * .1}><animate attributeName="opacity" values=".35;1;.35" dur={`${1.4 + (index % 5) * .35}s`} repeatCount="indefinite" /></circle>)}
    </Box>
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
      const deadline = Date.now() + 180_000;
      while (Date.now() < deadline) {
        try {
          const response = await api.get("/api/ia/status", { timeout: 15_000 });
          if (response.data?.ready) {
            engineReadyRef.current = true;
            setEngineState("ready");
            return true;
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
      const answer = data.answer || "No pude generar una respuesta.";
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
      <Fab onClick={activateJarvis} aria-label="Abrir JARVIS" sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300, width: 74, height: 74, bgcolor: "rgba(2,20,38,.94)", border: "1px solid rgba(92,225,255,.5)", boxShadow: "0 0 28px rgba(50,190,240,.45)", "&:hover": { bgcolor: "#061d32" } }}>
        <JarvisOrb compact active={false} listening={false} speaking={false} />
      </Fab>
    </Tooltip>

    <Dialog open={open} onClose={closeJarvis} fullScreen PaperProps={{ sx: { bgcolor: "#020b14", color: "white", backgroundImage: "radial-gradient(circle at 50% 42%, rgba(11,76,111,.38), transparent 34%), linear-gradient(135deg, #020812 0%, #041727 55%, #01070d 100%)", overflow: "hidden" } }}>
      <Box sx={{ position: "absolute", inset: 0, opacity: .16, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(83,210,244,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(83,210,244,.13) 1px, transparent 1px)", backgroundSize: "42px 42px", maskImage: "radial-gradient(circle, black 5%, transparent 72%)" }} />

      <Box sx={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", px: { xs: 2, md: 4 }, py: 2, borderBottom: "1px solid rgba(90,220,255,.14)" }}>
        <Box sx={{ flexGrow: 1 }}><Typography sx={{ letterSpacing: ".42em", fontWeight: 600, color: "#baf7ff" }}>J.A.R.V.I.S.</Typography><Typography variant="caption" sx={{ color: "rgba(180,240,255,.55)", letterSpacing: ".14em" }}>SISTEMA DE ASISTENCIA INTELIGENTE</Typography></Box>
        <Tooltip title={voiceEnabled ? "Silenciar voz" : "Activar voz"}><IconButton onClick={() => { cancel(); setVoiceEnabled((value) => !value); }} sx={{ color: "#8eefff" }}>{voiceEnabled ? <VolumeUp /> : <VolumeOff />}</IconButton></Tooltip>
        <Tooltip title="Historial"><IconButton onClick={() => setShowActionHistory((value) => !value)} sx={{ color: "#8eefff" }}><History /></IconButton></Tooltip>
        <Tooltip title="Nueva conversación"><IconButton onClick={clearConversation} sx={{ color: "#8eefff" }}><DeleteOutline /></IconButton></Tooltip>
        <IconButton onClick={closeJarvis} sx={{ color: "#8eefff" }}><Close /></IconButton>
      </Box>

      <Box sx={{ position: "relative", zIndex: 1, flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 2, pb: 11 }}>
        <JarvisOrb active={active || conversationMode} listening={isListening} speaking={speaking} onClick={toggleConversation} />
        <Typography sx={{ mt: 2, color: isListening ? "#bdfcff" : "#70dced", letterSpacing: ".28em", fontSize: ".75rem", textTransform: "uppercase" }}>{status}</Typography>
        <Typography variant="caption" sx={{ mt: 1, color: "rgba(188,239,248,.48)" }}>{engineStarting ? "Despertando el motor de IA. Puede tardar hasta un minuto; podés escribir igual y te respondo apenas esté listo." : conversationMode ? "Tocá la esfera para finalizar" : "Tocá la esfera para comenzar a hablar"}</Typography>

        <Box ref={chatRef} sx={{ mt: 3, width: "min(760px, 92vw)", maxHeight: 135, overflowY: "auto", textAlign: "center" }}>
          {lastMessages.map((message, index) => <Typography key={index} sx={{ mb: 1, color: message.autor === "assistant" ? "#d8faff" : "rgba(178,222,235,.62)", fontSize: message.autor === "assistant" ? "1rem" : ".82rem", lineHeight: 1.55 }}>{message.texto}</Typography>)}
        </Box>

        {pendingAction && <Alert severity="info" sx={{ mt: 2, width: "min(620px, 92vw)", bgcolor: "rgba(5,32,49,.88)", color: "#dcfaff", border: "1px solid rgba(83,220,255,.35)", "& .MuiAlert-icon": { color: "#70e6ff" } }}>
          <Typography fontWeight={700}>{pendingAction.title}</Typography>
          {visibleActionFields(pendingAction.payload).map(([key, value]) => <Typography variant="body2" key={key}>{actionLabels[key]}: {Array.isArray(value) ? value.join(", ") : typeof value === "object" ? Object.entries(value as Record<string, unknown>).map(([field, content]) => `${actionLabels[field] || field}: ${String(content)}`).join(" · ") : String(value)}</Typography>)}
          <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}><Button size="small" variant="contained" onClick={() => void executeAction()} disabled={executingAction}>{executingAction ? "Procesando..." : "Confirmar"}</Button><Button size="small" sx={{ color: "#bcefff" }} onClick={() => setPendingAction(null)} disabled={executingAction}>Cancelar</Button></Box>
        </Alert>}
      </Box>

      {showActionHistory && <Paper sx={{ position: "absolute", zIndex: 5, top: 86, right: 24, width: "min(380px, calc(100vw - 48px))", maxHeight: "60vh", overflow: "auto", p: 2, bgcolor: "rgba(3,22,36,.96)", color: "#dcfaff", border: "1px solid rgba(83,220,255,.32)", backdropFilter: "blur(18px)" }}><Typography fontWeight={700} sx={{ mb: 1 }}>Historial de acciones</Typography>{actionHistory.length === 0 && <Typography variant="body2" sx={{ opacity: .6 }}>Todavía no hay acciones.</Typography>}{actionHistory.map((item) => <Box key={item._id} sx={{ display: "flex", justifyContent: "space-between", gap: 1, py: 1, borderBottom: "1px solid rgba(120,220,240,.1)" }}><Typography variant="body2">{item.title}</Typography><Typography variant="caption" color={item.status === "success" ? "#72e6d9" : "#ff8c9b"}>{item.status === "success" ? "OK" : "Error"}</Typography></Box>)}</Paper>}

      <Box component="form" onSubmit={handleSubmit} sx={{ position: "absolute", zIndex: 4, bottom: 20, left: "50%", transform: "translateX(-50%)", width: "min(720px, calc(100vw - 32px))", display: "flex", alignItems: "center", gap: 1, p: 1, borderRadius: 8, bgcolor: "rgba(4,25,41,.82)", border: "1px solid rgba(80,218,250,.28)", backdropFilter: "blur(18px)", boxShadow: "0 0 35px rgba(0,170,220,.12)" }}>
        <IconButton onClick={toggleConversation} disabled={!speechSupported} sx={{ color: conversationMode ? "#ff7189" : "#76eaff" }}>{conversationMode ? <MicOff /> : <Mic />}</IconButton>
        <TextField fullWidth variant="standard" placeholder="Escribí o hablá con JARVIS..." value={userInput} onChange={(event) => setUserInput(event.target.value)} disabled={isLoading} autoComplete="off" InputProps={{ disableUnderline: true, sx: { color: "#dffbff", px: 1 } }} />
        <IconButton type="submit" disabled={!userInput.trim() || isLoading} sx={{ color: "#76eaff" }}><Send /></IconButton>
      </Box>
    </Dialog>
  </>;
}
