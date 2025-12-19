import { create } from "zustand";
import api from "../api/axios";

interface User {
  id: string;
  user_id: string;
  username: string;
  points: number;
}

interface AuthState {
  user: User | null;
  login: (user_id: string, password: string) => Promise<boolean>;
  logout: () => void;
  updatePoints: (amount: number) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),

  login: async (user_id, password) => {
    try {
      const res = await api.post("/api/auth/login", {
        user_id,
        password,
      });

      const userData: User = {
        ...res.data.user,
        points: res.data.user.points || 0,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      set({ user: userData });

      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },

  updatePoints: (amount) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = {
        ...state.user,
        points: Math.max(0, state.user.points + amount),
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  setUser: (user) => {
    set({ user });
    localStorage.setItem("user", JSON.stringify(user));
  },
}));