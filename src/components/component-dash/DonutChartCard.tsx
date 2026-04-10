import { Card, CardContent, Typography, Box } from "@mui/material"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useAppTheme } from "@/app/ThemeProviderClient";

interface DonutChartData {
    name: string
    value: number
    color: string
}

interface DonutChartCardProps {
    title: string
    data: DonutChartData[]
    total: number
}

export default function DonutChartCard({ title, data, total }: DonutChartCardProps) {
    const { colors } = useAppTheme();
    return (
        <Card 
            sx={{ 
                height: { xs: "280px", sm: "320px", md: "340px" }, 
                borderRadius: { xs: "16px", sm: "20px" }, 
                width: "100%", 
                maxWidth: "100%",
                boxSizing: "border-box",
                backgroundColor: colors?.card || '#FCFEFF'
            }}
        >
            <CardContent sx={{ 
                p: { xs: "12px", sm: "16px" },
                height: "100%",
                display: "flex",
                flexDirection: "column"
            }}>
                <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                        fontFamily: "Poppins", 
                        fontWeight: 600, 
                        color: colors?.primary || "#12304D",
                        fontSize: { xs: "14px", sm: "16px" },
                        mb: { xs: 1, sm: 2 }
                    }}
                >
                    {title}
                </Typography>

                <Box sx={{ 
                    position: "relative", 
                    height: { xs: 140, sm: 160, md: 173 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: { xs: 1, sm: 2 } // Agregar margen inferior
                }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={data} 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={60}
                                outerRadius={75}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            textAlign: "center",
                        }}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontSize: { xs: "12px", sm: "14px" }, 
                                fontWeight: 500, 
                                color: "rgba(18,48,77,0.58)", 
                                fontFamily: "Poppins" 
                            }}
                        >
                            Total
                        </Typography>
                        <Typography 
                                variant="h4" 
                            component="div" 
                            sx={{ 
                                fontWeight: 600, 
                                fontSize: { xs: "24px", sm: "28px", md: "32px" }, 
                                color: colors?.primary || "#12304D", 
                                fontFamily: "Poppins",
                                lineHeight: 1
                            }}
                        >
                            {total}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start", 
                        flexWrap: "wrap",
                        gap: { xs: "8px", sm: "12px" }, 
                        minHeight: { xs: "60px", sm: "80px" }, 
                        overflow: "visible" 
                    }}
                >
                    {data.map((item, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px", 
                                minWidth: "fit-content", 
                                mb: { xs: "4px", sm: "6px" } 
                            }}
                        >
                            <Box
                                sx={{
                                    width: { xs: 10, sm: 12 },
                                    height: { xs: 10, sm: 12 },
                                    borderRadius: "50%",
                                    bgcolor: item.color,
                                    flexShrink: 0
                                }}
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: { xs: "11px", sm: "13px" }, 
                                    fontWeight: 500,
                                    color: "rgba(18,48,77,0.72)",
                                    fontFamily: "Poppins",
                                    whiteSpace: "nowrap",
                                    overflow: "visible" 
                                }}
                            >
                                {item.name} ({item.value})
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    )
}
