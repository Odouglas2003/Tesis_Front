"use client";
import React from "react";
import { Box } from "@mui/material";
import Navbar from "@/components/navbar/pages";
import Dash from "@/components/component-dash/Dashboard";
import { DashboardData } from "@/types/interface";
export default function DashClientView({
  metrics,
}: {
  metrics: DashboardData;
}) {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      <Navbar />
      <Dash metricsProp={metrics} />
    </Box>
  );
}