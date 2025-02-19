import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Container, Typography, CircularProgress, Button, Box, Divider, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, 
  useTheme,
} from "@mui/material";
import { ThumbUp, ThumbDown, Edit, Delete } from "@mui/icons-material";
import { useAuthStore } from "../context/authStore";
import CommentSection from "../components/CommentSection";
import { formatPostDate } from "../utils/postDateUtils";
import getAnimalIcon from "../utils/getAnimalIcon"; 


interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
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
  const { token, user, updatePoints } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [authorPoints, setAuthorPoints] = useState<number | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
  
      try {
        const res = await axios.get<Post>(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}`);
        setPost(res.data);
        fetchAuthorPoints(res.data.author.username);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPost();
  }, [postId]);

  const fetchAuthorPoints = async (username: string) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user/get-username`, {
        params: { username }
      });
      setAuthorPoints(res.data.points);
    } catch (err) {
      console.error("작성자 포인트 불러오기 실패:", err);
    }
  };

  const handleDelete = async () => {
    if (!token || !post || !user || String(post.author._id) !== String(user.id)) {
      alert("삭제 권한이 없습니다.");
      return;
    }
  
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (user.points > 0) {
        updatePoints(-3);
      }
  
      setPost(null);
      alert("게시글이 삭제되었습니다.");
      navigate("/");
    } catch (err) {
      console.error("게시글 삭제 실패:", err);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
  
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/like`;
      const { data } = await axios.post(url, { userId: user.id });
  
      setPost((prevPost) => {
        if (!prevPost) return null;
        return { 
          ...prevPost, 
          likes: data.likes.map(String),
          dislikes: data.dislikes.map(String)
        };
      });
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };
  
  
  const handleDislike = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
  
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/dislike`;
      const { data } = await axios.post(url, { userId: user.id });
  
      setPost((prevPost) => {
        if (!prevPost) return null;
        return { 
          ...prevPost, 
          likes: data.likes.map(String),
          dislikes: data.dislikes.map(String)
        };
      });
    } catch (error) {
      console.error("싫어요 처리 실패:", error);
    }
  };

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />;
  if (!post) return <Typography sx={{ textAlign: "center", mt: 5 }}>게시글을 찾을 수 없습니다.</Typography>;

  return (
    <Container sx={{ pt: 2, pb: 4, width: "800px" }}>
      <Typography 
        variant="h4" 
        sx={{ fontWeight: "bold", mb: 2, wordBreak: "break-word" }}
      >
        {post.title}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {post.imageUrl && (
        <Box sx={{ mb: 2 }}>
          <img 
            src={post.imageUrl} 
            alt="게시글 이미지" 
            style={{ 
              maxWidth: "100%",
              maxHeight: "500px",
              objectFit: "contain"
            }} 
          />
        </Box>
      )}
      
      <Typography 
        variant="body1" 
        sx={{ color: "text.secondary", mb: 3, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {post.content}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="body2">작성자:</Typography>
            {authorPoints !== null && (
              <img 
                src={getAnimalIcon(authorPoints)} 
                alt="User rank icon" 
                width={20} 
                height={20} 
                style={{ verticalAlign: "middle", margin: "0 4px" }}
              />
            )}
            <Typography variant="body2">{post.author.username}</Typography>
          </Box>
          <Typography variant="caption" color="text.disabled">
                  {formatPostDate(post.createdAt)}
          </Typography>
        </Box>

        {token && user && String(post.author._id) === String(user.id) && ( 
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton color="primary" onClick={() => navigate(`/posts/${postId}/edit`)}>
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={() => setOpenDialog(true)}>
              <Delete />
            </IconButton>
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ThumbUp />}
          onClick={handleLike}
          sx={{
            backgroundColor: post.likes.includes(user?.id ?? "") ? theme.palette.like.main : "transparent",
            border: `2px solid ${theme.palette.like.main}`,
            color: post.likes.includes(user?.id ?? "") ? "#ffffff" : theme.palette.like.main,
            "&:hover": {
              backgroundColor: post.likes.includes(user?.id ?? "") ? theme.palette.like.main : "rgba(229, 57, 53, 0.1)",
            },
          }}
        >
          좋아요 {post.likes.length}
        </Button>
        
        <Button
          startIcon={<ThumbDown />}
          onClick={handleDislike}
          sx={{
            backgroundColor: post.dislikes.includes(user?.id ?? "") ? theme.palette.dislike.main : "transparent",
            border: `2px solid ${theme.palette.dislike.main}`,
            color: post.dislikes.includes(user?.id ?? "") ? "#ffffff" : theme.palette.dislike.main,
            "&:hover": {
              backgroundColor: post.dislikes.includes(user?.id ?? "") ? theme.palette.dislike.main : "rgba(30, 136, 229, 0.1)",
            },
          }}
        >
          싫어요 {post.dislikes.length}
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ color: theme.palette.warning.main }}>
          게시글 삭제
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            해당 게시글을 삭제하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} autoFocus
            sx={{ backgroundColor: theme.palette.background.paper, color: theme.palette.primary.main }}
          >
            취소
          </Button>
          <Button onClick={handleDelete}
            sx={{ backgroundColor: theme.palette.background.paper, color: theme.palette.error.main }}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ width: "800px", margin: "auto", mt: 4 }}>

      <CommentSection postId={postId!} />
    </Box>
    </Container>
  );
};

export default PostDetailPage;