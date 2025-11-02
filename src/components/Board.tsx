"use client";

import { Box, Button, Grid } from "@mui/material";
import Column from "./Column";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import TaskEditor from "./TaskEditor";
import { useUI } from "@/store/useUI";
import type { Task } from "@/types";

const COLUMNS = [
  { id: "backlog", title: "Backlog" },
  { id: "inprogress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

const calculatePosition = (
  destinationIndex: number,
  destTasks: Task[]
): number => {
  // If no tasks in destination, start with a base position
  if (destTasks.length === 0) {
    return 65536;
  }

  // If inserting at the beginning (before first task)
  if (destinationIndex === 0) {
    return Math.floor(destTasks[0].position / 2);
  }

  // If inserting at the end (after last task)
  if (destinationIndex >= destTasks.length) {
    return destTasks[destTasks.length - 1].position + 65536;
  }

  // Inserting between two tasks
  const taskBefore = destTasks[destinationIndex - 1];
  const taskAfter = destTasks[destinationIndex];

  const gap = taskAfter.position - taskBefore.position;

  // If there's reasonable space, use the midpoint
  if (gap > 10) {
    const position = Math.floor((taskBefore.position + taskAfter.position) / 2);
    return position;
  }

  // If positions are too close, create a new position space
  return taskBefore.position + 32768;
};

export default function Board() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const { setDragging } = useUI();

  const onDragStart = () => {
    setDragging(true);
  };

  const onDragEnd = async (result: DropResult): Promise<void> => {
    const { source, destination, draggableId } = result;

    setDragging(false);

    if (!destination) {
      // if the task dropped nowhere do nothing
      return;
    }

    const fromColumn = source.droppableId;
    const toColumn = destination.droppableId;

    if (fromColumn === toColumn && source.index === destination.index) {
      // if the task dropped in the same place do nothing
      return;
    }

    try {
      // Get destination tasks for position calculation
      const destData = qc.getQueryData(["tasks", toColumn]);
      let destTasks: Task[] = [];

      if (destData && typeof destData === "object" && "pages" in destData) {
        const infiniteData = destData as { pages: Array<{ tasks: Task[] }> };
        destTasks = infiniteData.pages.flatMap((page) => page.tasks);
      }

      // Remove the dragged task from destination tasks if it's already there
      // (for same-column moves)
      const filteredDestTasks = destTasks.filter(
        (task) => String(task.id) !== draggableId
      );

      // Calculate the new position
      const newPosition = calculatePosition(
        destination.index,
        filteredDestTasks
      );

      // Update server
      await api.patch(`/tasks/${draggableId}`, {
        column: toColumn,
        position: newPosition,
      });

      // Refetch data
      qc.invalidateQueries({ queryKey: ["tasks", fromColumn] });
      if (fromColumn !== toColumn) {
        qc.invalidateQueries({ queryKey: ["tasks", toColumn] });
      }
    } catch (err) {
      console.error("Drag update failed", err);
      qc.invalidateQueries({ queryKey: ["tasks", fromColumn] });
      if (fromColumn !== toColumn) {
        qc.invalidateQueries({ queryKey: ["tasks", toColumn] });
      }
    }
  };

  const handleAddTaskClose = () => {
    setCreating(false);
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" onClick={() => setCreating(true)}>
          Add Task
        </Button>
      </Box>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Grid container spacing={2}>
          {COLUMNS.map((col) => (
            <Grid key={col.id} size={{ xs: 12, md: 3 }}>
              <Column columnId={col.id} title={col.title} />
            </Grid>
          ))}
        </Grid>
      </DragDropContext>

      {creating && <TaskEditor open={creating} onClose={handleAddTaskClose} />}
    </>
  );
}
