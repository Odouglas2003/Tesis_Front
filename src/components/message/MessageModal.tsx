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
          width: "1042px",
          height: "380px",
          px: 4,
          pt: 5,
          pb: 4,
          textAlign: "center",
          borderRadius: 3,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            m: "0 auto",
            mb: 1,
            width: 150,
            height: 150,
            borderRadius: "50%",
            bgcolor: theme.palette.grey[200],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src={configuration.src}
            alt={variant + " icon"}
            width={100}
            height={100}
          />
        </Box>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            fontFamily: "Poppins",
            fontSize: "20px",
            fontWeight: 500,
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
                height: "50px",
                fontFamily: "Poppins",
                fontSize: "20px",
                color: colors.button || "#0087FF",
                fontWeight: 500,
                lineHeight: "30px",
                letterSpacing: "0%",
                boxShadow: "none",
                backgroundColor: "rgb(255, 255, 255)",
                borderRadius: "20px",
                borderWidth: "1px",
                gap: "10px",
                marginRight: "16px",
                border: `2px solid ${colors.button || "#0087ff"}`,
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
                height: "50px",
                borderRadius: "20px",
                textTransform: "none",
                color: "#23FFDC",
                fontWeight: 500,
                fontFamily: "Poppins",
                fontSize: "20px",
                backgroundColor: colors.button || "#002338",
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
                height: "50px",
                borderRadius: "20px",
                textTransform: "none",
                color: "#23FFDC",
                fontWeight: 500,
                fontFamily: "Poppins",
                fontSize: "20px",
                backgroundColor: colors.button ||"#002338",
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
