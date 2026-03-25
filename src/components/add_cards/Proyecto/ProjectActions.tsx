import { Box, Button } from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

interface ProjectActionsProps {
  onClose: () => void;
  handleSubmit: () => void;
  handleCreateAISuggestion: () => void;
}

export default function ProjectActions({ onClose, handleSubmit, handleCreateAISuggestion }: ProjectActionsProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", paddingTop: 2, marginTop: 2 }}>
      <Button
        sx={{
          "&:hover": { backgroundColor: "transparent" },
          textTransform: "none",
          width: "257px ",
          height: "50px",
          fontFamily: "Poppins",
          fontSize: "19px",
          color: "#0087FF",
          fontWeight: 500,
          lineHeight: "30px",
          letterSpacing: "0%",
          boxShadow: "none",
          backgroundColor: "#F8F8F8",
          borderRadius: "20px",
          borderWidth: "1px",
          gap: "10px",
        }}
        onClick={handleCreateAISuggestion}
      >
        Crear sugerencia IA
        <AutoFixHighIcon sx={{ width: "19px", height: "19px", transform: "scaleX(-1)" }} />
      </Button>
      <Box sx={{ display: "flex", justifyContent: "end", width: "70%" }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            textTransform: "none",
            width: "200px",
            height: "50px",
            fontFamily: "Poppins",
            fontSize: "20px",
            color: "#0087FF",
            fontWeight: 500,
            lineHeight: "30px",
            letterSpacing: "0%",
            boxShadow: "none",
            backgroundColor: "rgb(255, 255, 255)",
            borderRadius: "20px",
            borderWidth: "1px",
            gap: "10px",
            marginRight: "16px",
            border: "2px solid #0087ff",
          }}
        >
          Cerrar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth
          sx={{
            width: "200px",
            height: "50px",
            marginLeft: "4px",
            borderRadius: "20px",
            color: "#23FFDC",
            fontWeight: 500,
            fontFamily: "Poppins",
            fontSize: "20px",
            padding: "10px",
            maxWidth: "30%",
            textTransform: "none",
            backgroundColor: "#002338",
            "&:hover": { backgroundColor: "##002338" },
          }}
        >
          Guardar
        </Button>
      </Box>
    </Box>
  );
}