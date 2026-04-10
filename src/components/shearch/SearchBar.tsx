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
      variant="outlined"
      onChange={handleSearchChange}
      fullWidth
      InputProps={{
        sx: {
          minHeight: "50px",
          pl: 1,
          color: colors.primary,
          backgroundColor: "rgba(244,248,251,0.92)",
          borderRadius: "18px",
        },
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: "rgba(18,48,77,0.58)", fontSize: "1.25rem" }} />
          </InputAdornment>
        ),
      }}
      sx={{
        maxWidth: "820px",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(18,48,77,0.12)",
        },
        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(42,108,168,0.22)",
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: colors.secondary,
        },
        "& input::placeholder": {
          color: "rgba(18,48,77,0.52)",
          opacity: 1,
          fontSize: "0.96rem",
        },
      }}
    />
  );
}
