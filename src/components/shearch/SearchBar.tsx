import React, { useState } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
interface SearchProps {
  onSearch: (searchTerm: string) => void;
}
export default function Search({ onSearch }: SearchProps) {
  const [, setSearchTerm] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <TextField
      placeholder="Buscar"
      variant="outlined"
      onChange={handleSearchChange}
      fullWidth
      InputProps={{
        sx: { height: "50px", paddingLeft: "10px", color: "#002338" },
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: "#002338", fontSize: "24px" }} />
          </InputAdornment>
        ),
      }}
      sx={{
        fontFamily: "Poppins, sans-serif",
        fontSize: "20px",
        color: "#002338",
        maxWidth: "778px",
        "& .MuiOutlinedInput-root": {
          borderRadius: "20px",
          height: "50px",
          backgroundColor: "#fff",
          "& fieldset": {
            borderColor: "#002338",
          },
        },
        "& input::placeholder": {
          color: "#002338",
          opacity: 1,
          fontSize: "20px",
          fontFamily: "poppins, sans-serif",
        },
      }}
    />
  );
}
