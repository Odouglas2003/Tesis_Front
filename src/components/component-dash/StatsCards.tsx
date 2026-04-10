"use client";

import { Card, CardContent, Box, Typography, Avatar } from "@mui/material"
import type { SvgIconComponent } from "@mui/icons-material"
import { useAppTheme } from "@/app/ThemeProviderClient";
import { useRouter } from "next/navigation";

interface StatsCardProps {
    icon: SvgIconComponent
    value: string
    label: string
}

export default function StatsCard({ icon: Icon, value, label }: StatsCardProps) {
    const { colors } = useAppTheme();
    const router = useRouter();

    const getPathForLabel = (lbl: string) => {
        const key = lbl?.toLowerCase?.().trim() ?? "";
        if (key.includes("proyecto") || key.includes("proyectos")) return "/pages/projects";
        if (key.includes("vacante") || key.includes("vacantes")) return "/pages/vacantes";
        if (key.includes("colaborador") || key.includes("colaboradores")) return "/pages/collaborators";
        // Tecnologías should not redirect
        return null;
    };

    const targetPath = getPathForLabel(label);
    return (
        <Card
            onClick={() => {
                if (targetPath) router.push(targetPath);
            }}
            role={targetPath ? 'button' : undefined}
            tabIndex={targetPath ? 0 : -1}
            sx={{
                width: '100%',
                height: { xs: 90, sm: 110, md: 120 },
                background: colors?.miniCard,
                border: '1px solid rgba(18,48,77,0.08)',
                borderRadius: { xs: '12px', sm: '16px', md: '20px' },
                overflow: 'hidden',
                boxSizing: 'border-box',
                minWidth: 0,
                boxShadow: '0 16px 36px rgba(18,48,77,0.08)',
                transition: 'background .25s ease, border-color .25s ease, transform .2s ease, box-shadow .2s ease',
                cursor: targetPath ? 'pointer' : 'default',
                '&:hover': targetPath
                    ? {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 22px 44px rgba(18,48,77,0.12)',
                          '& .stat-value': {
                              fontSize: { xs: '19px', sm: '25px', md: '29px', lg: '33px' },
                          },
                          '& .stat-avatar': {
                              transform: 'scale(1.06)'
                          },
                          '& .stat-icon': {
                              fontSize: { xs: 22, sm: 30, md: 38 }
                          }
                      }
                    : {},
            }}
        >
            <CardContent
                sx={{
                    pt: { xs: '12px', sm: '16px', md: '20px' },
                    px: { xs: 1, sm: 1.5, md: 2 },
                    pb: { xs: '12px', sm: '16px', md: '20px' },
                    '&:last-child': { pb: { xs: '12px', sm: '16px', md: '20px' } },
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: '8px', sm: '12px', md: '20px' },
                        width: '100%',
                    }}
                >
                    <Avatar
                        className="stat-avatar"
                        sx={{
                            bgcolor: colors?.card || '#FCFEFF',
                            color: colors?.primary || '#12304D',
                            width: { xs: 40, sm: 50, md: 60 },
                            height: { xs: 40, sm: 50, md: 60 },
                            flexShrink: 0,
                            boxShadow: '0 10px 25px rgba(18,48,77,0.10)',
                            transition: 'background .25s ease, color .25s ease, transform .12s ease',
                        }}
                    >
                        <Icon
                            className="stat-icon"
                            fontSize="small"
                            sx={{
                                fontSize: { xs: 20, sm: 28, md: 36 },
                                color: colors?.primary || '#12304D',
                                transition: 'font-size .12s ease, transform .12s ease',
                            }}
                        />
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            className="stat-value"
                            variant="h4"
                            component="div"
                            sx={{
                                fontWeight: 'semi-bold',
                                color: colors?.primary || '#12304D',
                                fontSize: { xs: '18px', sm: '24px', md: '28px', lg: '32px' },
                                transition: 'font-size .12s ease',
                                fontFamily: 'Poppins, sans-serif',
                                mb: { xs: 0, sm: 0.5 },
                                lineHeight: 1.1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {value}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(18,48,77,0.76)',
                                fontSize: { xs: '10px', sm: '12px', md: '14px', lg: '16px' },
                                fontFamily: 'Poppins, sans-serif',
                                lineHeight: 1.2,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }}
                        >
                            {label}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
