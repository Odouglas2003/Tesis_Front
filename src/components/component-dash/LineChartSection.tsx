import { Box, Typography } from "@mui/material";
import { UI, cardSx } from "@/theme/appPalette";

interface LineChartSectionProps {
  title: string;
  data: Array<{ name: string; value: number }>;
}

const shortLabel = (name: string) => {
  const clean = String(name ?? "").trim();
  return clean.length > 4 ? clean.slice(0, 3) : clean;
};

// Contrataciones por mes como barras: con valores enteros y bajos se lee mejor que una curva.
export default function LineChartSection({ title, data }: LineChartSectionProps) {
  const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const max = Math.max(1, ...data.map((item) => Number(item.value) || 0));
  const chartHeight = 170;

  return (
    <Box
      component="section"
      sx={{ ...cardSx, p: 3, height: "100%", display: "flex", flexDirection: "column", gap: 2.5 }}
    >
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap" }}>
        <Typography component="h2" sx={{ fontSize: "1rem", fontWeight: 700, color: UI.ink }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: "0.8125rem", color: UI.muted }}>
          <Box component="strong" sx={{ color: UI.ink, fontVariantNumeric: "tabular-nums" }}>{total}</Box> en total
        </Typography>
      </Box>

      <Box
        role="img"
        aria-label={`${title}: ${data.map((d) => `${d.name} ${d.value}`).join(", ")}`}
        sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, justifyContent: "flex-end" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: { xs: 0.5, sm: 1.25 },
            height: chartHeight + 26,
            borderBottom: `1px solid ${UI.border}`,
          }}
        >
          {data.map((item, index) => {
            const value = Number(item.value) || 0;
            return (
              <Box
                key={`${item.name}-${index}`}
                title={`${item.name}: ${value}`}
                sx={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75 }}
              >
                <Typography
                  component="span"
                  sx={{ fontSize: "0.75rem", fontWeight: 700, color: UI.inkSoft, lineHeight: 1, minHeight: 12, fontVariantNumeric: "tabular-nums" }}
                >
                  {value > 0 ? value : ""}
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 44,
                    height: value > 0 ? Math.max(6, Math.round((value / max) * chartHeight)) : 2,
                    backgroundColor: value > 0 ? UI.blue : "#C3CDD8",
                    borderRadius: "4px 4px 0 0",
                  }}
                />
              </Box>
            );
          })}
        </Box>
        <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1.25 } }}>
          {data.map((item, index) => (
            <Typography
              key={`${item.name}-label-${index}`}
              component="span"
              sx={{ flex: "1 1 0", minWidth: 0, textAlign: "center", fontSize: "0.75rem", color: UI.muted, overflow: "hidden", whiteSpace: "nowrap" }}
            >
              {shortLabel(item.name)}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
