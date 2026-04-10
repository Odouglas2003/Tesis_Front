import { Card, CardContent, Typography, Box } from "@mui/material"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { useAppTheme } from "@/app/ThemeProviderClient";

interface BarChartData {
  name: string
  series1: number
  series2: number
}

interface BarChartCardProps {
  title: string
  data: BarChartData[]
  xAxisLabel: string
}

export default function BarChartCard({ title, data }: BarChartCardProps) {
  const { colors } = useAppTheme();
  const primaryColor = colors?.navbar || '#438FF9';
  // Generar una variante más clara / baja intensidad
  const getSecondary = (hex: string) => {
    // Si es formato #RRGGBB
    if (/^#?[0-9a-fA-F]{6}$/.test(hex)) {
      const h = hex.replace('#','');
      const r = parseInt(h.slice(0,2),16);
      const g = parseInt(h.slice(2,4),16);
      const b = parseInt(h.slice(4,6),16);
      // Factor más bajo para que NO quede tan claro (menos mezcla con blanco)
      const factor = 0.25; // 0.25 => sutil aclarado
      const rr = Math.round(r + (255 - r) * factor);
      const gg = Math.round(g + (255 - g) * factor);
      const bb = Math.round(b + (255 - b) * factor);
  return `rgba(${rr}, ${gg}, ${bb}, 1)`; 
    }
    return 'rgba(0,0,0,0.3)';
  };
  const secondaryColor = getSecondary(primaryColor);
  return (
    <Card sx={{
      height: { xs: "400px", sm: "500px", md: "600px", lg: "649px" },
      width: "100%",
      maxWidth: "100%",
      borderRadius: { xs: "20px", sm: "30px", md: "38.38px" },
      boxSizing: "border-box",
      backgroundColor: colors?.card || '#FCFEFF'
    }}>
      <CardContent sx={{
        p: { xs: 2, sm: 3 },
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}>
        <Typography sx={{
          mb: { xs: 1, sm: 2 },
          fontFamily: "Poppins, sans-serif",
          fontSize: { xs: "14px", sm: "16px" },
          fontWeight: 600,
          color: colors?.primary || "#12304D"
        }}>
          {title}
        </Typography>

        <Box sx={{
          height: { xs: 320, sm: 420, md: 520, lg: 570 },
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                barSize={50}
                margin={{
                  right: 30,
                  bottom: 5,
                  left: 40
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(18,48,77,0.10)" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "rgba(18,48,77,0.58)"
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: colors?.primary || "#12304D",
                    fontFamily: "Poppins, sans-serif"
                  }}
                  interval={0}
                  tickFormatter={(value) => {
                    if (typeof value === 'string' && window.innerWidth < 600) {
                      return value.length > 8 ? value.substring(0, 8) + '...' : value;
                    }
                    return value;
                  }}
                />
                <Bar
                  dataKey="series1"
                  radius={[0, 4, 4, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? primaryColor : secondaryColor}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ position: 'relative', width: '100%', height: 0 }}>
            <Typography
              sx={{
                position: 'absolute',
                top: -32,
                left: 0,
                fontSize: { xs: '13px', sm: '15px' },
                color: colors?.primary || '#12304D',
                fontWeight: 700,
                fontFamily: 'Poppins, sans-serif',
                textAlign: 'left',
                letterSpacing: 0.2,
                userSelect: 'none',
                background: colors?.card || '#FCFEFF',
                px: 0.5,
              }}
            >
              Colaboradores
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
