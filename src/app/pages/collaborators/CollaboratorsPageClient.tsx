  "use client";
  import React, { useState } from "react";
  import Navbar from "@/components/navbar/pages";
  import EmployeeTable from "@/components/components-collaborators/TableEmployes/TableEmployes";
  import CardsEmployes from "@/components/components-collaborators/cards-employes/CardEmployes";
  import SearchCardToggle from "@/components/SearchCard/SearchActionsBar";
  import SmartSearchFilter from '@/components/SmartSearch/SmartSearchFilter';
  import { Box } from "@mui/material";
  import { fetchCollaborators } from "@/services/api";
  import { Employee, ColumnConfigColaborador } from "@/types/interface";

  interface CollaboratorsPageClientProps {
    collaboratorsProp: Employee[];
    columnsProp: ColumnConfigColaborador[];
  }

  export default function CollaboratorsPageClient({ collaboratorsProp, columnsProp }: CollaboratorsPageClientProps) {
    const [collaborators, setCollaborators] = useState(collaboratorsProp);
    const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [estadoAsignacion, setEstadoAsignacion] = useState<string | null>(null);
    const [aiFilteredCollaborators, setAiFilteredCollaborators] = useState<Employee[] | null>(null);

    const handleAddSuccess = async () => {
      const resultCollaborators = await fetchCollaborators(estadoAsignacion ? { estadoAsignacion } : undefined);
      setCollaborators(resultCollaborators || []);
      if (aiFilteredCollaborators !== null) setAiFilteredCollaborators(null);
    };

    const handleAssignmentFilterChange = async (value: string | null) => {
      setEstadoAsignacion(value);
      const result = await fetchCollaborators(value ? { estadoAsignacion: value } : undefined);
      setCollaborators(result || []);
    };

    const displayedCollaborators = aiFilteredCollaborators !== null ? aiFilteredCollaborators : collaborators;

    return (
      <>
        <Box>
          <Navbar />
        </Box>
        <Box sx={{ marginLeft: "60px", marginRight: "60px" }}>
          <Box sx={{ mb: 2, fontSize: "1.25rem", color: "#000" }}>Colaboradores</Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <SearchCardToggle
                viewMode={viewMode}
                setViewMode={setViewMode}
                setSearchTerm={setSearchTerm}
                currentSection="colaboradores"
                onAddSuccess={handleAddSuccess}
                onAddClick={() => { }}
                onAssignmentFilterChange={handleAssignmentFilterChange}
              />
              <SmartSearchFilter
                items={collaborators}
                storageKey="smartSearch_colaboradores"
                onFilterChange={(filtered) => setAiFilteredCollaborators(filtered as Employee[] | null)}
              />
            </Box>
          </Box>

          <Box>
            {viewMode === "cards" ? (
              <CardsEmployes collaboratorProp={displayedCollaborators} searchTerm={searchTerm} />
            ) : (
              <EmployeeTable collaboratorProp={displayedCollaborators} searchTerm={searchTerm} columnsprop={columnsProp} />
            )}
          </Box>
        </Box>
      </>
    );
  }