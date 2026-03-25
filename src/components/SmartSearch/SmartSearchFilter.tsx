"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, Alert, CircularProgress, Paper, Snackbar } from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import GetAppIcon from '@mui/icons-material/GetApp';
import { exportAnalyticsReportClient } from "@/services/api";
import MessageModal from "@/components/message/MessageModal";
import SmartSearch, { AnalyticsResponsePayload } from "@/components/SmartSearch/SmartSearch";
import { Employee } from "@/types/interface";

interface SmartSearchFilterProps {
  items: unknown[];
  storageKey?: string;
  initialSuggestions?: string[];
  placeholder?: string;
  displayMode?: 'inline' | 'snackbar';
  onFilterChange?: (filtered: unknown[] | null, interpretation?: string) => void;

  /** collection name used by the export endpoint (e.g. 'collaborator' | 'vacancy' | 'projects') */
  exportCollection?: string;

  /** Optional local search fallback: (query, items) => results */
  localSearchFallback?: (query: string, items: unknown[]) => unknown[];
  /** Optional plural label used in UI (e.g. 'colaboradores', 'vacantes') */
  itemLabelPlural?: string;
}

export default function SmartSearchFilter({
  items,
  storageKey = "smartSearch_colaboradores",
  initialSuggestions,
  placeholder,
  displayMode,
  onFilterChange,
  exportCollection = 'collaborator',
  localSearchFallback,
  itemLabelPlural,
}: SmartSearchFilterProps) {
  const [openSearch, setOpenSearch] = useState(false);
  const [aiFilteredItems, setAiFilteredItems] = useState<unknown[] | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState<string>("");
  const [aiError, setAiError] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportModalVariant, setExportModalVariant] = useState<'error' | 'success' | 'warning'>('success');
  const [exportModalMessage, setExportModalMessage] = useState<string>('');
  const [aiErrorModalOpen, setAiErrorModalOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const ids = (parsed.aiFilteredIds as string[] | undefined)
        ?? (parsed.aiFilteredVacancyIds as string[] | undefined)
        ?? (parsed.aiFilteredCollaboratorIds as string[] | undefined)
        ?? (parsed.aiFilteredProjectIds as string[] | undefined)
        ?? null;

      const interpretation = (parsed.aiInterpretation as string) ?? "";

      if (ids == null) return;

      if (Array.isArray(ids) && ids.length === 0) {
        setAiFilteredItems([]);
        setAiInterpretation(interpretation);
        onFilterChange?.([], interpretation);
        return;
      }

      if (Array.isArray(ids)) {
        const restored = (items as unknown[]).filter(item => {
          const id = getIdFromItem(item) || getString((item as Record<string, unknown>).id);
          return id ? ids.includes(id) : false;
        });
        setAiFilteredItems(restored as unknown[]);
        setAiInterpretation(interpretation);
        onFilterChange?.(restored as unknown[], interpretation);
      }
    } catch (e) {
    }
  }, [items, storageKey]);

  const getPluralLabel = () => {
    if (itemLabelPlural && itemLabelPlural.trim()) return itemLabelPlural;
    switch ((exportCollection || '').toLowerCase()) {
      case 'collaborator':
      case 'colaborator':
      case 'collaboradores':
        return 'colaboradores';
      case 'vacancy':
      case 'vacantes':
        return 'vacantes';
      case 'project':
      case 'proyecto':
      case 'proyectos':
        return 'proyectos';
      default:
        return 'items';
    }
  };
  const pluralLabel = getPluralLabel();

  const getString = (v: unknown) => {
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    return '';
  };

  const getIdFromItem = (item: unknown): string => {
    if (!item || typeof item !== 'object') return '';
    const obj = item as Record<string, unknown>;
    const candidates = ['_id', 'id', '_id_str', 'employeeId', 'collaboratorId', 'referenceId', 'vacancyId', 'projectId'];
    for (const key of candidates) {
      const v = obj[key];
      if (v == null) continue;
      if (typeof v === 'string' || typeof v === 'number') return String(v);
      if (typeof v === 'object') {
        const nested = v as Record<string, unknown>;
        if (nested._id) return getString(nested._id);
        if (nested.id) return getString(nested.id);
        if (nested.name) return getString(nested.name);
      }
    }
    return '';
  };

  const extractCollaboratorIds = (payload: AnalyticsResponsePayload | number | null | undefined): string[] => {
    if (!payload || typeof payload === 'number') return [];

    try {
      let itemsResp: unknown[] = [];
      const resp = (payload as AnalyticsResponsePayload).response;
      if (resp && Array.isArray(resp.results)) itemsResp = resp.results as unknown[];
      else if (Array.isArray((payload as AnalyticsResponsePayload).items)) itemsResp = (payload as AnalyticsResponsePayload).items as unknown[];
      else if (Array.isArray((payload as AnalyticsResponsePayload).results)) itemsResp = (payload as AnalyticsResponsePayload).results as unknown[];
      else if (Array.isArray((payload as AnalyticsResponsePayload).data)) itemsResp = (payload as AnalyticsResponsePayload).data as unknown[];

      const ids: string[] = [];
      for (const item of itemsResp) {
        if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>;
          const id = getString(obj._id) || getString(obj.id) || getString(obj._id_str) || getString(obj.employeeId) || getString(obj.collaboratorId) || getString(obj.referenceId);
          if (id) ids.push(id);
        }
      }
      return ids;
    } catch (err) {
      console.error("Error extrayendo IDs:", err);
      return [];
    }
  };

  const smartLocalSearch = (query: string): unknown[] => {
    const lowerQuery = query.toLowerCase();
    const typedItems = items as Employee[];
    const patterns = {
      disponible: /disponible|libre|sin proyecto|available/i,
      asignado: /asignado|ocupado|en proyecto|assigned/i,
      activo: /activo|active/i,
      inactivo: /inactivo|inactive/i,
      senior: /senior|experto|expert/i,
      junior: /junior|nuevo|trainee|jr/i,
      semiSenior: /semi.?senior|ssr/i,
      contratoVencer: /contrato.*(vence|expira|próximo)|próximo.?a.?vencer/i,
      contratoVencido: /contrato.*(vencido|expirado|expired)/i,
      conProyectos: /con.?proyecto|tiene.?proyecto|en.?proyecto/i,
      sinProyectos: /sin.?proyecto|libre|disponible/i,
    };

    let filtered: Employee[] = typedItems;

    if (patterns.activo.test(query)) {
      filtered = filtered.filter(c => c.estado?.toLowerCase().includes('activo'));
    } else if (patterns.inactivo.test(query)) {
      filtered = filtered.filter(c => c.estado?.toLowerCase().includes('inactivo'));
    }

    if (patterns.senior.test(query)) {
      filtered = filtered.filter(c =>
        c.roles?.some(r => r.seniority?.toLowerCase().includes('senior')) ||
        c.Proyectos?.some(p => p.seniority?.toLowerCase().includes('senior'))
      );
    } else if (patterns.semiSenior.test(query)) {
      filtered = filtered.filter(c =>
        c.roles?.some(r => r.seniority?.toLowerCase().includes('semi') || r.seniority?.toLowerCase().includes('ssr')) ||
        c.Proyectos?.some(p => p.seniority?.toLowerCase().includes('semi') || p.seniority?.toLowerCase().includes('ssr'))
      );
    } else if (patterns.junior.test(query)) {
      filtered = filtered.filter(c =>
        c.roles?.some(r => r.seniority?.toLowerCase().includes('junior') || r.seniority?.toLowerCase().includes('jr')) ||
        c.Proyectos?.some(p => p.seniority?.toLowerCase().includes('junior') || p.seniority?.toLowerCase().includes('jr'))
      );
    }

    if (patterns.contratoVencer.test(query)) {
      filtered = filtered.filter(c => c.contractStatus?.alertLevel === 'warning' || c.alertLevel === 'warning');
    } else if (patterns.contratoVencido.test(query)) {
      filtered = filtered.filter(c => c.contractStatus?.alertLevel === 'expired' || c.alertLevel === 'expired');
    }

    if (patterns.conProyectos.test(query)) {
      filtered = filtered.filter(c => c.Proyectos && c.Proyectos.length > 0);
    } else if (patterns.sinProyectos.test(query)) {
      filtered = filtered.filter(c => !c.Proyectos || c.Proyectos.length === 0);
    }

    if (filtered.length === typedItems.length) {
      filtered = typedItems.filter(c => {
        const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
        const searchInRoles = c.roles?.some(r => r.rol?.toLowerCase().includes(lowerQuery) || r.seniority?.toLowerCase().includes(lowerQuery));
        const searchInTecnologias = c.tecnologias?.some(t => t.toLowerCase().includes(lowerQuery));
        const searchInProjects = c.Proyectos?.some(p => p.projectId?.name?.toLowerCase().includes(lowerQuery) || p.rol?.toLowerCase().includes(lowerQuery));

        return (
          fullName.includes(lowerQuery) ||
          c.first_name?.toLowerCase().includes(lowerQuery) ||
          c.last_name?.toLowerCase().includes(lowerQuery) ||
          c.email?.toLowerCase().includes(lowerQuery) ||
          c.PuestoDeTrabajo?.toLowerCase().includes(lowerQuery) ||
          c.estado?.toLowerCase().includes(lowerQuery) ||
          searchInRoles ||
          searchInTecnologias ||
          searchInProjects
        );
      });
    }

    return filtered;
  };

  const handleAIResults = (payload: AnalyticsResponsePayload | number | null | undefined) => {
    setAiError("");
    setAiInterpretation("");
    setIsSearching(false);

    try {
      if (!payload) {
        setAiFilteredItems(null);
        onFilterChange?.(null, "");
        return;
      }

      // If the AI service returned an explicit error status, surface it
      try {
        const asObj = payload as unknown as Record<string, unknown>;
        if (asObj && typeof asObj === 'object' && (asObj.status === 'error' || asObj.status === 'ERROR')) {
          const svcMsg = String(asObj.message ?? 'La IA no pudo interpretar la consulta. Intenta ser más claro.');
          const errMsg = `Error del servicio de IA: ${svcMsg}`;
          setAiError(errMsg);
          setAiErrorModalOpen(true);
          setAiFilteredItems(null);
          onFilterChange?.(null, "");
          if ((displayMode || 'inline') === 'snackbar') setShowSnackbar(true);
          return;
        }
      } catch (e) {
        // ignore parsing errors here
      }

      if (typeof payload === 'number') {
        setAiFilteredItems(items);
        setAiInterpretation(`Se encontraron ${payload} colaboradores`);
        onFilterChange?.(items, `Se encontraron ${payload} colaboradores`);
        return;
      }

      if (payload.interpretation) {
        setAiInterpretation(payload.interpretation);
      }
      if (payload.message && !payload.interpretation) {
        setAiInterpretation(payload.message);
      }

      const collaboratorIds = extractCollaboratorIds(payload);

      if (collaboratorIds.length === 0) {
        const searchTerms = payload.message || payload.interpretation || "";
        if (searchTerms) {
          const fuzzyFiltered = localSearchFallback ? localSearchFallback(searchTerms, items) : smartLocalSearch(searchTerms);
          if (fuzzyFiltered.length > 0) {
            setAiFilteredItems(fuzzyFiltered as unknown[]);
            const foundMsg = `Se encontraron ${fuzzyFiltered.length} ${itemLabelPlural || (exportCollection === 'collaborator' ? 'colaboradores' : exportCollection + 's')} relacionados`;
            setAiInterpretation(foundMsg);
            onFilterChange?.(fuzzyFiltered as unknown[], foundMsg);
            if ((displayMode || 'inline') === 'snackbar') setShowSnackbar(true);
            try {
              const idsFromFuzzy = (fuzzyFiltered as unknown[]).map(item => {
                if (item && typeof item === 'object') {
                  const obj = item as Record<string, unknown>;
                  return getString(obj._id ?? obj.id ?? obj.employeeId ?? obj.collaboratorId ?? obj.referenceId);
                }
                return '';
              }).filter(Boolean);
              const saved: Record<string, unknown> = { aiFilteredIds: idsFromFuzzy, aiInterpretation: foundMsg, timestamp: Date.now() };
              if (exportCollection === 'collaborator') saved.aiFilteredCollaboratorIds = idsFromFuzzy;
              if (exportCollection === 'vacancy') saved.aiFilteredVacancyIds = idsFromFuzzy;
              if (exportCollection === 'project') saved.aiFilteredProjectIds = idsFromFuzzy;
              localStorage.setItem(storageKey, JSON.stringify(saved));
            } catch (e) {
            }
            return;
          }
        }

        const noResultsMessage = "No se encontraron resultados para tu consulta. La almacenaremos para entrenar mejor a la IA en su próxima versión.";
        setAiFilteredItems([]);
        setAiInterpretation(noResultsMessage);
        onFilterChange?.([], noResultsMessage);
        if ((displayMode || 'inline') === 'snackbar') setShowSnackbar(true);
        try {
          const saved: Record<string, unknown> = { aiFilteredIds: [], aiInterpretation: noResultsMessage, timestamp: Date.now() };
          if (exportCollection === 'collaborator') saved.aiFilteredCollaboratorIds = [];
          if (exportCollection === 'vacancy') saved.aiFilteredVacancyIds = [];
          if (exportCollection === 'project') saved.aiFilteredProjectIds = [];
          localStorage.setItem(storageKey, JSON.stringify(saved));
        } catch (e) { }
        return;
      }

      const typedItems = items as Employee[];
      const filtered = typedItems.filter(c =>
        collaboratorIds.includes(String(c.id)) ||
        collaboratorIds.some(id => String(c.id).includes(id) || id.includes(String(c.id)))
      );

      setAiFilteredItems(filtered as unknown[]);
      onFilterChange?.(filtered as unknown[], filtered.length === 0 ? `No se encontraron ${itemLabelPlural || (exportCollection === 'collaborator' ? 'colaboradores' : exportCollection + 's')} en tu lista que coincidan con los resultados` : (payload.interpretation || payload.message || `Se encontraron ${filtered.length} ${itemLabelPlural || (exportCollection === 'collaborator' ? 'colaboradores' : exportCollection + 's')}`));

      if ((displayMode || 'inline') === 'snackbar') setShowSnackbar(true);

      try {
        const ids = filtered.map(c => getIdFromItem(c)).filter(Boolean) as string[];
        const saved: Record<string, unknown> = { aiFilteredIds: ids, aiInterpretation: payload.interpretation || payload.message || `Se encontraron ${filtered.length} ${itemLabelPlural || (exportCollection === 'collaborator' ? 'colaboradores' : exportCollection + 's')}`, timestamp: Date.now() };
        if (exportCollection === 'collaborator') saved.aiFilteredCollaboratorIds = ids;
        if (exportCollection === 'vacancy') saved.aiFilteredVacancyIds = ids;
        if (exportCollection === 'project') saved.aiFilteredProjectIds = ids;
        localStorage.setItem(storageKey, JSON.stringify(saved));
      } catch (e) {
      }
    } catch (err) {
      console.error("Error procesando resultados de IA:", err);
      setAiError("Error al procesar los resultados. Intenta de nuevo.");
      setAiErrorModalOpen(true);
      setAiFilteredItems(null);
      onFilterChange?.(null, "");
    }
  };

  const handleAIError = (errorMsg: string) => {
    console.error("Error de IA:", errorMsg);
    setIsSearching(false);
    setAiError("El servicio de IA no está disponible en este momento. Por favor intenta más tarde o usa la búsqueda normal.");
    setAiErrorModalOpen(true);
    setAiFilteredItems(null);
    setAiInterpretation("");
    onFilterChange?.(null, "");
    if ((displayMode || 'inline') === 'snackbar') setShowSnackbar(true);
  };

  const handleAISearch = (query: string) => {
    setLastQuery(query || "");
    setIsSearching(true);
    setAiError("");
  };

  const handleExport = async () => {
    setIsExporting(true);
    const filename = `filtro_${storageKey}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const queryText = (lastQuery && lastQuery.trim()) || aiInterpretation || "";
    const payload = { query: queryText };

    try {
      await exportAnalyticsReportClient(payload, filename);
      setExportModalVariant('success');
      setExportModalMessage(`Exportación iniciada: ${filename}`);
      setExportModalOpen(true);
    } catch (err) {
      console.error('Export failed (query payload):', err);
      setExportModalVariant('error');
      setExportModalMessage('Error al exportar el filtro. Revisa la consola para más detalles.');
      setExportModalOpen(true);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAIFilter = () => {
    setAiFilteredItems(null);
    setAiInterpretation("");
    setAiError("");
    setIsSearching(false);
    try { localStorage.removeItem(storageKey); } catch (e) { }
    onFilterChange?.(null, "");
    setShowSnackbar(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          disabled={isSearching}
          sx={{
            bgcolor: aiFilteredItems !== null ? "#002338" : "#002338",
            borderRadius: "20px",
            textTransform: "none",
            fontSize: "16px",
            fontWeight: 500,
            height: "50px",
            width: "fit-content",
            minWidth: "unset",
            px: 2,
            fontFamily: "Poppins, sans-serif",
            color: "#fff",
            border: "none",
            transition: "all 0.3s ease",
            "&:hover": { bgcolor: aiFilteredItems !== null ? "#002338" : "#003a52", border: "none" },
            "&:disabled": { bgcolor: "#cccccc", color: "#666" }
          }}
          startIcon={isSearching ? <CircularProgress size={20} sx={{ color: "#666" }} /> : aiFilteredItems !== null ? <FilterListOffIcon fontSize="medium" /> : <AutoAwesomeIcon fontSize="medium" />}
          onClick={() => { if (aiFilteredItems !== null) { handleClearAIFilter(); } else { setOpenSearch(true); } }}
        >
          {isSearching ? "Buscando..." : aiFilteredItems !== null ? "Limpiar filtro IA" : "Filtrar por IA"}
        </Button>

        {aiFilteredItems !== null && (
          <Button
            variant="outlined"
            disabled={isExporting}
            startIcon={isExporting ? <CircularProgress size={16} sx={{ color: "#666" }} /> : <GetAppIcon />}
            sx={{
              borderRadius: "20px",
              textTransform: "none",
              fontSize: "14px",
              height: "50px",
              px: 2,
              fontFamily: "Poppins, sans-serif",
            }}
            onClick={handleExport}
          >
            {isExporting ? "Exportando..." : "Exportar filtro"}
          </Button>
        )}
      </Box>

      {aiFilteredItems !== null && (displayMode || 'inline') === 'inline' && (
        <Paper elevation={0} sx={{ mb: 2, mt: 1, p: '6px 8px', borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', bgcolor: '#f6f8fa', border: '1px solid #e6eef2' }}>
          <Chip
            size="small"
            icon={<CheckCircleIcon />}
            label={`Mostrando ${aiFilteredItems.length} de ${items.length} ${pluralLabel}`}
            aria-label="mostrando-resultados"
            sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, bgcolor: "#002338", color: "#fff", pl: 1, pr: 1 }}
          />
        </Paper>
      )}

      <Dialog open={openSearch} onClose={() => { if (!isSearching) setOpenSearch(false); }} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 35, 56, 0.12)', maxHeight: '80vh' } }}>
        <DialogTitle sx={{ fontFamily: "Poppins, sans-serif", color: "#002338", bgcolor: "#ffffff", fontSize: "1.5rem", fontWeight: 600, pb: 2, borderBottom: "1px solid #f0f0f0" }}>Buscar con IA</DialogTitle>
        <DialogContent sx={{ bgcolor: "#ffffff", pt: 3, pb: 3, minHeight: '400px', maxHeight: 'calc(80vh - 100px)', overflowY: 'auto' }}>
          <SmartSearch
            placeholder={placeholder || "Ej: colaboradores sin proyectos, desarrolladores senior..."}
            initialSuggestions={initialSuggestions || [
              "colaboradores sin proyectos",
              "desarrolladores senior",
              "colaboradores con contrato por vencer",
              "colaboradores activos",
              "semi senior con proyectos"
            ]}
            storageKey={storageKey}
            showOwnResults={false}
            onSearch={handleAISearch}
            onResults={(payload) => { handleAIResults(payload); setOpenSearch(false); }}
            onError={(msg) => { handleAIError(msg); setOpenSearch(false); }}
          />
        </DialogContent>
      </Dialog>
      <Snackbar
        open={showSnackbar && (aiFilteredItems !== null || !!aiError)}
        autoHideDuration={aiError ? 8000 : 5000}
        onClose={() => { setShowSnackbar(false); if (aiError) setAiError(""); }}
        anchorOrigin={ aiError ? { vertical: 'top', horizontal: 'right' } : { vertical: 'bottom', horizontal: 'left' } }
      >
        {aiError ? (
          <Alert onClose={() => { setShowSnackbar(false); setAiError(""); }} severity="error" icon={<WarningIcon />} sx={{ minWidth: 320 }}>
            {aiError}
          </Alert>
        ) : (
          <Paper elevation={4} sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center', minWidth: 280 }}>
            <Chip size="small" icon={<CheckCircleIcon />} label={`Mostrando ${aiFilteredItems?.length ?? 0} de ${items.length}`} sx={{ bgcolor: '#002338', color: '#fff' }} />
            {aiInterpretation && <Box component="span" sx={{ ml: 1, maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{aiInterpretation}</Box>}
          </Paper>
        )}
      </Snackbar>

      <MessageModal
        open={exportModalOpen}
        variant={exportModalVariant}
        message={exportModalMessage}
        onClose={() => { setExportModalOpen(false); }}
      />
      <MessageModal
        open={aiErrorModalOpen}
        variant="error"
        message={aiError}
        onClose={() => { setAiErrorModalOpen(false); setAiError(""); }}
        isShowButton={true}
      />
    </Box>
  );
}
