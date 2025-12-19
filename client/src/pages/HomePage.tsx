import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { Container, Card, CardContent, Typography, CircularProgress, Button, Box, Divider, Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ThumbUp, ThumbDown } from "@mui/icons-material";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "@mui/material/styles";
import { formatPostDate } from "../utils/postDateUtils";
import getAnimalIcon from "../utils/getAnimalIcon";

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

interface AuthorPoints {
  [username: string]: number;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authorPoints, setAuthorPoints] = useState<AuthorPoints>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filter, setFilter] = useState<string>("all");

  const { user } = useAuthStore();
  const limit = 10;
  const theme = useTheme();

  const fetchPosts = useCallback(async () => {
    try {
      if (filter === "my-posts" && !user) return;
  
      setLoading(true);
      const params: PostQueryParams = { page: currentPage, limit, filter };
      if (filter === "my-posts" && user) params.author = user.id;
  
      const res = await api.get<{ posts: Post[]; totalPosts: number }>(
        "/api/posts",
        { params }
      );
  
      setPosts(res.data.posts);
      setTotalPages(Math.ceil(res.data.totalPosts / limit));
  
      const uniqueUsernames = Array.from(
        new Set(res.data.posts.map((post) => post.author.username))
      );
      fetchAuthorPoints(uniqueUsernames);
    } catch (err) {
      console.error("게시글 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, user]);


  const fetchAuthorPoints = async (usernames: string[]) => {
    try {
      const responses = await Promise.all(
        usernames.map((username) =>
          api.get("/api/user/get-username", { params: { username } })
        )
      );

      const newAuthorPoints: AuthorPoints = responses.reduce((acc, res) => {
        acc[res.data.username] = res.data.points;
        return acc;
      }, {} as AuthorPoints);

      setAuthorPoints((prev) => ({ ...prev, ...newAuthorPoints }));
    } catch (err) {
      console.error("작성자 포인트 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleCreatePost = () => {
    if (!user) {
      alert("로그인 후 이용 가능합니다.");
      navigate("/login");
      return;
    }
    navigate("/create");
  };

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />;

  return (
    <Container
      sx={{
        pt: 2,
        pb: 4,
        width: "100%",
        maxWidth: { xs: "100%", sm: "90%", md: "800px" },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant={filter === "all" ? "outlined" : "contained"}
            onClick={() => handleFilterChange("all")}
          >
            전체 글
          </Button>
          <Button
            variant={filter === "popular" ? "outlined" : "contained"}
            onClick={() => handleFilterChange("popular")}
          >
            인기 글
          </Button>
          {user && (
            <Button
              variant={filter === "my-posts" ? "outlined" : "contained"}
              onClick={() => handleFilterChange("my-posts")}
            >
              내 글
            </Button>
          )}
        </Box>
        <Button 
          variant="contained" onClick={handleCreatePost}>
          게시글 작성
        </Button>
      </Box>

      {posts.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center", mt: 5 }}>
          게시글이 없습니다.
        </Typography>
      ) : (
        posts.map((post) => (
          <Card key={post._id} onClick={() => navigate(`/posts/${post._id}`)}>
            <CardContent sx={{ p: 0, pl: 1, pr: 1, paddingBottom: "0px !important" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", wordBreak: "break-word" }}>
                {post.title.length > 50 ? post.title.substring(0, 50) + "..." : post.title}
              </Typography>

              <Typography variant="body1" sx={{ color: "text.secondary", wordBreak: "break-word" }}>
                {post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ lineHeight: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
                    작성자:
                    {authorPoints[post.author.username] !== undefined && (
                      <img
                        src={getAnimalIcon(authorPoints[post.author.username])}
                        alt="User rank icon"
                        width={20}
                        height={20}
                        style={{ verticalAlign: "middle", margin: "0 4px" }}
                      />
                    )}
                    {post.author?.username || "알 수 없음"}
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
        <Pagination count={totalPages} page={currentPage} onChange={(_, page) => setCurrentPage(page)} color="primary" />
      </Box>
    </Container>
  );
};

export default HomePage;