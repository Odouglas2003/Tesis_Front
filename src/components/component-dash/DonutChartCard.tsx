import { Box, Typography } from "@mui/material";
import { UI, cardSx } from "@/theme/appPalette";

interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartCardProps {
  title: string;
  data: DonutChartData[];
  total: number;
}

// Distribución por estado: barra apilada + lista con cantidades (antes era un gráfico de dona).
export default function DonutChartCard({ title, data, total }: DonutChartCardProps) {
  const sum = data.reduce((acc, item) => acc + (Number(item.value) || 0), 0);

  return (
    <Box
      component="section"
      sx={{ ...cardSx, p: 3, height: "100%", display: "flex", flexDirection: "column", gap: 2.5 }}
    >
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1.5 }}>
        <Typography component="h2" sx={{ fontSize: "1rem", fontWeight: 700, color: UI.ink }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: "0.8125rem", color: UI.muted, whiteSpace: "nowrap" }}>
          {total} en total
        </Typography>
      </Box>

      <Box
        aria-hidden
        sx={{ display: "flex", gap: "3px", height: 10, borderRadius: "999px", overflow: "hidden", backgroundColor: UI.track }}
      >
        {sum > 0 &&
          data
            .filter((item) => Number(item.value) > 0)
            .map((item) => (
              <Box key={item.name} sx={{ width: `${(Number(item.value) / sum) * 100}%`, backgroundColor: item.color }} />
            ))}
      </Box>

      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {data.map((item) => (
          <Box component="li" key={item.name} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "3px", backgroundColor: item.color, flexShrink: 0 }} />
            <Typography component="span" sx={{ flex: 1, minWidth: 0, fontSize: "0.875rem", color: UI.inkSoft }}>
              {item.name}
            </Typography>
            <Typography component="span" sx={{ fontSize: "0.875rem", fontWeight: 700, color: UI.ink, fontVariantNumeric: "tabular-nums" }}>
              {item.value}
            </Typography>
          </Box>
        ))}
        {data.length === 0 && (
          <Typography component="li" sx={{ fontSize: "0.875rem", color: UI.muted }}>
            Sin datos todavía.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
