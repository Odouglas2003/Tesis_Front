import { Grid, Box } from "@mui/material";
import StatsCard from "./StatsCards";
import LineChartSection from "./LineChartSection";
import DonutChartCard from "./DonutChartCard";
import BarChartCard from "./BarChartCard";
import { People, Work, Language, Psychology } from "@mui/icons-material";
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
  const enCursoCount =(estadoDeProyectos?.porEstado?.["En curso"] as number) ??0;

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
        name === "En curso"
          ? "#26A69A"
          : name === "Finalizado"
            ? "#29B6F6"
            : "#546E7A",
    })
  );
const collaboratorStatus = Object.entries(estadoDeAsignacion.porEstado).map(
  ([name, value]) => ({
    name,
    value,
    color:
      name === "Sobreasignado"
        ? "#C62828" 
        : name === "Sin asignación"
          ? "#9E9E9E" 
          : name === "Asignado"
            ? "#00796B" 
            : name === "Subasignado"
              ? "#0087FF" 
              : "#9E9E9E", 
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
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        px: '55px',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Sección de estadísticas principales */}
      <Grid
        container
        spacing={{ xs: 1.5, sm: 2, md: 3 }}
        sx={{
          mb: { xs: 2, sm: 3 },
          width: '100%',
          mx: 0,
        }}
      >
        {statsData.map((stat, idx) => (
          <Grid
            item
            key={idx}
            xs={6}
            sm={6}
            md={6}
            lg={3}
            sx={{
              display: 'flex',
              '& > *': { width: '100%' }
            }}
          >
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>
      {/* Sección de gráficos principales */}
      <Grid
        container
        spacing={{ xs: 1.5, sm: 2, md: 3 }}
        sx={{
          mb: { xs: 3, sm: 4 },
          width: '100%',
          mx: 0,
        }}
      >
        <Grid item xs={12} lg={6}>
          <LineChartSection
            title={contratacionesMensuales.titulo}
            data={lineData}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <DonutChartCard
            title="Estado de proyectos"
            data={projectStatus}
            total={estadoDeProyectos.total}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <DonutChartCard
            title="Estado de colaboradores"
            data={collaboratorStatus}
            total={estadoDeAsignacion.total}
          />
        </Grid>
      </Grid>
      {/* Sección de gráficos de barras */}
      <Grid
        container
        spacing={{ xs: 1.5, sm: 2, md: 3 }}
        sx={{
          width: '100%',
          mx: 0,
        }}
      >
        <Grid item xs={12} lg={6}>
          <BarChartCard
            title="Tecnologías"
            data={techData}
            xAxisLabel="Colaboradores"
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <BarChartCard
            title="Proyectos"
            data={peoplePerProjectData}
            xAxisLabel="Colaboradores"
          />
        </Grid>
      </Grid>
    </Box>
  );
}