"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, CircularProgress, Typography } from "@mui/material";

const RETRY_EVERY_MS = 6000;
const MAX_AUTO_RETRIES = 20;

// Se muestra cuando una página no pudo cargar datos del servidor
// (por ejemplo, mientras el backend en Render se está despertando).
// Reintenta sola hasta que el backend responde.
export default function PagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);

  const retry = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  useEffect(() => {
    console.error("Error cargando la página:", error);
  }, [error]);

  useEffect(() => {
    if (attempt >= MAX_AUTO_RETRIES) return;
    const timer = setTimeout(() => {
      setAttempt((n) => n + 1);
      retry();
    }, RETRY_EVERY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const waiting = attempt < MAX_AUTO_RETRIES;

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        px: 2,
        textAlign: "center",
      }}
    >
      {waiting && <CircularProgress />}
      <Typography sx={{ fontFamily: "Poppins", fontSize: 22, fontWeight: 600, color: "#12304D" }}>
        {waiting ? "Conectando con el servidor…" : "No pudimos cargar esta página"}
      </Typography>
      <Typography sx={{ fontFamily: "Poppins", color: "#5b6b7a", maxWidth: 480 }}>
        {waiting
          ? "El servicio se está iniciando. Esto puede tardar hasta un minuto; la página se va a cargar sola."
          : "El servidor no respondió. Probá de nuevo en unos segundos."}
      </Typography>
      <Button variant="contained" onClick={retry} sx={{ textTransform: "none", borderRadius: "10px" }}>
        Reintentar ahora
      </Button>
    </Box>
  );
}
