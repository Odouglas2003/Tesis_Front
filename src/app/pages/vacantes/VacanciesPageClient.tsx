"use client";
import React, { useState, useEffect } from "react";
import { Box,  } from "@mui/material";
import SmartSearchFilter from '@/components/SmartSearch/SmartSearchFilter';
import VacanciesTable from "@/components/component-vacancies/VacanciesTable/VacanciesTable";
import VacanciesCards from "@/components/component-vacancies/CardVacancie/CardVacancie";
import SearchCardToggle from "@/components/SearchCard/SearchActionsBar";
import { fetchVacancies } from "@/services/api";
import { Vacancie, Employee } from "@/types/interface";
import AppShell from "@/components/layout/AppShell";

// Clave para localStorage
const STORAGE_KEY = 'vacancy_ai_filter_state';

interface FilterState {
  aiFilteredVacancyIds: string[] | null;
  aiInterpretation: string;
  timestamp: number;
}

type Props = {
  vacanciesProp: Vacancie[];
  collaboratorProp: Employee[];
};

export default function VacanciesPageClient({
  vacanciesProp,
  collaboratorProp,
}: Props) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [vacancies, setVacancies] = useState(vacanciesProp);
  const [aiFilteredVacancies, setAiFilteredVacancies] = useState<Vacancie[] | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState<string>("");

  // Cargar el filtro guardado al montar el componente
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed: FilterState = JSON.parse(savedState);
        
        // Opcional: verificar si el filtro no es muy antiguo (ej: 24 horas)
        const hoursSinceFilter = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
        if (hoursSinceFilter > 24) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        // Restaurar el filtro
        if (parsed.aiFilteredVacancyIds && parsed.aiFilteredVacancyIds.length > 0) {
          const filtered = vacancies.filter(v => 
            parsed.aiFilteredVacancyIds!.includes(String(v.id))
          );
          setAiFilteredVacancies(filtered);
          setAiInterpretation(parsed.aiInterpretation || `Filtro restaurado: ${filtered.length} vacantes`);
        } else if (parsed.aiFilteredVacancyIds !== null) {
          // Si es un array vacío, mostrar que no hay resultados
          setAiFilteredVacancies([]);
          setAiInterpretation(parsed.aiInterpretation || "No se encontraron vacantes");
        }
      }
    } catch (err) {
      console.error("Error cargando filtro guardado:", err);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [vacancies]);

  // Guardar el filtro cuando cambie
  useEffect(() => {
    try {
      if (aiFilteredVacancies !== null) {
        const state: FilterState = {
          aiFilteredVacancyIds: aiFilteredVacancies.map(v => String(v.id)),
          aiInterpretation,
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error("Error guardando filtro:", err);
    }
  }, [aiFilteredVacancies, aiInterpretation]);

  const handleAddSuccess = async () => {
    const resultVacancies = await fetchVacancies();
    setVacancies(resultVacancies ?? []);
    if (aiFilteredVacancies !== null) {
      setAiFilteredVacancies(null);
    }
  };

  

  // Búsqueda inteligente local como fallback
  const smartLocalSearch = (query: string): Vacancie[] => {
    const lowerQuery = query.toLowerCase();
    
    // Patrones comunes de búsqueda para vacantes
    const patterns = {
      abiertas: /abierta|open|nueva|disponible/i,
      enProceso: /en.?proceso|proceso|in.?progress|progreso/i,
      finalizadas: /finalizada|cerrada|completed|closed/i,
      senior: /senior|experto|expert|sr/i,
      junior: /junior|trainee|jr/i,
      semiSenior: /semi.?senior|ssr|semi/i,
      urgente: /urgente|urgent|prioridad/i,
      recientes: /reciente|nueva|new|últimas/i,
    };

    let filtered = vacancies;

    // Filtrar por estado
    if (patterns.abiertas.test(query)) {
      filtered = filtered.filter(v => 
        v.status?.toLowerCase() === 'abierta'
      );
    } else if (patterns.enProceso.test(query)) {
      filtered = filtered.filter(v => 
        v.status?.toLowerCase() === 'en proceso'
      );
    } else if (patterns.finalizadas.test(query)) {
      filtered = filtered.filter(v => 
        v.status?.toLowerCase() === 'finalizada'
      );
    }

    // Filtrar por seniority
    if (patterns.senior.test(query)) {
      filtered = filtered.filter(v => 
        v.seniority?.toLowerCase().includes('senior') ||
        v.seniority?.toLowerCase().includes('sr')
      );
    } else if (patterns.semiSenior.test(query)) {
      filtered = filtered.filter(v => 
        v.seniority?.toLowerCase().includes('semi') ||
        v.seniority?.toLowerCase().includes('ssr')
      );
    } else if (patterns.junior.test(query)) {
      filtered = filtered.filter(v => 
        v.seniority?.toLowerCase().includes('junior') ||
        v.seniority?.toLowerCase().includes('jr')
      );
    }

    // Filtrar por recientes (últimos 30 días)
    if (patterns.recientes.test(query)) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(v => {
        if (!v.created_at) return false;
        const createdDate = new Date(v.created_at);
        return createdDate >= thirtyDaysAgo;
      });
    }

    // Si no coincide con patrones, buscar en campos de texto
    if (filtered.length === vacancies.length) {
      const getSkillName = (skill: unknown) => {
        if (typeof skill === 'string') return skill;
        if (skill && typeof skill === 'object') return String((skill as Record<string, unknown>).name ?? '');
        return '';
      };

      filtered = vacancies.filter(v => {
        const searchInSkills = Array.isArray(v.skills)
          ? v.skills.some((skill) => getSkillName(skill).toLowerCase().includes(lowerQuery))
          : false;

        const vacName = String(v.vacancieName ?? '').toLowerCase();
        const desc = String(v.description ?? '').toLowerCase();
        const status = String(v.status ?? '').toLowerCase();
        const seniority = String(v.seniority ?? '').toLowerCase();
        const projName = String(v.projectId?.name ?? '').toLowerCase();
        const projClient = String(v.projectId?.client ?? '').toLowerCase();
        const manager = String(v.manager_name ?? '').toLowerCase();

        return (
          vacName.includes(lowerQuery) ||
          desc.includes(lowerQuery) ||
          status.includes(lowerQuery) ||
          seniority.includes(lowerQuery) ||
          projName.includes(lowerQuery) ||
          projClient.includes(lowerQuery) ||
          manager.includes(lowerQuery) ||
          searchInSkills
        );
      });
    }

    return filtered;
  };

  

  const displayedVacancies = aiFilteredVacancies !== null ? aiFilteredVacancies : vacancies;

  return (
    <AppShell
      title="Vacantes"
      description="Centraliza necesidades de talento, prioridades y estados de cobertura para cada proyecto."
    >
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <SearchCardToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
            setSearchTerm={setSearchTerm}
            currentSection="vacante"
            onAddClick={() => {}}
            onAddSuccess={handleAddSuccess}
          />
          <SmartSearchFilter
            items={vacancies}
            storageKey={STORAGE_KEY}
            placeholder="Ej: vacantes abiertas, vacantes senior..."
            initialSuggestions={[
              "vacantes abiertas",
              "vacantes senior",
              "vacantes en proceso",
              "vacantes recientes",
              "desarrolladores junior"
            ]}
            exportCollection="vacancy"
            localSearchFallback={(q, _items) => smartLocalSearch(q)}
            onFilterChange={(filtered, interpretation) => {
              setAiFilteredVacancies(filtered as Vacancie[] | null);
              setAiInterpretation(interpretation || "");
            }}
          />
        </Box>
      </Box>

      <Box>
        {viewMode === "cards" ? (
          <VacanciesCards
            vacanciesProp={displayedVacancies}
            searchTerm={searchTerm}
            collaboratorProp={collaboratorProp}
          />
        ) : (
          <VacanciesTable vacanciesProp={displayedVacancies} searchTerm={searchTerm} />
        )}
      </Box>
    </AppShell>
  );
}
