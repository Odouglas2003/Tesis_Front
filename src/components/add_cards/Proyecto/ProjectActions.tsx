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
          height: "44px",
          fontFamily: "inherit",
          fontSize: "19px",
          color: "#1D5FA0",
          fontWeight: 600,
          lineHeight: "30px",
          letterSpacing: "0%",
          boxShadow: "none",
          backgroundColor: "#F8F8F8",
          borderRadius: "8px",
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
            height: "44px",
            fontFamily: "inherit",
            fontSize: "14px",
            color: "#1D5FA0",
            fontWeight: 600,
            lineHeight: "30px",
            letterSpacing: "0%",
            boxShadow: "none",
            backgroundColor: "rgb(255, 255, 255)",
            borderRadius: "8px",
            borderWidth: "1px",
            gap: "10px",
            marginRight: "16px",
            border: "2px solid #1D5FA0",
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
            height: "44px",
            marginLeft: "4px",
            borderRadius: "8px",
            color: "#FFFFFF",
            fontWeight: 600,
            fontFamily: "inherit",
            fontSize: "14px",
            padding: "10px",
            maxWidth: "30%",
            textTransform: "none",
            backgroundColor: "#1D5FA0",
            "&:hover": { backgroundColor: "##12304D" },
          }}
        >
          Guardar
        </Button>
      </Box>
    </Box>
  );
}