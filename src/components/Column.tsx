"use client";
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import TaskCard from "./TaskCard";
import { useUI } from "@/store/useUI";
import type { Task } from "@/types";
import { useMemo, useCallback, useEffect, useRef } from "react";

interface ColumnProps {
  columnId: string;
  title: string;
}

const TASKS_PER_PAGE = 5;

export default function Column({ columnId, title }: ColumnProps) {
  const search = useUI((s) => s.search);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isDragging } = useUI();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["tasks", columnId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get(
        `/tasks?column=${columnId}&_page=${pageParam}&_per_page=${TASKS_PER_PAGE}&_sort=position&_order=asc`
      );

      let tasks: Task[];
      let hasMore: boolean;

      if (Array.isArray(res.data)) {
        tasks = res.data;
        hasMore = res.data.length === TASKS_PER_PAGE;
      } else {
        tasks = res.data.data || [];
        hasMore = res.data.next !== null;
      }

      return {
        tasks,
        hasMore,
        currentPage: pageParam,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.currentPage + 1 : undefined;
    },
    refetchOnWindowFocus: false,
  });

  // Combine all loaded pages
  const allTasks = useMemo(() => {
    if (!data?.pages) return [];
    const tasks = data.pages.flatMap((page) => page.tasks);
    return tasks;
  }, [data]);

  // Filter tasks based on search
  const filteredTasks = useMemo(() => {
    if (!allTasks.length) return [];

    const filtered = allTasks.filter((t) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(s) ||
        (t.description && t.description.toLowerCase().includes(s))
      );
    });

    return filtered;
  }, [allTasks, search]);

  // Handle scroll to load more - but disable during drag
  const handleScroll = useCallback(() => {
    if (isDragging) return; // Don't load more during drag

    const container = scrollContainerRef.current;
    if (!container || !hasNextPage || isFetchingNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isDragging]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  return (
    <Card
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <CardHeader
        title={title}
        subheader={`${allTasks.length} tasks loaded • ${
          hasNextPage ? "Scroll to load more" : "All tasks loaded"
        }`}
      />

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <CardContent
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flex: 1,
              overflow: "hidden",
              bgcolor: snapshot.isDraggingOver
                ? "rgba(0,0,0,0.05)"
                : "transparent",
              transition: "background-color 0.2s ease",
              p: 1,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <div
              {...provided.droppableProps}
              ref={(el) => {
                provided.innerRef(el);
                //  set as scroll container
                if (el) {
                  scrollContainerRef.current = el;
                }
              }}
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                minHeight: "100%",
              }}
            >
              {isLoading && allTasks.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <CircularProgress />
                  <Typography
                    variant="body2"
                    sx={{ ml: 1, alignSelf: "center" }}
                  >
                    Loading tasks...
                  </Typography>
                </Box>
              ) : isError ? (
                <Typography color="error" sx={{ textAlign: "center" }}>
                  Failed to load tasks
                </Typography>
              ) : filteredTasks.length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", mt: 2 }}
                >
                  {search
                    ? "No tasks match your search"
                    : "No tasks in this column"}
                </Typography>
              ) : (
                <>
                  {/* Task list container */}
                  <div style={{ flex: 1, minHeight: "min-content" }}>
                    {filteredTasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={String(task.id)}
                        index={index}
                      >
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            style={{
                              ...dragProvided.draggableProps.style,
                              marginBottom: 8,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <TaskCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>

                  {/*Drag & drop placeholder*/}
                  {provided.placeholder}

                  {/* Loading more indicator */}
                  {isFetchingNextPage && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        p: 2,
                        flexShrink: 0,
                      }}
                    >
                      <CircularProgress size={24} />
                      <Typography
                        variant="body2"
                        sx={{ ml: 1, alignSelf: "center" }}
                      >
                        Loading more tasks...
                      </Typography>
                    </Box>
                  )}

                  {/* All tasks loaded message */}
                  {!hasNextPage && allTasks.length > 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", p: 2, flexShrink: 0 }}
                    >
                      All tasks loaded ({allTasks.length} total)
                    </Typography>
                  )}
                </>
              )}
            </div>
          </CardContent>
        )}
      </Droppable>
    </Card>
  );
}
