import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, CircularProgress, TextField, Typography, Card, CardContent } from "@mui/material";
import { useAuthStore } from "../context/authStore";

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  author: {
    _id: string;
    username: string;
  };
}

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { token, user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get<{ comments: Comment[] }>(
          `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments`
        );
        setComments(res.data.comments);
      } catch (error) {
        console.error("댓글 목록 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!token || !user) {
      alert("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }
    if (!content.trim()) {
      alert("댓글 내용을 입력하세요.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setContent("");

      const res = await axios.get<{ comments: Comment[] }>(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments`
      );
      setComments(res.data.comments);
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    }
  };

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 3 }} />;

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>댓글</Typography>
      {token ? (
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            label="댓글을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" onClick={handleAddComment}>
            작성
          </Button>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          로그인 후 댓글을 작성할 수 있습니다.
        </Typography>
      )}

      {comments.length > 0 ? (
        comments.map((comment) => (
          <Card key={comment._id} sx={{ mb: 1, borderRadius: 1 }}>
            <CardContent sx={{ p: 1, pb: "8px !important" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {comment.author.username}
              </Typography>
              <Typography variant="body1">{comment.content}</Typography>
              <Typography variant="caption" color="text.disabled">
                {new Date(comment.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          첫 댓글을 작성해보세요!
        </Typography>
      )}
    </Box>
  );
};

export default CommentSection;