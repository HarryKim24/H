import { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { useCommentStore } from "../store/commentStore";

interface CommentAddProps {
  postId: string;
}

const CommentAdd = ({ postId }: CommentAddProps) => {
  const { token, user } = useAuthStore();
  const { fetchComments } = useCommentStore();
  const [content, setContent] = useState<string>("");

  const handleAddComment = async () => {
    if (!token || !content.trim()) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setContent("");
      fetchComments(postId);

      if (user?.username) {
        useCommentStore.setState((state) => ({
          authorPoints: {
            ...state.authorPoints,
            [user.username]: (state.authorPoints[user.username] || 0) + 1,
          },
        }));
      }
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2, mt: 1 }}>
      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={10}
        label={!token ? "로그인 후 댓글 작성이 가능합니다" : "댓글을 입력하세요"}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        variant="outlined"
        disabled={!token}
      />
      <Button
        variant="contained"
        onClick={handleAddComment}
        disabled={!token}
        sx={{ alignSelf: 'flex-start', height: 40, mt: "8px" }}
      >
        작성
      </Button>
    </Box>
  );
};

export default CommentAdd;
