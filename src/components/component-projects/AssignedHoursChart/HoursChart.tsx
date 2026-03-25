import { Box, Typography } from "@mui/material";
import { PieChart, Pie, Cell } from "recharts";

export interface Collaborator {
  name: string;
  hours: number;
  color?: string;
}

export interface CollaboratorChartProps {
  collaborators?: Collaborator[];
}

export default function CollaboratorChart({
  collaborators = [],
}: CollaboratorChartProps) {
  const defaultColors = ["#8BB4F7", "#23FFDC", "#4D7FED", "#FFB74D", "#AED581","#FF6F61","#FFD54F","#BA68C8","#7986CB","#E0A0FF","#D980FA","#8C63FF","#A29BFF","#F090C5","#C9B8FF","#B572FF","#9C6CFF","#B096FF","#C4A4FF","#D1AEFF","#E4B5FF","#EED3FF","#F6E7FF","#FFF8FF"];

  const enriched = collaborators.map((c, i) => ({
    ...c,
    color: c.color ?? defaultColors[i % defaultColors.length],
  }));
  const chartData = enriched.map((c) => ({
    name: c.name,
    value: c.hours,
    color: c.color!,
  }));

  const size = 150;
  const radius = size / 2;
  const strokeWidth = 24;
  const innerRadius = radius - strokeWidth;

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box mb={2}>
        <PieChart width={size} height={size}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={radius}
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </Box>
       <Box
        display="grid"
        gridTemplateColumns="repeat(4, auto)"
        gap={2}
        justifyItems="center"
      >
        {enriched.map((c, i) => (
          <Box key={i} display="flex" alignItems="center" mx={2}>
            <Box
              sx={{
                width: 8,
                height: 8,
                bgcolor: c.color,
                borderRadius: "50%",
                marginBottom: "22px",
                mr: 1,
              }}
            />
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "#121212",
                  fontFamily: "Poppins",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "130px",
                }}
              >
                {c.name}
              </Typography>
              <Typography variant="subtitle2"
               sx={{
                  fontSize: "12px",
                  fontWeight: 300,
                  fontFamily: "Poppins",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "130px",
                }}>{c.hours}hs</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
