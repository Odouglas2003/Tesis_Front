"use client";
import React from "react";
import Navbar from "@/components/navbar/pages";
import EditProject from "@/components/component-projects/EditProject/EditProject";
import { Box } from "@mui/material";
import { Client, ProjectStatus, Employee, Project } from "@/types/interface";

export default function EditProjectView({
  project,
  manager,
  states,
  clients,
}: {
  project: Project;
  manager: Employee[];
  states: ProjectStatus[];
  clients: Client[];
}) {
  return (
    <>
      <Box>
        <Navbar />
      </Box>
      <Box>
        <EditProject
          managerProp={manager}
          project={project}
          statesProp={states}
          clientProp={clients}
        />
      </Box>
    </>
  );
}
