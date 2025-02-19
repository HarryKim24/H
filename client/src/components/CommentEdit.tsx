import { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { useCommentStore } from "../store/commentStore";

interface CommentEditProps {
  postId: string;
  commentId: string;
  initialContent: string;
  onCancel: () => void;
}

const CommentEdit = ({ postId, commentId, initialContent, onCancel }: CommentEditProps) => {
  const { token } = useAuthStore();
  const { fetchComments } = useCommentStore();
  const [editContent, setEditContent] = useState<string>(initialContent);

  const handleUpdateComment = async () => {
    if (!token || !editContent.trim()) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments/${commentId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onCancel();
      fetchComments(postId);
    } catch (error) {
      console.error("댓글 수정 실패:", error);
    }
  };

  return (
    <>
      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={10}
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        variant="outlined"
        placeholder="댓글을 수정하세요"
      />
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
        <Button onClick={onCancel} variant="outlined" color="primary">
          취소
        </Button>
        <Button onClick={handleUpdateComment} variant="contained" color="primary">
          수정
        </Button>
      </Box>
    </>
  );
};

export default CommentEdit;
