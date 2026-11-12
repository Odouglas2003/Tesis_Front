import { Box, Typography } from "@mui/material";
import { UI, cardSx } from "@/theme/appPalette";

interface BarChartData {
  name: string;
  series1: number;
  series2: number;
}

interface BarChartCardProps {
  title: string;
  data: BarChartData[];
  xAxisLabel: string;
  color?: string;
  labelWidth?: number;
}

// Ranking horizontal: nombre, barra fina y cantidad.
export default function BarChartCard({ title, data, xAxisLabel, color = UI.blue, labelWidth = 110 }: BarChartCardProps) {
  const max = Math.max(1, ...data.map((item) => Number(item.series1) || 0));

  return (
    <Box
      component="section"
      sx={{ ...cardSx, p: 3, height: "100%", display: "flex", flexDirection: "column", gap: 2.5 }}
    >
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap" }}>
        <Typography component="h2" sx={{ fontSize: "1rem", fontWeight: 700, color: UI.ink }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: "0.8125rem", color: UI.muted }}>{xAxisLabel}</Typography>
      </Box>

      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.75 }}>
        {data.map((item) => {
          const value = Number(item.series1) || 0;
          return (
            <Box component="li" key={item.name} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography
                component="span"
                title={item.name}
                sx={{
                  flex: { xs: "0 0 96px", sm: `0 0 ${labelWidth}px` },
                  fontSize: "0.8125rem",
                  color: UI.inkSoft,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.name}
              </Typography>
              <Box sx={{ flex: 1, height: 8, borderRadius: "999px", backgroundColor: UI.track, overflow: "hidden" }}>
                <Box sx={{ width: `${(value / max) * 100}%`, height: "100%", backgroundColor: color, borderRadius: "999px" }} />
              </Box>
              <Typography
                component="span"
                sx={{ flex: "0 0 28px", textAlign: "right", fontSize: "0.8125rem", fontWeight: 700, color: UI.ink, fontVariantNumeric: "tabular-nums" }}
              >
                {value}
              </Typography>
            </Box>
          );
        })}
        {data.length === 0 && (
          <Typography component="li" sx={{ fontSize: "0.875rem", color: UI.muted }}>
            Sin datos todavía.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
