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
        marginLeft: "55px",
        marginRight: "55px",
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
            sx={{ width: "24px", height: "24px", color: "#002338" }}
          />

          <Typography
            sx={{
              textAlign: "center",
              color: "#002338",
              fontSize: "24px",
              fontFamily: "Poppins",
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
            borderRadius: "20px",
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
                    fontFamily: "Poppins",
                    fontWeight: 600,
                    color: "#002338",
                  }}
                >
                  {vacancie.vacancieName}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<EditIcon sx={{ color: "#002338" }} />}
                  onClick={() =>
                    router.push(`/pages/edit/vacancie/${vacancie.id}`)
                  }
                  sx={{
                    background: colors?.button || "#1CFFF9",
                    borderRadius: "20px",
                    padding: "12px 41px",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 500,
                    fontSize: "20px",
                    height: "50px",
                    color: "#002338",
                    boxShadow: "none",
                    textTransform: "none",
                    "&:hover": {
                      background: "#1CFFF9",
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
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  color: "#0087FF",
                }}
              >
                {getProject()}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 18, md: "18px" },
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  color: "#666",
                }}
              >
                Ultima vez editado por: {vacancie.last_edited_by}{" "}
                {formatDate(vacancie.last_edited_on)}
              </Typography>
            </Box>
            <Divider sx={{ bgcolor: "#002338" }} />
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
        fontFamily: "Poppins",
        color: "#002338",
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
