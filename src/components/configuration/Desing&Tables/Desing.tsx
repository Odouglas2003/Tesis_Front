"use client";
import React, { useEffect, useState } from "react";
import {
  Card, CardContent, Button, TextField, Box, Grid,
  Typography, Alert, CircularProgress
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import Image from "next/image";
import type { BrandConfig } from "@/types/interface";
import {
  getBrandConfig, createBrandConfig, updateBrandConfig, uploadImage, getImageUrl
} from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";
import { useAppTheme } from "@/app/ThemeProviderClient";

const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const genRandom = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID().split("-")[0]
    : Math.random().toString(36).slice(2, 8);

const genEmpresaId = (name?: string) => {
  const base = slugify(name || "empresa");
  return `${base}-${genRandom()}`;
};

export default function ConfigureComponent() {
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

  const [config, setConfig] = useState<BrandConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [empresaId, setEmpresaId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [themeName, setThemeName] = useState<"claro" | "oscuro">("claro");
  const [status, setStatus] = useState(true);
  const [slug, setSlug] = useState("");
  const [slugDirty, setSlugDirty] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [background, setBackground] = useState("#FFFFFF");
  const [button, setButton] = useState("#002338");
  const [text, setText] = useState("#000000");
  const [navbar, setNavbar] = useState("#002338");
  const [modal, setModal] = useState("#FFFFFF");
  const [card, setCard] = useState("#FFFFFF");
  const [miniCard, setMiniCard] = useState("#BDE0FF");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const current = await getBrandConfig().catch(() => null);
        if (current) {
          setConfig(current);
          setEmpresaId(current.empresaId || "");
          setCompanyName(current.companyName || "");
          setThemeName(current.name === "oscuro" ? "oscuro" : "claro");
          setStatus(current.status !== "inactive");
          setSlug(current.slug || "");
          setBackground(current.theme?.background || "#FFFFFF");
          setButton(current.theme?.button || "#002338");
          setText(current.theme?.text || "#000000");
          setNavbar(current.theme?.navbar || "#002338");
          setModal(current.theme?.modal || "#FFFFFF");
          setCard(current.theme?.card || "#FFFFFF");
          setMiniCard(current.theme?.miniCard || "#BDE0FF");
          if (current.logo) {
            try {
              setLogoUrl(await getImageUrl(current.logo));
            } catch { setLogoUrl(null); }
          } else {
            setLogoUrl(null);
          }
        } else {
          setConfig(null);
          setEmpresaId("");
          setCompanyName("");
          setThemeName("claro");
          setStatus(true);
          setSlug("");
          setBackground("#FFFFFF");
          setButton("#002338");
          setText("#000000");
          setNavbar("#002338");
          setModal("#FFFFFF");
          setCard("#FFFFFF");
          setMiniCard("#BDE0FF");
          setLogoUrl(null);
        }
      } catch (e: unknown) {
        const err = e as { message?: string };
        setErrorMsg(err?.message || "Error cargando configuración");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg(null);

      if (!companyName.trim()) {
        setErrorMsg("El nombre de la empresa es obligatorio");
        setSaving(false);
        return;
      }

      const ensuredEmpresaId = empresaId.trim() || genEmpresaId(companyName);

      let nextLogoKey = config?.logo;
      if (logoFile) nextLogoKey = await uploadImage(logoFile);

      const ensuredSlug = slug.trim() || slugify(companyName);

      const payload: Partial<BrandConfig> = {
        empresaId: ensuredEmpresaId,
        companyName: companyName.trim(),
        name: themeName,
        status: status ? "active" : "inactive",
        logo: nextLogoKey,
        slug: ensuredSlug,
        theme: { background, button, text, navbar, modal, card, miniCard },
      };

      const saved = config?.id
        ? await updateBrandConfig(payload)
        : await createBrandConfig(payload);

      setConfig(saved);
      setEmpresaId(saved.empresaId || ensuredEmpresaId);
      setCompanyName(saved.companyName || "");
      setThemeName(saved.name === "oscuro" ? "oscuro" : "claro");
      setStatus(saved.status !== "inactive");
      setSlug(saved.slug || ensuredSlug);
      setBackground(saved.theme?.background || "#FFFFFF");
      setButton(saved.theme?.button || "#002338");
      setText(saved.theme?.text || "#000000");
      setNavbar(saved.theme?.navbar || "#002338");
      setModal(saved.theme?.modal || "#FFFFFF");
      setCard(saved.theme?.card || "#FFFFFF");
      setLogoFile(null);
      setLogoUrl(saved.logo ? await getImageUrl(saved.logo) : null);
      setIsEditing(false);
      setModalVariant("success");
      setModalMessage("Configuración guardada correctamente");
      setModalOpen(true);
      try {
        const ev = new CustomEvent('brandConfig:update', { detail: saved });
  window.dispatchEvent(ev);
      } catch (e) {
      }
    } catch (e: unknown) {
      const err = e as { message?: string };
      setErrorMsg(err?.message || "Error al guardar");
      setModalVariant("error");
      setModalMessage(err?.message || "Ocurrió un error al guardar la configuración");
      setModalOpen(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card sx={{ p: 4, boxShadow: 3, borderRadius: "20px", mt: 2, mb: 4, maxWidth: 900, mx: "auto", bgcolor: "#FFFFFF" }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: "#002338" }}>
          Configura el aspecto de tu espacio
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, color: "#002338" }}>
          Agrega tu logotipo al portal.
        </Typography>

        <CardContent sx={{ p: 0 }}>
          {loading && (
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CircularProgress size={20} /> Cargando…
            </Box>
          )}
          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

          <input type="hidden" value={empresaId} readOnly />

          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre de la empresa"
                value={companyName}
                onChange={(e) => {
                  const v = e.target.value;
                  setCompanyName(v);
                  if (!slugDirty) setSlug(slugify(v));
                }}
                fullWidth
                disabled={!isEditing}
                sx={{
                  fontFamily: "Poppins",
                  color: "#002338",

                }}
                InputProps={{
                  sx: { color: "#002338" }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Tema (claro/oscuro)"
                value={themeName}
                onChange={(e) =>
                  setThemeName(e.target.value === "oscuro" ? "oscuro" : "claro")
                }
                fullWidth
                disabled={!isEditing}
                sx={{
                  fontFamily: "Poppins",
                  color: "#002338",

                }}
                InputProps={{
                  sx: { color: "#002338" }
                }}
              />
            </Grid>

            {/* <Grid item xs={12} md={4}>
            <TextField
              label="Slug (editable)"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugDirty(true); }}
              fullWidth
              disabled={!isEditing}
              helperText="Se genera automáticamente desde el nombre"
            />
          </Grid> */}

            {/* <Grid item xs={12} md={4} display="flex" alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                  disabled={!isEditing}
                />
              }
              label={status ? "Activo" : "Inactivo"}
            />
          </Grid> */}
          </Grid>

          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 500, color: "#002338", fontFamily: "Poppins" }}>
            Logotipo para la barra de menú
          </Typography>

          <Box mb={3}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              disabled={!isEditing}
              sx={{
                height: 180,
                borderStyle: "dashed",
                borderWidth: 2,
                borderColor: "#ccc",
                backgroundColor: "#fafafa",
                "&:hover": { backgroundColor: "#f0f0f0" }
              }}
            >
              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <FileUploadIcon sx={{ fontSize: 48, color: "#999" }} />
                <Typography variant="body2" color="#002338" fontFamily="Poppins">
                  Arrastra un archivo a esta zona o haz clic para explorar
                </Typography>
              </Box>
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => { if (e.target.files?.[0]) setLogoFile(e.target.files[0]); }}
              />
            </Button>

            <Typography variant="caption" sx={{ mt: 1, display: "block", color: "#002338", fontFamily: "Poppins" }}>
              Esta imagen será adaptada al tamaño 30x28
            </Typography>

            {(logoFile || logoUrl) && (
              <Box mt={3} display="flex" justifyContent="flex-start">
                <Box
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    p: 2,
                    backgroundColor: "#fff"
                  }}
                >
                  <Image
                    src={logoFile ? URL.createObjectURL(logoFile) : (logoUrl as string)}
                    alt="Logo"
                    width={120}
                    height={120}
                    style={{ objectFit: "contain" }}
                  />
                </Box>
              </Box>
            )}
          </Box>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: "#002338", fontFamily: "Poppins" }}>
            Colores de la marca
          </Typography>
          <Grid container spacing={3} mb={3}>
            {[
              { label: "Background", value: background, set: setBackground },
              { label: "Botón", value: button, set: setButton },
              { label: "Texto", value: text, set: setText },
              { label: "Navbar", value: navbar, set: setNavbar },
              { label: "Modal", value: modal, set: setModal },
              { label: "Card", value: card, set: setCard },
            ].map((c) => (
              <Grid key={c.label} item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ mb: 1, display: "block", color: "#002338", fontFamily: "Poppins" }}>
                  {c.label}
                </Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <TextField
                    value={c.value}
                    onChange={(e) => c.set(e.target.value)}
                    fullWidth
                    disabled={!isEditing}
                    size="small"
                    sx={{ fontFamily: "Poppins", color: "#002338" }}
                    InputProps={{
                      sx: { color: "#002338" }
                    }}
                  />
                  <Box
                    component="label"
                    sx={{
                      width: 50,
                      height: 50,
                      minWidth: 50,
                      backgroundColor: c.value,
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      cursor: isEditing ? "pointer" : "not-allowed",
                      display: "block",
                      position: "relative",
                      color: "#002338",
                    }}
                  >
                    <input
                      type="color"
                      value={c.value}
                      onChange={(e) => c.set(e.target.value)}
                      disabled={!isEditing}
                      style={{
                        opacity: 0,
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        cursor: isEditing ? "pointer" : "not-allowed",

                      }}
                    />
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: "#002338", fontFamily: "Poppins" }}>
                  {c.value}
                </Typography>
              </Grid>
            ))}
          </Grid>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            {!isEditing ? (
              <Button
                variant="contained"
                onClick={() => setIsEditing(true)}
                disabled={loading}
                sx={{
                  backgroundColor: colors.button || "#002338",
                  color: "#23FFDC",
                  borderRadius: "20px",
                  height: "40px",
                  width: "200px",
                  textTransform: "none",
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  boxShadow: "0 4px 12px rgba(0, 35, 56, 0.3)",
                }}
              >
                Editar
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  sx={{
                    color: "#0087FF",
                    border: `1px solid "#0087FF"`,
                    borderRadius: "20px",
                    backgroundColor: "transparent",
                    height: "40px",
                    width: "200px",
                    textTransform: "none",
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    backgroundColor: colors.button || "#002338",
                    color: "#23FFDC",
                    borderRadius: "20px",
                    height: "40px",
                    width: "200px",
                    textTransform: "none",
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    boxShadow: "0 4px 12px rgba(0, 35, 56, 0.3)",
                  }}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
      <ModalComponent
        open={modalOpen}
        variant={modalVariant}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}