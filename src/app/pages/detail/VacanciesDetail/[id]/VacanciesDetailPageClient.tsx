"use client";
import React from "react";
import Navbar from "@/components/navbar/pages";
import VacanciesDetail from "@/components/component-vacancies/VacanciesDetail/VacanciesDetail";
import { Vacancie } from "@/types/interface";
import { Box } from "@mui/material";
export default function VacanciesDetailPageClient({
  vacancie,
}: {
  vacancie: Vacancie;
}) {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Navbar />
      </Box>
      <Box sx={{ mb: 3 }}>
        <VacanciesDetail vacancie={vacancie} />
      </Box>
    </Box>
  );
}
