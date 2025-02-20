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
  Pagination,
} from "@mui/material";
import { Edit, Delete, ThumbUp, ThumbDown } from "@mui/icons-material";
import { useAuthStore } from "../store/authStore";
import getAnimalIcon from "../utils/getAnimalIcon";
import { formatCommentDate } from "../utils/commentDateUtils";


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

interface AuthorPoints {
  [username: string]: number;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const { token, user, updatePoints } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorPoints, setAuthorPoints] = useState<AuthorPoints>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [content, setContent] = useState<string>("");
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const commentsPerPage = 10;

  const refreshComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get<{ comments: Comment[]; totalComments: number }>(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${postId}/comments?page=${currentPage}&limit=${commentsPerPage}`
      );
      setComments(res.data.comments);
      setTotalPages(Math.ceil(res.data.totalComments / commentsPerPage));

      const usernames = [...new Set(res.data.comments.map((comment) => comment.author.username))];
      fetchAuthorPoints(usernames);
    } catch (error) {
      console.error("댓글 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [postId, currentPage]);

  useEffect(() => {
    refreshComments();
  }, [postId, refreshComments]);

  const fetchAuthorPoints = async (usernames: string[]) => {
    try {
      const responses = await Promise.all(
        usernames.map((username) =>
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/get-username`, { params: { username } })
        )
      );

      const newAuthorPoints: AuthorPoints = {};
      responses.forEach((res) => {
        newAuthorPoints[res.data.username] = res.data.points;
      });

      setAuthorPoints((prev) => ({ ...prev, ...newAuthorPoints }));
    } catch (err) {
      console.error("작성자 포인트 불러오기 실패:", err);
    }
  };

  const handleAddComment = async () => {
    if (!token || !content.trim()) return;
  
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${postId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setContent("");
      refreshComments();
      updatePoints(1);
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    }
  };
  
  
  const handleUpdateComment = async (commentId: string) => {
    if (!token || !editContent.trim()) return;
    await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/api/posts/${postId}/comments/${commentId}`,
      { content: editContent },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setEditCommentId(null);
    setEditContent("");
    refreshComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token || !window.confirm("이 댓글을 삭제하시겠습니까?")) return;
  
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${postId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      refreshComments();
      updatePoints(-1);
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    }
  };  

  const handleLike = async (commentId: string) => {
    if (!token) {
      alert("로그인 후 이용해 주세요.");
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${postId}/comments/${commentId}/like`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prevComments) =>
        prevComments.map(comment =>
          comment._id === commentId
            ? {
                ...comment,
                likes: [...comment.likes, user?.id ?? ''],
                dislikes: comment.dislikes.filter(id => id !== user?.id)
              }
            : comment
        )
      );
    } catch (error) {
      console.error("좋아요 실패:", error);
    }
  };
  
  const handleUnlike = async (commentId: string) => {
    if (!token) {
      alert("로그인 후 이용해 주세요.");
      return;
    }
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${postId}/comments/${commentId}/like`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prevComments) =>
        prevComments.map(comment =>
          comment._id === commentId
            ? { ...comment, likes: comment.likes.filter(id => id !== user?.id) }
            : comment
        )
      );
    } catch (error) {
      console.error("좋아요 취소 실패:", error);
    }
  };
  
  const handleDislike = async (commentId: string) => {
    if (!token) {
      alert("로그인 후 이용해 주세요.");
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${postId}/comments/${commentId}/dislike`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prevComments) =>
        prevComments.map(comment =>
          comment._id === commentId
            ? {
                ...comment,
                dislikes: [...comment.dislikes, user?.id ?? ''],
                likes: comment.likes.filter(id => id !== user?.id)
              }
            : comment
        )
      );
    } catch (error) {
      console.error("싫어요 실패:", error);
    }
  };
  
  const handleUndislike = async (commentId: string) => {
    if (!token) {
      alert("로그인 후 이용해 주세요.");
      return;
    }
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${postId}/comments/${commentId}/dislike`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prevComments) =>
        prevComments.map(comment =>
          comment._id === commentId
            ? { ...comment, dislikes: comment.dislikes.filter(id => id !== user?.id) }
            : comment
        )
      );
    } catch (error) {
      console.error("싫어요 취소 실패:", error);
    }
  };  
  
  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 3 }} />;

  return (
    <Box sx={{ mt: 6, width: "100%", pr: "48px" }}>
      <Typography variant="h6">댓글</Typography>
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
          sx={{ alignSelf: 'flex-start', height: 40, mt: 1 }}
        >
          작성
        </Button>
      </Box>
      
      {comments.map((comment) => (
        <Card key={comment._id} sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {authorPoints[comment.author.username] !== undefined && (
                <img 
                  src={getAnimalIcon(authorPoints[comment.author.username])} 
                  alt="User rank icon" 
                  width={20} 
                  height={20} 
                  style={{ verticalAlign: "middle", margin: "0 4px" }}
                />
              )}
              <Typography fontWeight="bold" sx={{ fontSize: '1rem' }}>
                {comment.author.username}
              </Typography>
            </Box>
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
                  className={comment.likes.includes(user?.id ?? '') ? "like" : ""}
                >
                  <ThumbUp fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.25, fontSize: '0.7rem' }}>{comment.likes?.length ?? 0}</Typography>
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => comment.dislikes.includes(user?.id ?? '') ? handleUndislike(comment._id) : handleDislike(comment._id)}
                  className={comment.dislikes.includes(user?.id ?? '') ? "dislike" : ""}
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
                multiline
                minRows={2}
                maxRows={10}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                variant="outlined"
                placeholder="댓글을 수정하세요"
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => setEditCommentId(null)} 
                  variant="outlined" 
                  color="primary"
                >
                  취소
                </Button>
                <Button 
                  onClick={() => handleUpdateComment(comment._id)} 
                  variant="outlined" 
                  color="primary"
                >
                  수정
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography sx={{ pl: 1 }}>{comment.content}</Typography>
              <Typography 
                variant="caption" color="text.disabled"
                sx={{ pl: 1 }}
              >
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
          onChange={(_, page) => setCurrentPage(page)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default CommentSection;