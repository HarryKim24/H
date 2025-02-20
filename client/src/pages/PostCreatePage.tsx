import { useEffect, useReducer } from "react";
import axios from "axios";
import { Container, TextField, Button, Typography, Alert, Box, IconButton, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Delete } from "@mui/icons-material";

interface State {
  title: string;
  content: string;
  image: File | null;
  preview: string | null;
  loading: boolean;
  error: string;
  titleError: boolean;
  contentError: boolean;
}

const initialState: State = {
  title: "",
  content: "",
  image: null,
  preview: null,
  loading: false,
  error: "",
  titleError: false,
  contentError: false,
};

type ValueOf<T> = T[keyof T];

type Action =
  | { type: "SET_FIELD"; field: keyof State; value: ValueOf<State> }
  | { type: "RESET" }
  | { type: "SET_ERROR"; message: string }
  | { type: "SET_LOADING"; value: boolean };

  const reducer = (state: State, action: Action): State => {
    switch (action.type) {
      case "SET_FIELD":
        return { ...state, [action.field]: action.value };
      case "RESET":
        return initialState;
      case "SET_ERROR":
        return { ...state, error: action.message };
      case "SET_LOADING":
        return { ...state, loading: action.value };
      default:
        return state;
    }
  };

const validatePost = (title: string, content: string) => {
  if (!title.trim()) return "제목을 입력해주세요.";
  if (!content.trim()) return "내용을 입력해주세요.";
  return "";
};

const PostCreatePage = () => {
  const navigate = useNavigate();
  const { token, user, updatePoints } = useAuthStore();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!token) {
      dispatch({ type: "SET_ERROR", message: "로그인 후 이용해 주세요." });
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [token, navigate]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      dispatch({ type: "SET_FIELD", field: "image", value: file });
      dispatch({ type: "SET_FIELD", field: "preview", value: URL.createObjectURL(file) });
    }
  };

  const handleDeleteImage = () => {
    dispatch({ type: "SET_FIELD", field: "image", value: null });
    dispatch({ type: "SET_FIELD", field: "preview", value: null });
  };

  const handleSubmit = async () => {
    if (!token) return console.error("로그인 후 다시 시도하세요.");

    const validationError = validatePost(state.title, state.content);
    if (validationError) {
      dispatch({ type: "SET_ERROR", message: validationError });
      return;
    }

    try {
      dispatch({ type: "SET_LOADING", value: true });

      const formData = new FormData();
      formData.append("title", state.title);
      formData.append("content", state.content);
      if (state.image) formData.append("image", state.image);

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (user) updatePoints(3);
      navigate("/");
    } catch (err) {
      console.error("게시글 작성 실패:", err);
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  };

  return (
    <Container sx={{ pt: 2, pb: 4, width: "800px" }}>
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>새 게시글 작성</Typography>

      {state.error && <Alert severity="error" sx={{ mt: 2 }}>{state.error}</Alert>}

      <TextField
        label="제목"
        fullWidth
        margin="normal"
        value={state.title}
        onChange={(e) => dispatch({ type: "SET_FIELD", field: "title", value: e.target.value })}
        error={state.titleError}
        helperText={state.titleError ? "제목을 입력해 주세요." : ""}
      />

      <TextField
        label="내용"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        value={state.content}
        onChange={(e) => dispatch({ type: "SET_FIELD", field: "content", value: e.target.value })}
        error={state.contentError}
        helperText={state.contentError ? "내용을 입력해 주세요." : ""}
      />

      {state.preview && (
        <Box sx={{ position: "relative", textAlign: "center", mt: 2 }}>
          <img src={state.preview} alt="미리보기" style={{ maxWidth: "100%", maxHeight: "500px", objectFit: "contain" }} />
        </Box>
      )}

      <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {state.preview && <IconButton onClick={handleDeleteImage}><Delete /></IconButton>}
      </Box>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="contained" onClick={() => navigate("/")}>취소</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={state.loading}>
          {state.loading ? <CircularProgress size={24} /> : "작성하기"}
        </Button>
      </Box>
    </Container>
  );
};

export default PostCreatePage;