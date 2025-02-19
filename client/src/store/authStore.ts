/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import axios from "axios";

interface User {
  id: string;
  user_id: string;
  username: string;
  points: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (user_id: string, password: string) => Promise<boolean>;
  logout: () => void;
  updatePoints: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null"),

  login: async (user_id, password) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        user_id,
        password,
      });

      const userData: User = {
        ...res.data.user,
        points: res.data.user.points || 0,
      };

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      set({ token: res.data.token, user: userData });

      return true;
    } catch (error: any) {
      console.error("로그인 실패:", error.response?.data?.message);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },

  updatePoints: (amount) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, points: Math.max(0, state.user.points + amount) };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  }  
}));