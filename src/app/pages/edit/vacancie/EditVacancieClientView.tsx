"use client";
import React from "react";
import Navbar from "@/components/navbar/pages";
import EditVacancie from "@/components/component-vacancies/EditVacancie/EditVacancie";
import { Box } from "@mui/material";
import {
  Vacancie,
  ProjectNew,
  User,
  Job,
  Skill,
  Employee,
} from "@/types/interface";
export default function EditVacancieClientView({
  vacancieProp,
  skillsProp,
  projectsProp,
  usersProp,
  jobsProp,
  managersProp,
}: {
  vacancieProp: Vacancie;
  skillsProp: Skill[];
  projectsProp: ProjectNew[];
  usersProp: User[];
  jobsProp: Job[];
  managersProp: Employee[]; // Ensure managersProp is an array of Employee or Manager type
}) {
  return (
    <>
      <Box>
        <Navbar />
      </Box>
      <Box>
        <EditVacancie
          skillsProp={skillsProp}
          projectsProp={projectsProp}
          vacancieProp={vacancieProp}
          usersProp={usersProp}
          jobsProp={jobsProp}
          managersProp={managersProp}
        />
      </Box>
    </>
  );
}
