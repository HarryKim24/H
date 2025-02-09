import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, CardContent, Typography, CircularProgress, Button, Box, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ThumbUp, ThumbDown } from "@mui/icons-material";
import { useAuthStore } from "../context/authStore";

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: {
    username: string;
  };
  likes: string[];
  dislikes: string[];
  createdAt: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { token, user } = useAuthStore();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get<Post[]>(`${import.meta.env.VITE_API_BASE_URL}/posts`);
        setPosts(res.data);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!token || !user) {
      alert("로그인 후 이용 가능합니다.");
      navigate('/login');
      return;
    } 
    navigate('/create');
  }

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />;

  return (
    <Container sx={{ pt: 2, pb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          게시글 목록
        </Typography>
        <Button variant="contained" onClick={handleCreatePost}>
          게시글 작성
        </Button>
      </Box>

      {posts.map((post) => (
        <Card 
          key={post._id} 
          sx={{ borderRadius: 2, boxShadow: 1, mb: 2, cursor: "pointer" }} 
          onClick={() => navigate(`/posts/${post._id}`)}
        >
          <CardContent sx={{ p: 1, pl: 1.5, pr: 1.5, paddingBottom: "8px !important" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {post.title.length > 50 ? post.title.substring(0, 50) + "..." : post.title}
            </Typography>

            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              {post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  작성자: {post.author?.username || "알 수 없음"}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {new Date(post.createdAt).toLocaleDateString()}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ThumbUp fontSize="small" color="primary" />
                <Typography variant="body2">{post.likes.length}</Typography>
                <ThumbDown fontSize="small" color="error" />
                <Typography variant="body2">{post.dislikes.length}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default HomePage;
