import { useEffect, useState } from "react";
import axios from "axios";
import { Container, TextField, Button, Typography, CircularProgress, Alert, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../context/authStore";

const PostCreatePage = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("로그인 후 이용해 주세요.");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [token, navigate]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      console.error("로그인 후 다시 시도하세요.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/");
    } catch (err) {
      console.error("게시글 작성 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ pt: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>새 게시글 작성</Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <TextField label="제목" fullWidth margin="normal" value={title} onChange={(e) => setTitle(e.target.value)} />
      <TextField label="내용" fullWidth margin="normal" multiline rows={4} value={content} onChange={(e) => setContent(e.target.value)} />

      {preview && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <img src={preview} alt="미리보기" style={{ width: "300px", height: "auto" }} />
        </Box>
      )}
      
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
        <Box>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </Box>

        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "작성하기"}
        </Button>
      </Box>

    </Container>
  );
};

export default PostCreatePage;
