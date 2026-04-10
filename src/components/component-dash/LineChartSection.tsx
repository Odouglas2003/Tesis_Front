import { Card, CardContent, Typography, Box,Chip } from "@mui/material"
import {TrendingUp} from "@mui/icons-material"
import {  YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { useAppTheme } from "@/app/ThemeProviderClient";

interface LineChartSectionProps {
  title: string
  data: Array<{ name: string; value: number }>
}

export default function LineChartSection({ title, data }: LineChartSectionProps) {
  const { colors } = useAppTheme();
  // Usar el color de la navbar del theme para el número y la línea del gráfico
  const lineColor = colors?.navbar || "#2196F3";
  return (
    <Card sx={{
      height: { xs: "280px", sm: "290px", md: "340px" },
      borderRadius: { xs: "16px", sm: "20px" },
      width: "100%", 
      maxWidth: "100%",
      boxSizing: "border-box",
      backgroundColor:  colors?.card || '#FCFEFF'
    }}>
      <CardContent sx={{
        p: { xs: 2, sm: 3 },
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}>
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 0 },
          mb: { xs: 2, sm: 3 }
        }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 500,
              fontSize: { xs: "14px", sm: "16px" },
              fontFamily: "Poppins, sans-serif",
              color: colors?.primary || "#12304D"
            }}
          >
            {title}
          </Typography>

        </Box>

        <Box sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: { xs: 2, sm: 3 }
        }}>
          <Typography
            variant="h3"
            component="div"
            sx={{
              fontWeight: 600,
              color: lineColor,
              fontSize: { xs: "20px", sm: "24px" },
              fontFamily: "Poppins, sans-serif"
            }}
          >
            {data.reduce((sum, item) => sum + item.value, 0)}
          </Typography>
          <Chip
            icon={<TrendingUp sx={{ fontSize: { xs: 14, sm: 16 } }} />}
            label="Actividad"
            size="small"
            sx={{
              bgcolor: "rgba(114,230,217,0.14)",
              color: colors?.secondary || "#2A6CA8",
              fontWeight: "bold",
              borderRadius: "999px",
              fontSize: { xs: "11px", sm: "13px" },
              height: { xs: 24, sm: 32 },
              "& .MuiChip-icon": {
                color: colors?.secondary || "#2A6CA8",
              },
              "& .MuiChip-label": {
                fontSize: { xs: "11px", sm: "13px" },
                px: { xs: 0.5, sm: 1 }
              }
            }}
          />
        </Box>

        <Box sx={{
          height: { xs: 120, sm: 140, md: 150 },
          flex: 1,
          minHeight: 0 
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 0,
                left: -40,
                bottom: 5
              }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(18,48,77,0.10)" />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: "rgba(18,48,77,0.60)"
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}
