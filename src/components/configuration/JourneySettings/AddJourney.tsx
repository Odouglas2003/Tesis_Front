import React, { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput
} from "@mui/material";
import { createJourney } from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";

type AddJourneyProps = {
    onCreated?: () => void;
};

export default function AddJourney({ onCreated }: AddJourneyProps) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        hours: 0,
        status: "true",
    });

    const [openModalConfirm, setOpenModalConfirm] = useState(false);
    const [modalVariant, setModalVariant] = useState<
        "success" | "error" | "warning"
    >("success");
    const [modalMessage, setModalMessage] = useState("");

    const handleInputChange =
        (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [field]: event.target.value });
        };

    const handleSave = async () => {
        const payload = {
            name: formData.name,
            description: formData.description,
            hours: formData.hours,
            status: formData.status ? true : false,
        };

        try {
            const response = await createJourney(payload);
            if (response.data || response.success || response) {
                setModalVariant("success");
                setModalMessage("Jornada de trabajo creada con éxito.");
                setOpenModalConfirm(true);
                setFormData({ name: "", description: "", hours: 0, status: "true" });
                onCreated?.();
            } else {
                throw new Error("Error al crear la jornada.");
            }
        } catch (error) {
            setModalVariant("error");
            setModalMessage("Hubo un error al crear la jornada. Inténtalo de nuevo.");
            setOpenModalConfirm(true);
        }
    };

    return (
        <>
            <Card
                sx={{
                    p: "20px",
                    boxShadow: 3,
                    borderRadius: "20px",
                    mb: 4,
                    width: "100%",
                    height: "302px",
                    bgcolor: "#FFFFFF",
                }}
            >
                <Box sx={{ mb: "20px" }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 600,
                            color: "#2c3e50",
                            fontFamily: "Poppins",
                            fontSize: "18px",
                        }}
                    >
                        Gestión de parámetros
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ fontSize: "16px", fontFamily: "Poppins", color: "#002338" }}
                    >
                        Modificá y creá parámetros para personalizar el comportamiento de la
                        aplicación.
                    </Typography>
                </Box>

                <Card
                    sx={{
                        border: "1px solid #C4C4C4",
                        borderRadius: "16px",
                        height: "200px",
                        bgcolor: "#FFFFFF",
                    }}
                >
                    <CardContent sx={{ p: 2, backgroundColor: '#ffffff' }}>
                        <Box sx={{ mb: 1 }}>
                            <Typography
                                variant="h6"
                                component="h2"
                                sx={{
                                    fontWeight: 600,
                                    fontFamily: "Poppins",
                                    fontSize: "18px",
                                    color: "#002338",
                                }}
                            >
                                Jornada de Trabajo
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontFamily: "Poppins",
                                    fontSize: "16px",
                                    color: "#002338",
                                }}
                            >
                                Registrar una Jornada de Trabajo
                            </Typography>
                        </Box>

                        <Grid container spacing={1} sx={{ mb: 2 }}>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    placeholder="Nombre completo"
                                    variant="outlined"
                                    label="Nombre completo"
                                    value={formData.name}
                                    onChange={handleInputChange("name")}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            height: "40px",
                                            borderRadius: "10px",
                                        },
                                        "& .MuiInputBase-input": {
                                            fontFamily: "Poppins",
                                            fontSize: "14px",
                                            padding: "8px 12px",
                                        },
                                    }}
                                    InputProps={{
                                        sx: { color: "#002338" }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={1}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    placeholder="Horas"
                                    variant="outlined"
                                    label="Horas"
                                    value={formData.hours}
                                    onChange={handleInputChange("hours")}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            height: "40px",
                                            borderRadius: "10px",
                                        },
                                        "& .MuiInputBase-input": {
                                            fontFamily: "Poppins",
                                            fontSize: "14px",
                                            padding: "8px 12px",
                                        },
                                    }}
                                    InputProps={{
                                        sx: { color: "#002338" }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl
                                    sx={{
                                        fontFamily: "Poppins",
                                        '& .MuiSelect-select': { color: '#002338' },
                                        "& .MuiOutlinedInput-root": {
                                            fontFamily: "Poppins",
                                            fontSize: "14px",
                                            height: "40px",
                                            borderRadius: "10px",
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                                    }}
                                    fullWidth
                                    size="small"

                                >
                                    <InputLabel id="estado-label">Activo</InputLabel>
                                    <Select
                                        name="status"
                                        value={"status" in formData ? String(formData.status) : ""}
                                        // onChange={handleInputChange("status")}
                                        size="small"
                                        input={<OutlinedInput label="Activo" />}
                                        MenuProps={{
                                            PaperProps: { sx: { bgcolor: '#FFFFFF', color: '#002338' } },
                                            MenuListProps: { sx: { bgcolor: '#FFFFFF' } }
                                        }}
                                    >
                                        <MenuItem value="true" sx={{ color: "#002338" }}>Si</MenuItem>
                                        <MenuItem value="false" sx={{ color: "#002338" }}>No</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    placeholder="Descripción"
                                    variant="outlined"
                                    label="Descripción"
                                    value={formData.description}
                                    onChange={handleInputChange("description")}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            height: "40px",
                                            borderRadius: "10px",
                                        },
                                        "& .MuiInputBase-input": {
                                            fontFamily: "Poppins",
                                            fontSize: "14px",
                                            padding: "8px 12px",
                                        },
                                    }}
                                    InputProps={{
                                        sx: { color: "#002338" }
                                    }}
                                />
                            </Grid>

                        </Grid>

                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                sx={{
                                    backgroundColor: "#002338",
                                    color: "#23FFDC",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                    height: "40px",
                                    width: "200px",
                                    borderRadius: "20px",
                                }}
                            >
                                Añadir
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
                <ModalComponent
                    open={openModalConfirm}
                    variant={modalVariant}
                    message={modalMessage}
                    onClose={() => setOpenModalConfirm(false)}
                />
            </Card>
        </>
    );
}
