import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { 
  Box, 
  Button, 
  CircularProgress, 
  TextField, 
  Typography, 
  Card, 
  IconButton, 
  useTheme
} from "@mui/material";
import { Edit, Delete, ThumbUp, ThumbDown } from "@mui/icons-material";
import { useAuthStore } from "../context/authStore";

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  likes: string[];
  dislikes: string[];
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
  const theme = useTheme();

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

  
  const handleLike = async (commentId: string) => {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments/${commentId}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    refreshComments();
  };

  const handleUnlike = async (commentId: string) => {
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments/${commentId}/like`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    refreshComments();
  };

  const handleDislike = async (commentId: string) => {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments/${commentId}/dislike`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    refreshComments();
  };

  const handleUndislike = async (commentId: string) => {
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments/${commentId}/dislike`, {
      headers: { Authorization: `Bearer ${token}` }
    });
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography fontWeight="bold" sx={{ fontSize: '0.875rem' }}>{comment.author.username}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {user?.id === comment.author._id && (
                <Box sx={{ display: 'flex', gap: 0.5, pr: 1 }}>
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

              <Box>
                <IconButton
                  size="small"
                  onClick={() => comment.likes.includes(user?.id ?? '') ? handleUnlike(comment._id) : handleLike(comment._id)}
                  sx={{
                    color: comment.likes.includes(user?.id ?? '') ? theme.palette.like.main : theme.palette.primary.main,
                  }}
                >
                  <ThumbUp fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.25, fontSize: '0.7rem' }}>{comment.likes?.length ?? 0}</Typography>
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => comment.dislikes.includes(user?.id ?? '') ? handleUndislike(comment._id) : handleDislike(comment._id)}
                  sx={{
                    color: comment.dislikes.includes(user?.id ?? '') ? theme.palette.dislike.main : theme.palette.primary.main,
                  }}
                >
                  <ThumbDown fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.25, fontSize: '0.7rem' }}>{comment.dislikes?.length ?? 0}</Typography>
                </IconButton>
              </Box>
            </Box>
          </Box>
        
          {editCommentId === comment._id ? (
            <>
              <TextField
                fullWidth
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                variant="outlined"
                sx={{ mb: 1, mt: 1 }}
              />
              <Button onClick={() => setEditCommentId(null)} variant="outlined" sx={{ mr: 1 }}>취소</Button>
              <Button onClick={() => handleUpdateComment(comment._id)} variant="contained">수정</Button>
            </>
          ) : (
            <>
              <Typography>{comment.content}</Typography>
              <Typography variant="caption" color="text.secondary">
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