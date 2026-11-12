import { Box } from "@mui/material";
import { People, Work, Language, Psychology } from "@mui/icons-material";
import StatsCard from "./StatsCards";
import LineChartSection from "./LineChartSection";
import DonutChartCard from "./DonutChartCard";
import BarChartCard from "./BarChartCard";
import { DashboardData } from "@/types/interface";

export default function Dash({ metricsProp }: { metricsProp: DashboardData }) {
  const {
    metricasClave,
    contratacionesMensuales,
    estadoDeProyectos,
    estadoDeAsignacion,
    tecnologiasTop,
    personasPorProyecto,
  } = metricsProp;

  const enCursoCount =
    Number(estadoDeProyectos?.porEstado?.["Activo"] ?? 0) +
    Number(estadoDeProyectos?.porEstado?.["En curso"] ?? 0);

  const statsData = [
    {
      icon: People,
      value: String(metricasClave.totalColaboradores),
      label: "Colaboradores activos",
    },
    {
      icon: Work,
      value: String(enCursoCount),
      label: "Proyectos en curso",
    },
    {
      icon: Language,
      value: String(metricasClave.vacantesActivas),
      label: "Vacantes activas",
    },
    {
      icon: Psychology,
      value: String(metricasClave.totalTecnologias),
      label: "Tecnologías registradas",
    },
  ];

  const lineData = contratacionesMensuales.datos.map((d) => ({
    name: d.mes,
    value: d.nuevasContrataciones,
  }));

  const projectStatus = Object.entries(estadoDeProyectos.porEstado).map(
    ([name, value]) => ({
      name,
      value,
      color:
        name === "Activo" || name === "En curso"
          ? "#1D5FA0"
          : name === "Finalizado"
            ? "#14B8A6"
            : name === "En pausa"
              ? "#C2410C"
              : "#9DB4CA",
    })
  );

  const collaboratorStatus = Object.entries(estadoDeAsignacion.porEstado).map(
    ([name, value]) => ({
      name,
      value,
      color:
        name === "Sobreasignado"
          ? "#C2410C"
          : name === "Sin asignación"
            ? "#C3CDD8"
            : name === "Asignado"
              ? "#14B8A6"
              : name === "Subasignado"
                ? "#1D5FA0"
                : "#C3CDD8",
    })
  );

  const techData = tecnologiasTop.map((t) => ({
    name: t.nombre,
    series1: t.cantidad,
    series2: 0,
  }));

  const peoplePerProjectData = personasPorProyecto.map((p) => ({
    name: p.nombre,
    series1: p.cantidad,
    series2: 0,
  }));

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {statsData.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))", lg: "2fr 1fr 1fr" },
          gap: 2,
        }}
      >
        <Box sx={{ gridColumn: { md: "1 / -1", lg: "auto" }, minWidth: 0 }}>
          <LineChartSection title="Contrataciones por mes" data={lineData} />
        </Box>
        <DonutChartCard
          title="Estado de proyectos"
          data={projectStatus}
          total={estadoDeProyectos.total}
        />
        <DonutChartCard
          title="Estado de colaboradores"
          data={collaboratorStatus}
          total={estadoDeAsignacion.total}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <BarChartCard title="Tecnologías" data={techData} xAxisLabel="Colaboradores por tecnología" />
        <BarChartCard
          title="Proyectos"
          data={peoplePerProjectData}
          xAxisLabel="Colaboradores por proyecto"
          color="#14B8A6"
          labelWidth={220}
        />
      </Box>
    </Box>
  );
}
