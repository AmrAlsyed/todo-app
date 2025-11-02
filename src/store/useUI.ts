import { create } from "zustand";

type UIState = {
  search: string;
  setSearch: (s: string) => void;
  editingTaskId: string | null;
  openEditor: (id: string | null) => void;
  isDragging: boolean;
  setDragging: (dragging: boolean) => void;
};

export const useUI = create<UIState>((set) => ({
  search: "",
  setSearch: (s) => set({ search: s }),
  editingTaskId: null,
  openEditor: (id) => set({ editingTaskId: id }),
  isDragging: false,
  setDragging: (isDragging) => set({ isDragging }),
}));
