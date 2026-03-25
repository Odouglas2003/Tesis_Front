"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SuggestionResponse, ProjectPayload } from "@/types/interface";

type SuggestionData = SuggestionResponse;
type ProjectData = ProjectPayload;

interface ProjectSuggestionContextProps {
  projectData: ProjectData | null;
  suggestionData: SuggestionData | null;
  setProjectData: (data: ProjectData) => void;
  setSuggestionData: (data: SuggestionData) => void;
  reset: () => void;
}

const ProjectSuggestionContext = createContext<
  ProjectSuggestionContextProps | undefined
>(undefined);

export const ProjectSuggestionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [projectData, setProjectDataState] = useState<ProjectData | null>(null);
  const [suggestionData, setSuggestionDataState] =
    useState<SuggestionData | null>(null);

  const setProjectData = (data: ProjectData) => setProjectDataState(data);
  const setSuggestionData = (data: SuggestionData) =>
    setSuggestionDataState(data);
  const reset = () => {
    setProjectDataState(null);
    setSuggestionDataState(null);
  };

  return (
    <ProjectSuggestionContext.Provider
      value={{
        projectData,
        suggestionData,
        setProjectData,
        setSuggestionData,
        reset,
      }}
    >
      {children}
    </ProjectSuggestionContext.Provider>
  );
};

export const useProjectSuggestion = () => {
  const context = useContext(ProjectSuggestionContext);
  if (!context) throw new Error("Provider error");
  return context;
};
