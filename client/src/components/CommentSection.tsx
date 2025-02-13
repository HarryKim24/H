import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { 
  Box, 
  Button, 
  CircularProgress, 
  TextField, 
  Typography, 
  Card, 
  IconButton 
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
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

const CommentSection = ({ postId }: CommentSectionProps) => {
  const { token, user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [content, setContent] = useState<string>("");
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  const refreshComments = useCallback(async () => {
    const res = await axios.get<{ comments: Comment[] }>(
      `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments`
    );
    setComments(res.data.comments);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    refreshComments();
  }, [postId, refreshComments]);

  const handleAddComment = async () => {
    if (!token || !content.trim()) return;
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setContent("");
    refreshComments();
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!token || !editContent.trim()) return;
    await axios.put(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments/${commentId}`,
      { content: editContent },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setEditCommentId(null);
    setEditContent("");
    refreshComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token || !window.confirm("이 댓글을 삭제하시겠습니까?")) return;
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments/${commentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    refreshComments();
  };

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 3 }} />;

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h6">댓글</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          label="댓글을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          sx={{ '& .MuiInputBase-root': { height: 52 } }}
        />
        <Button
          variant="contained"
          onClick={handleAddComment}
          sx={{ height: 52 }}
        >
          작성
        </Button>
      </Box>

      {comments.map((comment) => (
        <Card key={comment._id} sx={{ mb: 1, p: 1, position: "relative", borderRadius: 1, boxShadow: 1 }}>
          {user?.id === comment.author._id && (
            <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1 }}>
              <IconButton size="small" onClick={() => {
                setEditCommentId(comment._id);
                setEditContent(comment.content);
              }}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteComment(comment._id)}>
                <Delete fontSize="small" color="error" />
              </IconButton>
            </Box>
          )}

          <Typography fontWeight="bold">{comment.author.username}</Typography>
          {editCommentId === comment._id ? (
            <>
              <TextField
                fullWidth
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                variant="outlined"
                sx={{ mb: 1, mt: 1 }}
              />
              <Button onClick={() => setEditCommentId(null)} variant="contained">취소</Button>
              <Button onClick={() => handleUpdateComment(comment._id)} variant="contained" sx={{ ml: 1 }}>수정</Button>
            </>
          ) : (
            <>
              <Typography>{comment.content}</Typography>
              <Typography variant="caption" color="text.disabled">
                {new Date(comment.createdAt).toLocaleDateString()}
              </Typography>
            </>
          )}
        </Card>
      ))}
    </Box>
  );
};

export default CommentSection;