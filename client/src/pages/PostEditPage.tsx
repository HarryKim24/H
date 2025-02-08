import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, TextField, Button, Typography, Alert, Box, Card, CardMedia, IconButton } from "@mui/material";
import { useAuthStore } from "../context/authStore";
import { Delete } from "@mui/icons-material";

const PostEditPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isImageDeleted, setIsImageDeleted] = useState(false);

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
        setPreview(res.data.imageUrl || null);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
        setError("게시글을 불러오는 데 실패했습니다.");
      }
    };

    fetchPost();
  }, [postId, token, navigate]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setIsImageDeleted(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/image`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPreview(null);
      setImage(null);
      setIsImageDeleted(true);
    } catch (err) {
      console.error("이미지 삭제 실패:", err);
      setError("이미지 삭제에 실패했습니다.");
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }
      if (isImageDeleted) {
        formData.append("deleteImage", "true");
      }

      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

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

      {preview && (
        <Box sx={{ position: "relative", mt: 2 }}>
          <Card sx={{ maxWidth: "100%" }}>
            <CardMedia
              component="img"
              height="200"
              image={preview}
              alt="게시글 이미지"
              sx={{ objectFit: "cover" }}
            />
          </Card>
          <IconButton 
            sx={{ position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={handleDeleteImage}
          >
            <Delete sx={{ color: "white" }} />
          </IconButton>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </Box>

      <Button variant="contained" onClick={handleUpdate} sx={{ mt: 2 }}>
        수정하기
      </Button>
    </Container>
  );
};

export default PostEditPage;
