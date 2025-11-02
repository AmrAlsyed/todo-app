"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

const COLUMNS = ["backlog", "inprogress", "review", "done"];
import type { Task } from "@/types";

interface TaskEditorProps {
  task?: Task;
  open?: boolean;
  onClose: () => void;
}

export default function TaskEditor({
  task,
  open = true,
  onClose,
}: TaskEditorProps) {
  const qc = useQueryClient();
  const isNew = !task?.id;
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [column, setColumn] = useState(task?.column || "backlog");
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to calculate position for new task
  const calculateNewTaskPosition = async (
    targetColumn: string
  ): Promise<number> => {
    try {
      // Get current tasks in the target column
      const res = await api.get<Task[]>(
        `/tasks?column=${targetColumn}&_sort=position&_order=asc&_limit=1`
      );

      if (res.data.length > 0) {
        // Add the task before the first task (at the very top)
        return Math.floor(res.data[0].position / 2);
      } else {
        // First task in column - use our base position
        return 65536;
      }
    } catch (error) {
      console.error("Failed to calculate position:", error);
      return 65536; // Fallback to our base position
    }
  };

  async function save() {
    if (!title.trim()) {
      alert("Title required");
      return;
    }

    setIsLoading(true);

    try {
      if (isNew) {
        // Calculate correct position for new task
        const newPosition = await calculateNewTaskPosition(column);

        const newTaskData = {
          id: String(Date.now()),
          title,
          description,
          column,
          position: newPosition,
        };

        await api.post("/tasks", newTaskData);
      } else {
        await api.patch(`/tasks/${task.id}`, {
          title,
          description,
          column,
        });
      }

      // Always refresh data after save
      qc.invalidateQueries({ queryKey: ["tasks"] });

      // on success - Close the dialog
      onClose();
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save task");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{isNew ? "Create task" : "Edit task"}</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ my: 1 }}
        />

        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ my: 1 }}
        />

        <TextField
          select
          label="Column"
          value={column}
          onChange={(e) => setColumn(e.target.value)}
          fullWidth
          sx={{ my: 1 }}
        >
          {COLUMNS.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>

        <Button onClick={save} variant="contained" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
