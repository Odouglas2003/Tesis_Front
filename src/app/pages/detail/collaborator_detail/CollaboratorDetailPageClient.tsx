"use client";
import React from "react";
import Navbar from "@/components/navbar/pages";
import CardDetalle from "@/components/components-collaborators/card_detail/CardDetail";
import { Box } from "@mui/material";
import { Employee } from "@/types/interface";

export default function CollaboratorDetail({ colab }: { colab: Employee }) {
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Navbar />
      </Box>
      <Box sx={{ mb: 3 }}>
        <CardDetalle colabProp={colab} />
      </Box>
    </>
  );
}
