import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Typography, CircularProgress, Button, Box, Divider, IconButton } from "@mui/material";
import { ThumbUp, ThumbDown, Edit, Delete } from "@mui/icons-material";
import { useAuthStore } from "../context/authStore";

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    username: string;
    _id: string;
  };
  likes: string[];
  dislikes: string[];
  createdAt: string;
}

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get<Post>(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleLike = async () => {
    if (!token || !user) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPost((prev) => prev ? { ...prev, likes: [...prev.likes, user.user_id] } : prev);
    } catch (err) {
      console.error("좋아요 실패:", err);
    }
  };

  const handleDislike = async () => {
    if (!token || !user) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/dislike`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPost((prev) => prev ? { ...prev, dislikes: [...prev.dislikes, user.user_id] } : prev);
    } catch (err) {
      console.error("싫어요 실패:", err);
    }
  };

  const handleDelete = async () => {
    if (!token || !post || !user || post.author._id !== user.user_id) {
      alert("삭제 권한이 없습니다.");
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/");
    } catch (err) {
      console.error("게시글 삭제 실패:", err);
    }
  };

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />;
  if (!post) return <Typography sx={{ textAlign: "center", mt: 5 }}>게시글을 찾을 수 없습니다.</Typography>;

  return (
    <Container sx={{ pt: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
        {post.title}
      </Typography>

      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
        {post.content}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="body2">작성자: {post.author.username}</Typography>
          <Typography variant="caption" color="text.disabled">
            {new Date(post.createdAt).toLocaleDateString()}
          </Typography>
        </Box>

        {token && user && post.author._id === user.user_id && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton color="primary" onClick={() => navigate(`/edit/${postId}`)}>
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={handleDelete}>
              <Delete />
            </IconButton>
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button startIcon={<ThumbUp />} onClick={handleLike}>
          좋아요 {post.likes.length}
        </Button>
        <Button startIcon={<ThumbDown />} onClick={handleDislike}>
          싫어요 {post.dislikes.length}
        </Button>
      </Box>
    </Container>
  );
};

export default PostDetailPage;