"use client";
import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import SmartSearchFilter from '@/components/SmartSearch/SmartSearchFilter';
import { ProjectTable } from "@/components/component-projects/TableProjects/TableProjects";
import CardsProjets from "@/components/component-projects/CardProject/CardProject";
import SearchCardToggle from "@/components/SearchCard/SearchActionsBar";
import { fetchProjects } from "@/services/api";
import { Employee, User, Project } from "@/types/interface";
import AppShell from "@/components/layout/AppShell";

// Clave para localStorage
const STORAGE_KEY = 'project_ai_filter_state';

interface FilterState {
  aiFilteredProjectIds: string[] | null;
  aiInterpretation: string;
  timestamp: number;
}

export default function ProjectClientView({
  projectsProp,
  collaboratorsProp,
  usersProp,
}: {
  projectsProp: Project[];
  collaboratorsProp: Employee[];
  usersProp: User[];
}) {
  const [projects, setProjects] = useState(projectsProp);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [aiFilteredProjects, setAiFilteredProjects] = useState<Project[] | null>(null);
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
        if (parsed.aiFilteredProjectIds && parsed.aiFilteredProjectIds.length > 0) {
          const filtered = projects.filter(p => 
            parsed.aiFilteredProjectIds!.includes(String(p.id))
          );
          setAiFilteredProjects(filtered);
          setAiInterpretation(parsed.aiInterpretation || `Filtro restaurado: ${filtered.length} proyectos`);
        } else if (parsed.aiFilteredProjectIds !== null) {
          // Si es un array vacío, mostrar que no hay resultados
          setAiFilteredProjects([]);
          setAiInterpretation(parsed.aiInterpretation || "No se encontraron proyectos");
        }
      }
    } catch (err) {
      console.error("Error cargando filtro guardado:", err);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [projects]);

  // Guardar el filtro cuando cambie
  useEffect(() => {
    try {
      if (aiFilteredProjects !== null) {
        const state: FilterState = {
          aiFilteredProjectIds: aiFilteredProjects.map(p => String(p.id)),
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
  }, [aiFilteredProjects, aiInterpretation]);

  const handleAddSuccess = async () => {
    const resultProjects = await fetchProjects();
    setProjects(resultProjects);
    if (aiFilteredProjects !== null) {
      setAiFilteredProjects(null);
    }
  };

  

  const smartLocalSearch = (query: string): Project[] => {
    const lowerQuery = query.toLowerCase();
    
    const patterns = {
      enCurso: /en curso|activo|ongoing|current/i,
      finalizado: /finalizado|terminado|completed|done/i,
      aIniciar: /a iniciar|pendiente|por empezar|to start/i,
      vencidos: /vencido|expirado|expired/i,
      proximos: /próximo|pronto|soon|vence/i,
    };

    let filtered = projects;

    if (patterns.enCurso.test(query)) {
      filtered = filtered.filter(p => p.status?.toLowerCase().includes('en curso'));
    } else if (patterns.finalizado.test(query)) {
      filtered = filtered.filter(p => p.status?.toLowerCase().includes('finalizado'));
    } else if (patterns.aIniciar.test(query)) {
      filtered = filtered.filter(p => p.status?.toLowerCase().includes('a iniciar'));
    }

    if (patterns.vencidos.test(query) || patterns.proximos.test(query)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(p => {
        if (!p.endDate) return false;
        const endDate = new Date(p.endDate);
        endDate.setHours(0, 0, 0, 0);
        const diffTime = endDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (patterns.vencidos.test(query)) {
          return daysRemaining <= 0;
        }
        if (patterns.proximos.test(query)) {
          return daysRemaining > 0 && daysRemaining <= 30;
        }
        return false;
      });
    }

    if (filtered.length === projects.length) {
      filtered = projects.filter(p => {
        return (
          p.name?.toLowerCase().includes(lowerQuery) ||
          p.client?.toLowerCase().includes(lowerQuery) ||
          p.status?.toLowerCase().includes(lowerQuery) ||
          p.category?.toLowerCase().includes(lowerQuery) ||
          p.managerName?.toLowerCase().includes(lowerQuery)
        );
      });
    }

    return filtered;
  };

  

  const displayedProjects = aiFilteredProjects !== null ? aiFilteredProjects : projects;

  return (
    <AppShell
      title="Proyectos"
      description="Supervisa el avance, estado y composición de cada iniciativa activa de la organización."
    >
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <SearchCardToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
            setSearchTerm={setSearchTerm}
            currentSection="proyecto"
            onAddClick={() => { }}
            onAddSuccess={handleAddSuccess}
          />
          <SmartSearchFilter
            items={projects}
            storageKey={STORAGE_KEY}
            placeholder="Ej: proyectos en curso, proyectos finalizados..."
            initialSuggestions={[
              "proyectos en curso",
              "proyectos finalizados",
              "proyectos a iniciar",
              "proyectos que vencen pronto",
              "proyectos vencidos"
            ]}
            exportCollection="project"
            localSearchFallback={(q, _items) => smartLocalSearch(q)}
            onFilterChange={(filtered, interpretation) => {
              setAiFilteredProjects(filtered as Project[] | null);
              setAiInterpretation(interpretation || "");
            }}
          />
        </Box>
      </Box>

      <Box>
        {viewMode === "cards" ? (
          <CardsProjets
            projectsProp={displayedProjects}
            searchTerm={searchTerm}
          />
        ) : (
          <ProjectTable
            projectsProp={displayedProjects}
            collaboratorProp={collaboratorsProp}
            searchTerm={searchTerm}
            usersProps={usersProp}
          />
        )}
      </Box>
    </AppShell>
  );
}
