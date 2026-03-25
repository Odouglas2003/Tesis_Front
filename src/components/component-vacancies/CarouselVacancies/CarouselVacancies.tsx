"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Card, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Vacancie } from "@/types/interface";
import { PieChart, Pie, Cell } from "recharts";

export default function CarouselVacancie({
  vacanciesProp,
}: {
  vacanciesProp: Vacancie[];
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [vacancies, setVacancies] = useState<Vacancie[]>([]);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    if (vacanciesProp.length > 0) {
      const filteredVacancies = vacanciesProp.filter(
        (vacante) => vacante.vacancieName && vacante.vacancieName.trim() !== ""
      );
      setVacancies(filteredVacancies);
    }
  }, [vacanciesProp]);

  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        setShowPrev(scrollLeft > 0);
        setShowNext(scrollLeft + clientWidth < scrollWidth);
      }
    };

    handleScroll();

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (carousel) {
        carousel.removeEventListener("scroll", handleScroll);
      }
    };
  }, [vacancies]);

  const groupedVacancies = useMemo(() => {
    const counts: { [vacante: string]: number } = {};

    vacancies.forEach((vacante) => {
      const vac = vacante.vacancieName;
      if (vacante) {
        counts[vac] = (counts[vac] || 0) + 1;
      }
    });

    const total = vacancies.length;

    return Object.entries(counts).map(([nombre, count]) => ({
      nombre,
      porcentaje: ((count / total) * 100).toFixed(0),
      cantidad: count,
    }));
  }, [vacancies]);

  const handleNext = () => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      carouselRef.current.scrollTo({
        left: scrollLeft + clientWidth,
        behavior: "smooth",
      });
    }
  };

  const handlePrev = () => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      carouselRef.current.scrollTo({
        left: scrollLeft - clientWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        marginLeft: { sm: "40px", md: "115px", lg: "85px", xl: "85px" },
        marginRight: { sm: "55px", md: "130px", lg: "85px", xl: "100px" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginX: showPrev || showNext ? "30px" : "0px",
        }}
      >
        {showPrev && (
          <IconButton
            onClick={handlePrev}
            sx={{
              position: "absolute",
              top: "50%",
              left: -10,
              transform: "translateY(-50%)",
              zIndex: 2,
              color: "#002338",
              "&:hover": {
                backgroundColor: "transparent",
                color: "#666666",
              },
            }}
          >
            <ArrowBackIcon sx={{ width: "24px", height: "24px" }} />
          </IconButton>
        )}

        <Box
          ref={carouselRef}
          sx={{
            display: "flex",
            gap: 2,
            py: 2,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            "& > *": { scrollSnapAlign: "center" },
            "::-webkit-scrollbar": { display: "none" },
          }}
        >
          {groupedVacancies.map((vac) => (
            <Card
              key={vac.nombre}
              sx={{
                backgroundColor: "#E3E5E7",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                minWidth: groupedVacancies.length <= 3 ? 431 : 243,
                height: 121,
                borderRadius: "20px",
                paddingTop: "20px",
                paddingLeft: "20px",
                paddingRight: "12px",
                paddingBottom: "11px",
              }}
              variant="outlined"
            >
              <Box
                sx={{
                  position: "relative",
                  width: 70,
                  height: 70,
                  marginRight: 2,
                }}
              >
                <PieChart width={70} height={70}>
                  <Pie
                    data={[
                      { name: "Vacante", value: Number(vac.porcentaje) },
                      { name: "Resto", value: 100 - Number(vac.porcentaje) },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={30}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    <Cell fill="#002338" />
                    <Cell fill="#0087FF" />
                  </Pie>
                </PieChart>

                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontWeight: 500,
                    fontSize: "16px",
                    color: "#002338",
                    fontFamily: "Poppins",
                  }}
                >
                  {vac.porcentaje}%
                </Box>
              </Box>

              <Box sx={{ marginLeft: 2 }}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: 500,
                    fontFamily: "Poppins",
                    color: "#002338",
                  }}
                >
                  {vac.nombre}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontFamily: "Poppins",
                    color: "#002338",
                  }}
                >
                  {vac.cantidad} vacantes disponibles
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>

        {showNext && (
          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              top: "50%",
              right: -10,
              transform: "translateY(-50%)",
              zIndex: 2,
              color: "#002338",
              "&:hover": {
                backgroundColor: "transparent",
                color: "#666666",
              },
            }}
          >
            <ArrowForwardIcon sx={{ width: "24px", height: "24px" }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
