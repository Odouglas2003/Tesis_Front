"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Divider,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from '@mui/icons-material/History';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { queryAnalytics } from "@/services/api";

interface ResultItem {
  _id?: string;
  id?: string;
  _id_str?: string;
  projectId?: string;
  vacancieId?: string;
  vacancyId?: string;
  collaboratorId?: string;
  employeeId?: string;
  personId?: string;
  referenceId?: string;
  title?: string;
  name?: string;
  description?: string;
  extra?: Record<string, unknown> | string | number;
  [key: string]: unknown;
}

export interface AnalyticsResponsePayload {
  response?: {
    totalResults?: number | string;
    total_results?: number | string;
    results?: ResultItem[] | unknown[];
    collection?: string;
  };
  items?: ResultItem[];
  results?: ResultItem[];
  data?: ResultItem[];
  count?: number;
  message?: string;
  interpretation?: string;
  collection?: string;
  collection_name?: string;
  collectionName?: string;
}

export default function SmartSearch({
  placeholder = "Buscar...",
  initialSuggestions = [],
  onSearch,
  onResults,
  onError,
  showOwnResults = true,
  storageKey = "smartSearch_history",
}: {
  placeholder?: string;
  initialSuggestions?: string[];
  onSearch?: (query: string) => void;
  onResults?: (payload: AnalyticsResponsePayload | number | null | undefined) => void;
  onError?: (err: string) => void;
  showOwnResults?: boolean;
  storageKey?: string;
}) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<AnalyticsResponsePayload | number | null>(null);
  const [openResults, setOpenResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
  const hist = sessionStorage.getItem(storageKey);
      if (hist) setSuggestions((prev) => [...new Set([...prev, ...JSON.parse(hist)])]);
    } catch (e) {
    }
  }, []);

  const debouncedValue = useDebounce(value, 250);

  useEffect(() => {
    if (!debouncedValue) {
  const history = sessionStorage.getItem(storageKey);
      const historyArr: string[] = history ? JSON.parse(history) : [];
      const merged = [...new Set([...(historyArr || []), ...(initialSuggestions || [])])].slice(0, 30);
      setSuggestions(merged);
      return;
    }
    const matched = (initialSuggestions || []).filter((s) => s.toLowerCase().includes(debouncedValue.toLowerCase()));
  const history = sessionStorage.getItem(storageKey);
    const historyArr = history ? JSON.parse(history) : [];
    const historyMatches = (historyArr as string[]).filter((s) => s.toLowerCase().includes(debouncedValue.toLowerCase()));
    setSuggestions([...new Set([...matched, ...historyMatches])].slice(0, 8));
    setShowSuggestions(true);
  }, [debouncedValue, initialSuggestions]);

  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(ev.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const runQuery = async (q: string) => {
    if (!q || q.trim() === "") return;
    setLoading(true);
    setError(null);
    setPayload(null);
    try {
      onSearch?.(q);
    } catch (e) {
    }
    try {
      const data = await queryAnalytics(q);
      const typed = data as AnalyticsResponsePayload | number;
      setPayload(typed);
      try {
  const hist = sessionStorage.getItem(storageKey);
  const arr = hist ? JSON.parse(hist) : [];
  const updated = [q, ...arr.filter((x: string) => x !== q)].slice(0, 30);
  sessionStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
      }
      if (onResults) {
        try { onResults(typed); } catch (e) {  }
        if (showOwnResults) setOpenResults(true);
      } else {
        setOpenResults(true);
      }
    } catch (err: unknown) {
      const msg = "La IA no pudo interpretar la consulta. Intenta ser más claro.";
      setError(msg);
      if (onError) {
        try { onError(msg); } catch (e) {  }
      }
      setOpenResults(true);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    runQuery(value.trim());
  };

  const onSelectSuggestion = (s: string) => {
    setValue(s);
    setShowSuggestions(false);
    runQuery(s);
  };

  return (
    <Box ref={wrapperRef} sx={{ position: "relative", width: "100%", maxWidth: 820 }}>
      <form onSubmit={onSubmit}>
        <TextField
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          size="small"
          sx={{
            bgcolor: '#f3f4f6',
            borderRadius: 1,
            '& .MuiInputBase-root': { height: 48 },
            '& .MuiInputBase-input': { fontSize: 15, color: '#000', py: 1 },
            '& .MuiInputBase-input::placeholder': { color: '#9ca3af' },
            border: '1px solid #e6edf2',
            boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.02)'
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => runQuery(value)} aria-label="buscar" sx={{ color: '#000' }}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <Paper sx={{ position: "absolute", zIndex: 1200, mt: 1, left: 0, right: 0, p: 1, maxHeight: 320, overflow: 'auto', bgcolor: '#b1b1b1ff'  }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <HistoryIcon sx={{ color: '#6b7280' }} />
                <Typography variant="body2" sx={{ color: '#000', fontWeight: 600 }}>Historial / Sugerencias</Typography>
              </Stack>
            <IconButton size="small" onClick={() => {
              sessionStorage.removeItem(storageKey);
              setSuggestions(initialSuggestions || []);
            }} aria-label="Limpiar historial" title="Borrar historial">
              <DeleteForeverIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Divider />
          <List dense>
            {suggestions.map((s, i) => (
              <ListItemButton key={i} onClick={() => onSelectSuggestion(s)} sx={{ py: 0.8, '&:hover': { bgcolor: '#f6fbfd' } }}>
                <ListItemText
                  primary={s}
                  primaryTypographyProps={{ style: { fontSize: 14, color: '#000', whiteSpace: 'normal', overflowWrap: 'anywhere' } }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
