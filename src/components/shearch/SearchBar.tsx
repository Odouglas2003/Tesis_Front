import React, { useState } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useAppTheme } from "@/app/ThemeProviderClient";

interface SearchProps {
  onSearch: (searchTerm: string) => void;
}

export default function Search({ onSearch }: SearchProps) {
  const { colors } = useAppTheme();
  const [, setSearchTerm] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <TextField
      placeholder="Buscar por nombre, estado o referencia"
      inputProps={{ "aria-label": "Buscar" }}
      variant="outlined"
      onChange={handleSearchChange}
      fullWidth
      InputProps={{
        sx: {
          minHeight: "44px",
          pl: 0.5,
          color: colors.primary,
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
        },
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: "#566779", fontSize: "1.25rem" }} />
          </InputAdornment>
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#C9D3DE",
        },
        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#8FA3B6",
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: colors.secondary,
        },
        "& input::placeholder": {
          color: "#566779",
          opacity: 1,
          fontSize: "0.875rem",
        },
      }}
    />
  );
}
