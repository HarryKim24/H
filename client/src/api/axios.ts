import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      return Promise.reject(error);
    }

    const { code } = response.data || {};

    if (code === "TOKEN_EXPIRED" || code === "INVALID_TOKEN") {
      const { logout } = useAuthStore.getState();
      logout();

      alert("로그인이 만료되었습니다. 다시 로그인해 주세요.");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;