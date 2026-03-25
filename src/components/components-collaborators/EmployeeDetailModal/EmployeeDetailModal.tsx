// src/components/employees/BizneoDetailModal.tsx
import React from "react";
import {
    Dialog, DialogTitle, DialogContent,
    Grid, Typography, Avatar, IconButton, CircularProgress, Box, Chip, Divider, Paper, Stack,
    SxProps, Theme
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import HomeIcon from "@mui/icons-material/Home";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import MailIcon from "@mui/icons-material/Mail";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import RoomIcon from "@mui/icons-material/Room";
import BadgeIcon from "@mui/icons-material/Badge";
import ShieldIcon from "@mui/icons-material/Shield";
import { Props } from "@/types/interface";
import { formatDate } from "@/utils/utils";
import { useAppTheme } from "@/app/ThemeProviderClient";

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <Box>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>{label}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }} component="div">{value ?? "-"}</Typography>
    </Box>
);

const Section: React.FC<{ title: React.ReactNode; children: React.ReactNode; sx?: SxProps<Theme> }> = ({ title, children, sx }) => {
    const base: SxProps<Theme> = { p: 2, borderRadius: 2, color: 'rgba(0,0,0,0.87)' };
    // normalize sx into an array of SxProps<Theme>
    const extra: SxProps<Theme>[] = Array.isArray(sx) ? (sx as SxProps<Theme>[]) : sx ? [sx] : [];
    return (
        <Paper variant="outlined" sx={[base, ...extra] as SxProps<Theme>}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>{title}</Typography>
            <Divider sx={{ mb: 2 }} />
            {children}
        </Paper>
    );
};

const BizneoDetailModal: React.FC<Props> = ({ open, onClose, loading, error, data }) => {
    const fullname = `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim() || "Colaborador";
    const birth = data?.birthday ? formatDate(data.birthday) : "-";
    const start = data?.contract?.start_at ? formatDate(data.contract.start_at) : "-";
    const end = data?.contract?.end_at ? formatDate(data.contract.end_at) : "-";
    const accessOk = (data?.access || "").toLowerCase() === "enabled";
    const contractStatus = data?.contract?.status === "active";
    const { colors } = useAppTheme();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth
            PaperProps={{
                sx: {   
                    borderRadius: 4,               
                    boxShadow: 8,  
                    bgcolor: '#fff',                
                },
            }}>
            <DialogTitle sx={{ p: 0 }}>
                <Box sx={{ bgcolor: colors?.navbar || "#0f6fcd", color: "white", py: 2.5, px: 3, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: .3 }}>
                        Información del Colaborador
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8, color: "white" }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 1 }}>
                {loading ? (
                    <Box display="flex" alignItems="center" justifyContent="center" py={8}><CircularProgress /></Box>
                ) : error ? (
                    <Typography color="error" sx={{ p: 2 }}>{error}</Typography>
                ) : (
                    <Stack spacing={2.5}>
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2 ,  bgcolor: "#ffffffff" }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md="auto">
                                    <Avatar
                                        src={data?.image || undefined}
                                        alt={fullname}
                                        sx={{ width: 96, height: 96, borderRadius: 2, boxShadow: 1 }}
                                    />
                                </Grid>
                                <Grid item xs>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgba(0,0,0,0.87)' }}>{fullname}</Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 1 }}>
                                        <WorkIcon fontSize="small" /> {data?.role || "-"} {data?.seniority ? `· ${data.seniority}` : ""}
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 1.2 }} useFlexGap flexWrap="wrap">
                                        <Chip
                                            icon={<ShieldIcon />}
                                            label={accessOk ? "Acceso habilitado" : "Acceso revocado"}
                                            size="small"
                                            color={accessOk ? "success" : "default"}
                                            variant={accessOk ? "filled" : "outlined"}
                                        />
                                        <Chip
                                            icon={<AssignmentIndIcon />}
                                            label={contractStatus ? "Contrato vigente" : "Contrato inactivo"}
                                            size="small"
                                            color={contractStatus ? "primary" : "default"}
                                            variant={contractStatus ? "filled" : "outlined"}
                                        />
                                        {data?.bizneoId && (
                                            <Chip sx={{ color: 'rgba(0,0,0,0.87)' }} icon={<BadgeIcon />} label={`Bizneo ID: ${data.bizneoId}`} size="small" variant="outlined" />
                                        )}
                                        {data?.dni && (
                                            <Chip sx={{ color: 'rgba(0,0,0,0.87)' }} icon={<BadgeIcon />} label={`DNI: ${data.dni}`} size="small" variant="outlined" />
                                        )}
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Paper>


                        <Section sx={{ bgcolor: "#ffffffff" }} title={<><AssignmentIndIcon sx={{ mr: 1 }} /> Información personal</>}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}><Field label="Nombre" value={data?.first_name} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="Apellido" value={data?.last_name} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="Género" value={data?.gender} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="Estado civil" value={data?.marital_status} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="Fecha de nacimiento" value={birth} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="Alias" value={data?.alias} /></Grid>
                            </Grid>
                        </Section>

                        <Section  sx={{ bgcolor: "#ffffffff" }} title={<><HomeIcon sx={{ mr: 1 }} /> Contacto y domicilio</>}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}><Field label="Email" value={<Box display="flex" alignItems="center" gap={1}><MailIcon fontSize="small" />{data?.email}</Box>} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="Email alternativo" value={data?.alt_email} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="Teléfono" value={<Box display="flex" alignItems="center" gap={1}><PhoneIphoneIcon fontSize="small" />{data?.phone ?? data?.company_phone}</Box>} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="País" value={data?.country} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="Provincia" value={data?.province} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="Ciudad / Localidad" value={data?.city} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="Municipio" value={data?.municipality} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="Barrio" value={data?.neighborhood} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="Dirección" value={<Box display="flex" alignItems="center" gap={1}><RoomIcon fontSize="small" />{data?.address}</Box>} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="C.P." value={data?.zip} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="Piso" value={data?.piso} /></Grid>
                                <Grid item xs={12} sm={6} md={4}><Field label="Dpto" value={data?.dpto} /></Grid>
                            </Grid>
                        </Section>


                        <Section  sx={{ bgcolor: "#ffffffff" }} title={<><WorkIcon sx={{ mr: 1 }} /> Contrato y compañía</>}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}><Field label="Inicio contrato" value={<><CalendarMonthIcon fontSize="small" style={{ verticalAlign: 'middle' }} /> {start}</>} /></Grid>
                                <Grid item xs={12} sm={6} md={3}><Field label="Fin contrato" value={<><CalendarMonthIcon fontSize="small" style={{ verticalAlign: 'middle' }} /> {end}</>} /></Grid>
                                <Grid item xs={12} sm={6} md={3}><Field label="FTE" value={data?.contract?.fte ?? "-"} /></Grid>
                                <Grid item xs={12} sm={6} md={3}><Field label="Último acceso" value={data?.last_login_at ? formatDate(data.last_login_at) : "-"} /></Grid>
                            </Grid>
                        </Section>


                        <Section  sx={{ bgcolor: "#ffffffff" }} title={<><SchoolIcon sx={{ mr: 1 }} /> Educación</>}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}><Field label="Nivel" value={data?.nivel} /></Grid>
                                <Grid item xs={12} sm={6} md={3}><Field label="Nivel (2)" value={data?.nivel_2} /></Grid>
                                <Grid item xs={12} sm={6} md={3}><Field label="Carrera" value={data?.carrera} /></Grid>
                                <Grid item xs={12} sm={6} md={3}><Field label="Carrera (2)" value={data?.carrera_2} /></Grid>
                                <Grid item xs={12} sm={6} md={3}><Field label="Estado" value={data?.estado_carrera} /></Grid>
                            </Grid>
                        </Section>
                    </Stack>
                )}
            </DialogContent>

        </Dialog>
    );
};

export default BizneoDetailModal;
