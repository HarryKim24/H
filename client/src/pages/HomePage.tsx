import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Container, Card, CardContent, Typography, CircularProgress, Button, Box, Divider, Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ThumbUp, ThumbDown } from "@mui/icons-material";
import { useAuthStore } from "../context/authStore";
import { useTheme } from "@mui/material/styles";
import { formatPostDate } from "../utils/postDateUtils";

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

interface PostQueryParams {
  page: number;
  limit: number;
  filter: string;
  author?: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filter, setFilter] = useState<string>("all");
  const { token, user } = useAuthStore();
  const limit = 10;
  const theme = useTheme();

  const fetchPosts = useCallback(async (selectedFilter: string, page: number) => {
    try {
      if (selectedFilter === "my-posts" && !user) return;
  
      setLoading(true);
      const params: PostQueryParams = { page, limit, filter: selectedFilter };
  
      if (selectedFilter === "my-posts" && user) {
        params.author = user.id;
      }
  
      const res = await axios.get<{ posts: Post[]; totalPosts: number }>(
        `${import.meta.env.VITE_API_BASE_URL}/posts`,
        { params, headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
  
      setPosts(res.data.posts);
      setTotalPages(Math.ceil(res.data.totalPosts / limit));
    } catch (err) {
      console.error("게시글 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  }, [user, token]);
  
  useEffect(() => {
    if (user) {
      fetchPosts(filter, currentPage);
    }
  }, [filter, currentPage, user, fetchPosts]);
  

  useEffect(() => {
    fetchPosts(filter, currentPage);
  }, [filter, currentPage, fetchPosts]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleCreatePost = () => {
    if (!token || !user) {
      alert("로그인 후 이용 가능합니다.");
      navigate('/login');
      return;
    }
    navigate('/create');
  };

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />;

  return (
    <Container sx={{ pt: 2, pb: 4, width: "800px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button 
            variant={filter === "all" ? "outlined" : "contained"} 
            sx={{
              fontWeight: "bold",
              backgroundColor: filter === "all" ? theme.palette.secondary.main : theme.palette.background.default,
              border: `1px solid ${theme.palette.secondary.main}`,
              color: filter === "all" ? theme.palette.background.default : theme.palette.secondary.main,
              "&:hover" : {
                backgroundColor: theme.palette.secondary.dark,
                borderColor: theme.palette.secondary.dark,
                color: theme.palette.background.default
              }
            }}
            onClick={() => handleFilterChange("all")}
          >
            전체 글
          </Button>
          <Button 
            variant={filter === "popular" ? "outlined" : "contained"} 
            sx={{
              fontWeight: "bold",
              backgroundColor: filter === "popular" ? theme.palette.secondary.main : theme.palette.background.default,
              border: `1px solid ${theme.palette.secondary.main}`,
              color: filter === "popular" ? theme.palette.background.default : theme.palette.secondary.main,
              "&:hover" : {
                backgroundColor: theme.palette.secondary.dark,
                borderColor: theme.palette.secondary.dark,
                color: theme.palette.background.default
              }
            }}
            onClick={() => handleFilterChange("popular")}
          >
            인기 글
          </Button>
          {token && user && (
            <Button 
              variant={filter === "my-posts" ? "outlined" : "contained"} 
              sx={{
                fontWeight: "bold",
                backgroundColor: filter === "my-posts" ? theme.palette.secondary.main : theme.palette.background.default,
                border: `1px solid ${theme.palette.secondary.main}`,
                color: filter === "my-posts" ? theme.palette.background.default : theme.palette.secondary.main,
                "&:hover" : {
                  backgroundColor: theme.palette.secondary.dark,
                  borderColor: theme.palette.secondary.dark,
                  color: theme.palette.background.default
                }
              }}
              onClick={() => handleFilterChange("my-posts")}
            >
              내 글
            </Button>
          )}
        </Box>

        <Button variant="contained" onClick={handleCreatePost}>
          게시글 작성
        </Button>
      </Box>

      {posts.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center", mt: 5 }}>
          게시글이 없습니다.
        </Typography>
      ) : (
        posts.map((post) => (
          <Card 
            key={post._id} 
            sx={{ borderRadius: 1, boxShadow: 1, mb: 1, cursor: "pointer" }} 
            onClick={() => navigate(`/posts/${post._id}`)}
          >
            <CardContent sx={{ p: 1, pl: 1.5, pr: 1.5, paddingBottom: "8px !important" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", wordBreak: "break-word" }}>
                {post.title.length > 50 ? post.title.substring(0, 50) + "..." : post.title}
              </Typography>

              <Typography variant="body1" sx={{ color: "text.secondary", wordBreak: "break-word" }}>
                {post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    작성자: {post.author?.username || "알 수 없음"}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {formatPostDate(post.createdAt)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ThumbUp fontSize="small" sx={{ color: theme.palette.like.main }} />
                  <Typography variant="body2">{post.likes.length}</Typography>
                  <ThumbDown fontSize="small" sx={{ color: theme.palette.dislike.main }} />
                  <Typography variant="body2">{post.dislikes.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination 
          count={totalPages} 
          page={currentPage} 
          onChange={(_, page) => setCurrentPage(page)}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default HomePage;
