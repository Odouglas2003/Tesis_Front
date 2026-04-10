// components/Rubiko.tsx (VERSIÓN COMPLETA RESTAURADA)
// src/components/Rubiko.tsx (VERSIÓN FINAL CON HTTP FETCH)

"use client";

import React, { useState, FormEvent, useEffect, useRef } from "react";
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Avatar,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  SmartToy,
  Close,
  Send,
  //VolumeUp,
  //VolumeOff,
} from "@mui/icons-material";
// NOTA: No importamos 'io' ni 'Socket'

// Interfaz para la estructura de un mensaje en el chat
interface Message {
  autor: "user" | "rubiko";
  texto: string;
}

const welcomeMessage: Message = {
  autor: "rubiko",
  texto: "¡Hola! Soy Rubiko, tu asistente virtual. ¿En qué te puedo ayudar?",
};

export default function Rubiko() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll automático al final del chat
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleToggle = () => {
    setOpen(!open);
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === "" || isLoading) return;

    const userMessage: Message = { autor: "user", texto: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    const messageToSend = userInput;
    setUserInput("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error(
          "La variable de entorno NEXT_PUBLIC_API_URL no está definida."
        );
      }

      // Hacemos la llamada POST a nuestra ruta de chat en el backend
      const response = await fetch(`${apiUrl}/api/ia/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail ||
            errorData.error ||
            errorData.message ||
            "Ocurrió un error en el servidor de IA."
        );
      }

      const data = await response.json();
      const rubikoMessage: Message = { autor: "rubiko", texto: data.answer };
      setMessages((prev) => [...prev, rubikoMessage]);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      const errorMessage: Message = {
        autor: "rubiko",
        texto: `Lo siento, ocurrió un error`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Fab
        color="primary"
        onClick={handleToggle}
        sx={{ position: "fixed", bottom: 32, right: 32, zIndex: 1000 }}
      >
        <SmartToy />
      </Fab>
      <Dialog
        open={open}
        onClose={handleToggle}
        PaperProps={{
          sx: { width: "400px", height: "600px", borderRadius: "16px" },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 2,
            backgroundColor: "primary.main",
            color: "white",
          }}
        >
          <Avatar sx={{ bgcolor: "secondary.main" }}>
            <SmartToy />
          </Avatar>{" "}
          {"Asistente Rubiko"}
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={handleToggle} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            p: 0,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
          }}
        >
          <Box
            ref={chatContentRef}
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  alignSelf: msg.autor === "rubiko" ? "flex-start" : "flex-end",
                  maxWidth: "85%",
                }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    p: 1.5,
                    borderRadius:
                      msg.autor === "rubiko"
                        ? "20px 20px 20px 5px"
                        : "20px 20px 5px 20px",
                    bgcolor:
                      msg.autor === "rubiko" ? "grey.200" : "primary.light",
                    color: msg.autor === "rubiko" ? "text.primary" : "white",
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {msg.texto}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ alignSelf: "flex-start" }}>
                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: "20px 20px 20px 5px",
                    bgcolor: "grey.200",
                  }}
                >
                  <CircularProgress size={20} />
                </Paper>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              p: 1,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              bgcolor: "background.paper",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Escribe tu mensaje..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(e)}
              disabled={isLoading}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={isLoading}
            >
              <Send />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
