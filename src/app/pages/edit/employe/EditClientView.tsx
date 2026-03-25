"use client";
import React from "react";
import Navbar from "@/components/navbar/pages";
import EditEmploye from "@/components/components-collaborators/EditEmploye/EditEmploye";
import { Box } from "@mui/material";
import { Employee, User, Project, Skill } from "@/types/interface";
export default function EditClientViewEmploye({
  colab,
  users,
  project,
  skill
}: {
  colab: Employee;
  users: User[];
  project: Project[];
  skill: Skill[];
}) {
  return (
    <>
      <Box>
        <Navbar />
      </Box>
      <Box>
        <EditEmploye
          usersProp={users}
          colabId={colab}
          projectProp={project}
          skillProp={skill}
        />
      </Box>
    </>
  );
}
