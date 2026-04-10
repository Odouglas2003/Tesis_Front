import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import { useAppTheme } from "@/app/ThemeProviderClient";


const errorImg = "/error.svg";
const successImg = "/success.svg";
const confirmImg = "/warning.svg";

interface ModalProps {
  open: boolean;
  variant: "error" | "success" | "warning";
  message: string;
  onClose?: () => void;
  onConfirm?: () => void;
  isShowButton?: boolean;
}

const ModalComponent = ({
  open,
  variant,
  message,
  onClose = () => {},
  onConfirm = () => {},
  isShowButton = true,
}: ModalProps) => {
  const theme = useTheme();
  const { colors } = useAppTheme();
  const configuration = (() => {
    switch (variant) {
      case "error":
        return {
          src: errorImg,
          buttontex: "Cerrar",
          secondaryTxt: "",
        };
      case "success":
        return {
          src: successImg,
          buttontex: "Aceptar",
          secondaryTxt: "",
        };
      case "warning":
        return {
          src: confirmImg,
          buttontex: "Confirmar",
          secondaryTxt: "Cancelar",
        };
      default:
        throw new Error("Invalid variant");
    }
  })();
  const displayMsg = message || "";
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "min(720px, calc(100vw - 32px))",
          minHeight: "320px",
          px: { xs: 2.5, md: 4 },
          pt: { xs: 4, md: 5 },
          pb: 4,
          textAlign: "center",
          borderRadius: "28px",
          border: "1px solid rgba(18,48,77,0.08)",
          boxShadow: "0 24px 80px rgba(18,48,77,0.16)",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            m: "0 auto",
            mb: 1,
            width: { xs: 110, md: 132 },
            height: { xs: 110, md: 132 },
            borderRadius: "50%",
            bgcolor: "rgba(42,108,168,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src={configuration.src}
            alt={variant + " icon"}
            width={84}
            height={84}
          />
        </Box>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            fontFamily: "Poppins",
            fontSize: { xs: "18px", md: "20px" },
            fontWeight: 500,
            color: theme.palette.text.primary,
          }}
        >
          {displayMsg}
        </Typography>

        {variant === "warning" ? (
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                textTransform: "none",
                width: "200px",
                height: "48px",
                fontFamily: "Poppins",
                fontSize: "16px",
                color: colors.button || "#123B66",
                fontWeight: 600,
                boxShadow: "none",
                backgroundColor: "rgb(255, 255, 255)",
                borderRadius: "16px",
                borderWidth: "1px",
                border: `1px solid ${colors.button || "#123B66"}`,
              }}
            >
              {configuration.secondaryTxt}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              sx={{
                width: "200px",
                height: "48px",
                borderRadius: "16px",
                textTransform: "none",
                color: colors.text || "#7DEBDC",
                fontWeight: 600,
                fontFamily: "Poppins",
                fontSize: "16px",
                backgroundColor: colors.button || "#123B66",
                "&:hover": {
                  backgroundColor: colors.primary || "#12304D",
                },
              }}
            >
              {configuration.buttontex}
            </Button>
          </Stack>
        ) : (
          isShowButton && (
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                width: "200px",
                height: "48px",
                borderRadius: "16px",
                textTransform: "none",
                color: colors.text || "#7DEBDC",
                fontWeight: 600,
                fontFamily: "Poppins",
                fontSize: "16px",
                backgroundColor: colors.button ||"#123B66",
                "&:hover": {
                  backgroundColor: colors.primary || "#12304D",
                },
              }}
            >
              {configuration.buttontex}
            </Button>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};
export default ModalComponent;
