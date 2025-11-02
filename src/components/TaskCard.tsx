"use client";
import { Card, CardContent, Typography, IconButton, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import TaskEditor from "./TaskEditor";
import type { Task } from "@/types";

export default function TaskCard({ task }: { task: Task }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this task?")) return;

    try {
      // DELETE TASK
      await api.delete(`/tasks/${task.id}`);

      // Then refetch the column's tasks to get updated data
      qc.invalidateQueries({ queryKey: ["tasks", task.column] });
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete task");
    }
  }

  const handleEditClose = () => {
    setEditing(false);
    // Refetch all tasks because editing might have changed something just to be safe
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  return (
    <>
      <Card variant="outlined" sx={{ p: 1 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="subtitle1">{task.title}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {task.description}
          </Typography>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}
          >
            <IconButton
              size="small"
              onClick={() => setEditing(true)}
              aria-label="edit"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleDelete} aria-label="delete">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {editing && (
        <TaskEditor task={task} open={editing} onClose={handleEditClose} />
      )}
    </>
  );
}
