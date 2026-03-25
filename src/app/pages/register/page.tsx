import { Suspense } from "react";
import React from "react";
import RegisterForm from "@/components/register/RegisterForm";
import { Box } from "@mui/material";
export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <Suspense fallback={<div>Loading...</div>}>
        <Box>
          <RegisterForm />
        </Box>
      </Suspense>
    </div>
  );
}
