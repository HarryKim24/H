import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, TextField, Button, Typography, Alert } from "@mui/material";
import { useAuthStore } from "../context/authStore";

const PostEditPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("로그인 후 이용해 주세요.");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    const fetchPost = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}`);
        setTitle(res.data.title);
        setContent(res.data.content);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
        setError("게시글을 불러오는 데 실패했습니다.");
      }
    };

    fetchPost();
  }, [postId, token, navigate]);

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/posts/${postId}`);
    } catch (err) {
      console.error("게시글 수정 실패:", err);
      setError("게시글 수정에 실패했습니다.");
    }
  };

  return (
    <Container sx={{ pt: 2 }}>
      <Typography variant="h5">게시글 수정</Typography>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <TextField 
        label="제목" 
        fullWidth 
        margin="normal" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
      />
      <TextField 
        label="내용" 
        fullWidth 
        margin="normal" 
        multiline 
        rows={4} 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
      />
      <Button variant="contained" onClick={handleUpdate} sx={{ mt: 2 }}>
        수정하기
      </Button>
    </Container>
  );
};

export default PostEditPage;
