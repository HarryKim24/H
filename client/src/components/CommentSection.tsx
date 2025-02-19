import { useEffect, useState } from "react";
import { 
  Box, 
  CircularProgress,
  Typography, 
  Card, 
  IconButton, 
  Pagination,
  useTheme
} from "@mui/material";
import { Edit, ThumbUp, ThumbDown } from "@mui/icons-material";
import { useAuthStore } from "../store/authStore";
import { useCommentStore } from "../store/commentStore";
import getAnimalIcon from "../utils/getAnimalIcon";
import { formatCommentDate } from "../utils/commentDateUtils";
import CommentAdd from "./CommentAdd";
import CommentEdit from "./CommentEdit";
import CommentDelete from "./CommentDelete";

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const theme = useTheme();
  const { token, user } = useAuthStore();
  const {
    comments, 
    totalPages, 
    currentPage, 
    loading, 
    fetchComments, 
    likeComment, 
    dislikeComment, 
    unlikeComment, 
    undislikeComment, 
    setPage
  } = useCommentStore();

  const [editCommentId, setEditCommentId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments(postId);
  }, [postId, currentPage, fetchComments]);

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 3 }} />;

  return (
    <Box sx={{ mt: 6, width: "100%", pr: "48px" }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>댓글</Typography>

      <CommentAdd postId={postId} refreshComments={() => fetchComments(postId)} />
      
      {comments.map((comment) => (
        <Card key={comment._id} sx={{ p: 1, mb: 1, borderRadius: 1, boxShadow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src={getAnimalIcon(comment.author.points ?? 0)} 
                alt="User rank icon" 
                width={24} 
                height={24} 
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              <Typography fontWeight="bold" sx={{ fontSize: '1rem' }}>
                {comment.author.username}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user?.id === comment.author._id && (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => setEditCommentId(comment._id)} sx={{ color: "primary.main" }}>
                    <Edit fontSize="small" />
                  </IconButton>

                  <CommentDelete postId={postId} commentId={comment._id} refreshComments={() => fetchComments(postId)} />
                </Box>
              )}
              <Box sx={{ display: "flex" }}>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (!token || !user?.id) {
                      alert("로그인이 필요합니다.");
                      return;
                    }
                    if (comment.likes.includes(user.id)) {
                      unlikeComment(postId, comment._id, token, user.id);
                    } else {
                      likeComment(postId, comment._id, token, user.id);
                    }
                  }}
                  sx={{
                    color: comment.likes.includes(user?.id ?? '') 
                      ? theme.palette.like.main
                      : "text.secondary",
                    transition: "color 0.2s",
                  }}
                >
                  <ThumbUp fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>{comment.likes.length}</Typography>
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => {
                    if (!token || !user?.id) {
                      alert("로그인이 필요합니다.");
                      return;
                    }
                    if (comment.dislikes.includes(user.id)) {
                      undislikeComment(postId, comment._id, token, user.id);
                    } else {
                      dislikeComment(postId, comment._id, token, user.id);
                    }
                  }}
                  sx={{
                    color: comment.dislikes.includes(user?.id ?? '') 
                      ? theme.palette.dislike.main
                      : "text.secondary",
                    transition: "color 0.2s",
                  }}
                >
                  <ThumbDown fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>{comment.dislikes.length}</Typography>
                </IconButton>
              </Box>
            </Box>
          </Box>

          {editCommentId === comment._id ? (
            <CommentEdit
              postId={postId}
              commentId={comment._id}
              initialContent={comment.content}
              onCancel={() => setEditCommentId(null)}
              refreshComments={() => fetchComments(postId)}
            />
          ) : (
            <>
              <Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{comment.content}</Typography>
              <Typography variant="caption" color="text.disabled">
                {formatCommentDate(comment.createdAt)}
              </Typography>
            </>
          )}
        </Card>
      ))}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination 
          count={totalPages} 
          page={currentPage} 
          onChange={(_, page) => setPage(page)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default CommentSection;
