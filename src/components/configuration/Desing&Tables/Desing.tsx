"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Button,
  TextField,
  Box,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import Image from "next/image";
import type { BrandConfig } from "@/types/interface";
import {
  getBrandConfig,
  createBrandConfig,
  updateBrandConfig,
  uploadImage,
  getImageUrl,
} from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";
import { useAppTheme } from "@/app/ThemeProviderClient";
import { DEFAULT_THEME_PALETTES } from "@/theme/appPalette";

const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const genRandom = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().split("-")[0]
    : Math.random().toString(36).slice(2, 8);

const genEmpresaId = (name?: string) => {
  const base = slugify(name || "empresa");
  return `${base}-${genRandom()}`;
};

const DEFAULT_VISUAL_THEME = {
  primary: DEFAULT_THEME_PALETTES.claro.primary,
  secondary: DEFAULT_THEME_PALETTES.claro.secondary,
  accent: DEFAULT_THEME_PALETTES.claro.accent,
  background: DEFAULT_THEME_PALETTES.claro.background,
  modal: DEFAULT_THEME_PALETTES.claro.modal,
  button: DEFAULT_THEME_PALETTES.claro.button,
  text: DEFAULT_THEME_PALETTES.claro.text,
  navbar: DEFAULT_THEME_PALETTES.claro.navbar,
  card: DEFAULT_THEME_PALETTES.claro.card,
};

const buildMiniCardGradient = (accent: string, secondary: string) =>
  `linear-gradient(135deg, ${accent}2E 0%, ${secondary}26 100%)`;

type ThemeFormState = Record<keyof typeof DEFAULT_VISUAL_THEME, string>;

const THEME_FIELDS: Array<{
  key: keyof ThemeFormState;
  label: string;
  helper: string;
}> = [
  { key: "primary", label: "Primario", helper: "Títulos y texto principal" },
  { key: "secondary", label: "Secundario", helper: "Acentos complementarios" },
  { key: "accent", label: "Acento", helper: "Destacados e IA" },
  { key: "background", label: "Background", helper: "Fondo general" },
  { key: "navbar", label: "Navbar", helper: "Barra superior" },
  { key: "button", label: "Botón", helper: "Acción principal" },
  { key: "text", label: "Texto de acción", helper: "Texto sobre CTA y activos" },
  { key: "modal", label: "Modal", helper: "Fondos de diálogos" },
  { key: "card", label: "Card", helper: "Tarjetas y contenedores" },
];

const cardSx = {
  p: { xs: 3, md: 4 },
  boxShadow: "0 20px 60px rgba(18,48,77,0.12)",
  borderRadius: "28px",
  maxWidth: 1080,
  mx: "auto",
  bgcolor: "#FFFFFF",
  border: "1px solid rgba(18,48,77,0.08)",
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "18px",
    backgroundColor: "rgba(244,248,251,0.92)",
  },
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
  const [localLogoUrl, setLocalLogoUrl] = useState<string | null>(null);

  const [themeForm, setThemeForm] = useState<ThemeFormState>(DEFAULT_VISUAL_THEME);

  const setThemeField = (key: keyof ThemeFormState, value: string) => {
    setThemeForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const hydrateForm = useCallback(async (current: BrandConfig | null) => {
    if (current) {
      setConfig(current);
      setEmpresaId(current.empresaId || "");
      setCompanyName(current.companyName || "");
      setThemeName(current.name === "oscuro" ? "oscuro" : "claro");
      setStatus(current.status !== "inactive");
      setSlug(current.slug || "");
      setThemeForm({
        primary: current.theme?.primary || current.theme?.navbar || DEFAULT_VISUAL_THEME.primary,
        secondary: current.theme?.secondary || current.theme?.button || DEFAULT_VISUAL_THEME.secondary,
        accent: current.theme?.accent || current.theme?.text || DEFAULT_VISUAL_THEME.accent,
        background: current.theme?.background || DEFAULT_VISUAL_THEME.background,
        modal: current.theme?.modal || DEFAULT_VISUAL_THEME.modal,
        button: current.theme?.button || DEFAULT_VISUAL_THEME.button,
        text: current.theme?.text || DEFAULT_VISUAL_THEME.text,
        navbar: current.theme?.navbar || DEFAULT_VISUAL_THEME.navbar,
        card: current.theme?.card || DEFAULT_VISUAL_THEME.card,
      });

      if (current.logo) {
        try {
          setLogoUrl(await getImageUrl(current.logo));
        } catch {
          setLogoUrl(null);
        }
      } else {
        setLogoUrl(null);
      }
      return;
    }

    setConfig(null);
    setEmpresaId("");
    setCompanyName("");
    setThemeName("claro");
    setStatus(true);
    setSlug("");
    setThemeForm(DEFAULT_VISUAL_THEME);
    setLogoUrl(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        const current = await getBrandConfig().catch(() => null);
        await hydrateForm(current);
      } catch (e: unknown) {
        const err = e as { message?: string };
        setErrorMsg(err?.message || "Error cargando configuración");
      } finally {
        setLoading(false);
      }
    })();
  }, [hydrateForm]);

  useEffect(() => {
    if (!logoFile) {
      setLocalLogoUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLocalLogoUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  const previewLogo = localLogoUrl || logoUrl;
  const previewBrandName = companyName.trim() || "TeamMatch";
  const previewMiniCard = useMemo(
    () => buildMiniCardGradient(themeForm.accent, themeForm.secondary),
    [themeForm.accent, themeForm.secondary]
  );

  const handleCancel = async () => {
    setIsEditing(false);
    setLogoFile(null);
    setSlugDirty(false);
    await hydrateForm(config);
  };

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
      const ensuredSlug = slug.trim() || slugify(companyName);

      let nextLogoKey = config?.logo;
      if (logoFile) {
        nextLogoKey = await uploadImage(logoFile);
      }

      const payload: Partial<BrandConfig> = {
        id: config?.id,
        empresaId: ensuredEmpresaId,
        companyName: companyName.trim(),
        name: themeName,
        status: status ? "active" : "inactive",
        logo: nextLogoKey,
        slug: ensuredSlug,
        theme: {
          ...themeForm,
          miniCard: buildMiniCardGradient(themeForm.accent, themeForm.secondary),
        },
      };

      const saved = config?.id
        ? await updateBrandConfig(payload)
        : await createBrandConfig(payload);

      setConfig(saved);
      setEmpresaId(saved.empresaId || ensuredEmpresaId);
      setCompanyName(saved.companyName || companyName.trim());
      setThemeName(saved.name === "oscuro" ? "oscuro" : "claro");
      setStatus(saved.status !== "inactive");
      setSlug(saved.slug || ensuredSlug);
      setLogoFile(null);
      setLogoUrl(saved.logo ? await getImageUrl(saved.logo) : null);

      setThemeForm({
        primary: saved.theme?.primary || themeForm.primary,
        secondary: saved.theme?.secondary || themeForm.secondary,
        accent: saved.theme?.accent || themeForm.accent,
        background: saved.theme?.background || themeForm.background,
        modal: saved.theme?.modal || themeForm.modal,
        button: saved.theme?.button || themeForm.button,
        text: saved.theme?.text || themeForm.text,
        navbar: saved.theme?.navbar || themeForm.navbar,
        card: saved.theme?.card || themeForm.card,
      });

      setIsEditing(false);
      setModalVariant("success");
      setModalMessage("Configuración visual guardada correctamente");
      setModalOpen(true);

      try {
        const ev = new CustomEvent("brandConfig:update", { detail: saved });
        window.dispatchEvent(ev);
      } catch {
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
      <Card sx={cardSx}>
        <Typography
          variant="h5"
          sx={{
            mb: 1,
            fontWeight: 700,
            color: colors.primary,
            letterSpacing: "-0.02em",
          }}
        >
          Configurá el aspecto de tu espacio
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mb: 4,
            color: "rgba(18,48,77,0.72)",
          }}
        >
          Los cambios que guardes acá se aplican al logo, nombre visible y paleta principal de la organización.
        </Typography>

        <CardContent sx={{ p: 0 }}>
          {loading && (
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CircularProgress size={20} />
              <Typography>Cargando configuración…</Typography>
            </Box>
          )}

          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

          <input type="hidden" value={empresaId} readOnly />

          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12} md={7}>
              <TextField
                label="Nombre de la empresa"
                value={companyName}
                onChange={(e) => {
                  const value = e.target.value;
                  setCompanyName(value);
                  if (!slugDirty) setSlug(slugify(value));
                }}
                fullWidth
                disabled={!isEditing}
                sx={inputSx}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                select
                label="Tema base"
                value={themeName}
                onChange={(e) =>
                  setThemeName(e.target.value === "oscuro" ? "oscuro" : "claro")
                }
                fullWidth
                disabled={!isEditing}
                sx={inputSx}
              >
                <MenuItem value="claro">Claro</MenuItem>
                <MenuItem value="oscuro">Oscuro</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Typography
            variant="h6"
            sx={{ mb: 1, fontWeight: 600, color: colors.primary }}
          >
            Logotipo para la barra de menú
          </Typography>

          <Box mb={4}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              disabled={!isEditing}
              sx={{
                height: 180,
                borderStyle: "dashed",
                borderWidth: 2,
                borderColor: "rgba(18,48,77,0.14)",
                borderRadius: "22px",
                backgroundColor: "rgba(244,248,251,0.72)",
                "&:hover": { backgroundColor: "rgba(244,248,251,0.92)" },
              }}
            >
              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <FileUploadIcon sx={{ fontSize: 44, color: "rgba(18,48,77,0.48)" }} />
                <Typography variant="body2" color={colors.primary}>
                  Arrastrá un archivo a esta zona o hacé clic para explorar
                </Typography>
              </Box>
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) setLogoFile(e.target.files[0]);
                }}
              />
            </Button>

            <Typography
              variant="caption"
              sx={{
                mt: 1,
                display: "block",
                color: "rgba(18,48,77,0.68)",
              }}
            >
              El logo se usa en navbar, login y vistas institucionales.
            </Typography>
          </Box>

          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 600, color: colors.primary }}
          >
            Vista previa del branding
          </Typography>

          <Box
            sx={{
              mb: 4,
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(18,48,77,0.08)",
              backgroundColor: themeForm.background,
              boxShadow: "0 18px 45px rgba(18,48,77,0.08)",
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2,
                backgroundColor: themeForm.navbar,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "14px",
                    backgroundColor: "rgba(255,255,255,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {previewLogo ? (
                    <Image
                      src={previewLogo}
                      alt={previewBrandName}
                      width={34}
                      height={34}
                      style={{ width: "78%", height: "78%", objectFit: "contain" }}
                    />
                  ) : (
                    <DashboardRoundedIcon sx={{ color: themeForm.text }} />
                  )}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: "#F7FBFF",
                      fontWeight: 700,
                      lineHeight: 1.1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {previewBrandName}
                  </Typography>
                  <Typography
                    sx={{
                      color: themeForm.text,
                      fontSize: "0.78rem",
                      lineHeight: 1.1,
                    }}
                  >
                    Identidad visible al lado del logo
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                sx={{
                  backgroundColor: themeForm.button,
                  color: themeForm.text,
                  borderRadius: "14px",
                  boxShadow: "none",
                  textTransform: "none",
                  fontWeight: 700,
                  "&:hover": {
                    backgroundColor: themeForm.button,
                    boxShadow: "none",
                  },
                }}
              >
                Acción
              </Button>
            </Box>

            <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: themeForm.background }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: "22px",
                      backgroundColor: themeForm.card,
                      border: "1px solid rgba(18,48,77,0.08)",
                    }}
                  >
                    <Typography sx={{ color: themeForm.primary, fontWeight: 700, fontSize: "1.1rem" }}>
                      Configuración ejecutiva
                    </Typography>
                    <Typography sx={{ mt: 1, color: themeForm.secondary, lineHeight: 1.6 }}>
                      Así se verá el sistema cuando guardes: logo, nombre de la empresa y colores aplicados al layout base.
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: "22px",
                      background: previewMiniCard,
                      border: "1px solid rgba(18,48,77,0.08)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <AutoAwesomeRoundedIcon sx={{ color: themeForm.accent }} />
                      <Typography sx={{ color: themeForm.primary, fontWeight: 700 }}>
                        Tarjeta destacada
                      </Typography>
                    </Box>
                    <Typography sx={{ color: themeForm.secondary }}>
                      La mini card también toma el color de acento y el secundario.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>

          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 600, color: colors.primary }}
          >
            Colores de la marca
          </Typography>

          <Grid container spacing={2.5} mb={4}>
            {THEME_FIELDS.map((field) => (
              <Grid key={field.key} item xs={12} sm={6} lg={4}>
                <Typography
                  variant="caption"
                  sx={{ mb: 1, display: "block", color: colors.primary, fontWeight: 600 }}
                >
                  {field.label}
                </Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <TextField
                    value={themeForm[field.key]}
                    onChange={(e) => setThemeField(field.key, e.target.value)}
                    fullWidth
                    disabled={!isEditing}
                    size="small"
                    sx={inputSx}
                  />
                  <Box
                    component="label"
                    sx={{
                      width: 46,
                      height: 46,
                      minWidth: 46,
                      backgroundColor: themeForm[field.key],
                      border: "1px solid rgba(18,48,77,0.14)",
                      borderRadius: "12px",
                      cursor: isEditing ? "pointer" : "not-allowed",
                      display: "block",
                      position: "relative",
                    }}
                  >
                    <input
                      type="color"
                      value={themeForm[field.key]}
                      onChange={(e) => setThemeField(field.key, e.target.value)}
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
                <Typography
                  variant="caption"
                  sx={{ mt: 0.75, display: "block", color: "rgba(18,48,77,0.66)" }}
                >
                  {field.helper}
                </Typography>
              </Grid>
            ))}
          </Grid>

          <Box display="flex" justifyContent="flex-end" gap={2} flexWrap="wrap">
            {!isEditing ? (
              <Button
                variant="contained"
                onClick={() => setIsEditing(true)}
                disabled={loading}
                sx={{
                  backgroundColor: colors.button,
                  color: colors.text,
                  borderRadius: "18px",
                  height: "46px",
                  minWidth: "200px",
                  textTransform: "none",
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  boxShadow: "0 10px 24px rgba(18,48,77,0.18)",
                }}
              >
                Editar branding
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={saving}
                  sx={{
                    color: colors.secondary,
                    borderColor: "rgba(42,108,168,0.18)",
                    borderRadius: "18px",
                    backgroundColor: "transparent",
                    height: "46px",
                    minWidth: "200px",
                    textTransform: "none",
                    fontFamily: "Poppins",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "rgba(42,108,168,0.04)",
                      borderColor: "rgba(42,108,168,0.24)",
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
                    backgroundColor: colors.button,
                    color: colors.text,
                    borderRadius: "18px",
                    height: "46px",
                    minWidth: "220px",
                    textTransform: "none",
                    fontFamily: "Poppins",
                    fontWeight: 700,
                    boxShadow: "0 10px 24px rgba(18,48,77,0.18)",
                  }}
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
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
