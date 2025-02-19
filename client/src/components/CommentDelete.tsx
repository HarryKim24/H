import { useState } from "react";
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, useTheme } from "@mui/material";
import { Delete } from "@mui/icons-material";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { useCommentStore } from "../store/commentStore";

interface CommentDeleteProps {
  postId: string;
  commentId: string;
  authorUsername: string;
}

const CommentDelete = ({ postId, commentId, authorUsername }: CommentDeleteProps) => {
  const { token } = useAuthStore();
  const { fetchComments } = useCommentStore();
  const [open, setOpen] = useState<boolean>(false);
  const theme = useTheme();

  const handleDelete = async () => {
    if (!token) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOpen(false);
      fetchComments(postId);

      useCommentStore.setState((state) => ({
        authorPoints: {
          ...state.authorPoints,
          [authorUsername]: (state.authorPoints[authorUsername] || 0) - 1,
        },
      }));
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    }
  };

  return (
    <>
      <IconButton size="small" onClick={() => setOpen(true)}>
        <Delete fontSize="small" color="error" />
      </IconButton>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>댓글 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            댓글을 삭제하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">취소</Button>
          <Button 
            onClick={handleDelete} variant="contained"
            sx={{ 
              backgroundColor: theme.palette.error.main ,
              "&:hover": {
                backgroundColor: theme.palette.error.dark,
              },
            }}
          >삭제</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CommentDelete;