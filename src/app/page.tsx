"use client";

import Board from "@/components/Board";
import { Container, Box, TextField } from "@mui/material";
import { useUI } from "@/store/useUI";

export default function Home() {
  const setSearch = useUI((s) => s.setSearch);
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <h1>Todo App</h1>
        <TextField
          placeholder="Search title or description..."
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
      </Box>
      <Board />
    </Container>
  );
}
