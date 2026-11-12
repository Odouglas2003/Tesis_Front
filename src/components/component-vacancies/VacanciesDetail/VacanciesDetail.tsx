"use client";

import { Grid2, Box, Card, Divider, Button, Typography } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { useRouter } from "next/navigation";
import { Vacancie, Skill } from "@/types/interface";
import EditIcon from "@mui/icons-material/Edit";
import { formatDate } from "@/utils/utils";
import { useAppTheme } from "@/app/ThemeProviderClient";

interface VacanciesDetailProps {
  vacancie: Vacancie;
}

export default function VacanciesDetail({ vacancie }: VacanciesDetailProps) {
  const router = useRouter();
  const { colors } = useAppTheme();

  const handleBack = () => {
    router.push("/pages/vacantes");
  };

  const getProject = () => {
    if (vacancie.projectId && vacancie.projectId.name) {
      return vacancie.projectId.name + " - " + vacancie.projectId.client;
    } else {
      return "No asignado a un proyecto";
    }
  };

  return (
    <Grid2
      container
      sx={{
        maxWidth: 1320,
        mx: "auto",
        px: { xs: 2, md: 3 },
        width: "100%",
      }}
    >
      <Grid2 size={12}>
        <Grid2
          onClick={handleBack}
          sx={{
            width: "97px",
            height: "36px ",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <KeyboardArrowLeftIcon
            sx={{ width: "24px", height: "24px", color: "#12304D" }}
          />

          <Typography
            sx={{
              textAlign: "center",
              color: "#12304D",
              fontSize: "24px",
              fontFamily: "inherit",
              fontWeight: 400,
            }}
          >
            Volver
          </Typography>
        </Grid2>
      </Grid2>
      <Grid2 size={12} mt={"30px"}>
        <Card
          elevation={6}
          sx={{
            width: { xs: "90%", md: "100%" },
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Grid2 mt={"75px"} mb={"75px"} ml={"40px"} mr={"40px"}>
            <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 24, md: "40px" },
                    fontFamily: "inherit",
                    fontWeight: 600,
                    color: "#12304D",
                  }}
                >
                  {vacancie.vacancieName}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() =>
                    router.push(`/pages/edit/vacancie/${vacancie.id}`)
                  }
                  sx={{
                    background: colors?.button || "#72E6D9",
                    borderRadius: "8px",
                    padding: "0 16px",
                    fontFamily: "inherit",
                    fontWeight: 600,
                    fontSize: "14px",
                    height: "44px",
                    color: "#FFFFFF",
                    boxShadow: "none",
                    textTransform: "none",
                    "&:hover": {
                      background: "#174E85",
                      boxShadow: "none",
                    },
                  }}
                >
                  Editar
                </Button>
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: 24, md: "24px" },
                  fontFamily: "inherit",
                  fontWeight: 500,
                  color: "#1D5FA0",
                }}
              >
                {getProject()}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 18, md: "18px" },
                  fontFamily: "inherit",
                  fontWeight: 400,
                  color: "#666",
                }}
              >
                Ultima vez editado por: {vacancie.last_edited_by}{" "}
                {formatDate(vacancie.last_edited_on)}
              </Typography>
            </Box>
            <Divider sx={{ bgcolor: "#E2E8EF" }} />
            {vacancie ? (
              <Grid2
                sx={{ display: "flex", flexDirection: "column" }}
                mt={"24px"}
              >
                <InfoRow label="Seniority" value={vacancie.seniority} />
                <InfoRow label="Horas requeridas" value={vacancie.time} />
                <InfoRow label="Project Manager" value={vacancie.manager_name || "-"} />
                <InfoRow
                  label="Fecha de pedido"
                  value={formatDate(vacancie.orderDate)}
                />
                <InfoRow
                  label="Fecha de inicio"
                  value={formatDate(vacancie.startDate)}
                />
                <InfoRow label="Descripción" value={vacancie.description || "-"} />
                <InfoRow label="Tecnologías" value={vacancie.skills} />
              </Grid2>
            ) : (
              <Typography>
                No se encontraron detalles para esta vacante.
              </Typography>
            )}{" "}
          </Grid2>
        </Card>
      </Grid2>
    </Grid2>
  );
}

interface InfoRowProps {
  label: string;
  value: string | number | Skill[]; // Update to accept Skill array
}
function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Typography
      sx={{
        fontSize: { xs: 18, md: "20px" },
        fontWeight: 400,
        fontFamily: "inherit",
        color: "#12304D",
        letterSpacing: "0px",
        marginBottom: "20px",
      }}
    >
      {label}:{" "}
      {Array.isArray(value) && value.length > 0 ? (
        <>
          {value.map((item: Skill, index) => (
            <Box
              display={"flex"}
              ml={5}
              key={index}
              component="span"
              sx={{ fontWeight: 400 }}
            >
              {"- " + item.name}
            </Box>
          ))}
        </>
      ) : (
        <>
          <Box component="span" sx={{ fontWeight: 400 }}>
            {Array.isArray(value) ? (
              value.map((item: Skill, index: number) => (
                <Box
                  display={"flex"}
                  ml={5}
                  key={index}
                  component="span"
                  sx={{ fontWeight: 400 }}
                >
                  {"- " + item.name}
                </Box>
              ))
            ) : (
              <Box component="span" sx={{ fontWeight: 400 }}>
                {value}
              </Box>
            )}
          </Box>
        </>
      )}
    </Typography>
  );
}
