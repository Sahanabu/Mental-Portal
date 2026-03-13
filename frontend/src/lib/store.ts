import { create } from 'zustand';

interface ScrollState {
  section: number;
  setSection: (section: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  section: 0,
  setSection: (section) => set({ section }),
}));
