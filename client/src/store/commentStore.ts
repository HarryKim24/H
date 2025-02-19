import { create } from "zustand";
import axios from "axios";

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  likes: string[];
  dislikes: string[];
  author: {
    _id: string;
    username: string;
    points: number;
  };
}

interface CommentStore {
  comments: Comment[];
  authorPoints: { [username: string]: number };
  totalPages: number;
  currentPage: number;
  loading: boolean;
  fetchComments: (postId: string, page?: number) => Promise<void>;
  likeComment: (postId: string, commentId: string, token: string, userId: string) => Promise<void>;
  dislikeComment: (postId: string, commentId: string, token: string, userId: string) => Promise<void>;
  unlikeComment: (postId: string, commentId: string, token: string, userId: string) => Promise<void>;
  undislikeComment: (postId: string, commentId: string, token: string, userId: string) => Promise<void>;
  fetchAuthorPoints: (usernames: string[]) => Promise<void>;
  setPage: (page: number) => void;
}

export const useCommentStore = create<CommentStore>((set, get) => ({
  comments: [],
  authorPoints: {},
  totalPages: 1,
  currentPage: 1,
  loading: false,

  fetchComments: async (postId, page = get().currentPage) => {
    set({ loading: true });
    try {
      const res = await axios.get<{ comments: Comment[]; totalComments: number }>(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments?page=${page}&limit=10`
      );
      
      const usernames = [...new Set(res.data.comments.map((comment) => comment.author.username))];
      await get().fetchAuthorPoints(usernames);

      set({ 
        comments: res.data.comments, 
        totalPages: Math.ceil(res.data.totalComments / 10), 
        loading: false 
      });
    } catch (error) {
      console.error("댓글 불러오기 실패:", error);
      set({ loading: false });
    }
  },

  fetchAuthorPoints: async (usernames) => {
    try {
      const responses = await Promise.all(
        usernames.map((username) =>
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/user/get-username`, { params: { username } })
        )
      );

      const newAuthorPoints: { [username: string]: number } = {};
      responses.forEach((res) => {
        newAuthorPoints[res.data.username] = res.data.points;
      });

      set((state) => ({
        authorPoints: { ...state.authorPoints, ...newAuthorPoints }
      }));
    } catch (error) {
      console.error("작성자 포인트 불러오기 실패:", error);
    }
  },

  likeComment: async (postId, commentId, token, userId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments/${commentId}/like`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        comments: state.comments.map(comment =>
          comment._id === commentId
            ? {
                ...comment,
                likes: [...comment.likes, userId],
                dislikes: comment.dislikes.filter(id => id !== userId),
              }
            : comment
        ),
      }));
    } catch (error) {
      console.error("좋아요 실패:", error);
    }
  },

  unlikeComment: async (postId, commentId, token, userId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments/${commentId}/like`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        comments: state.comments.map(comment =>
          comment._id === commentId
            ? { ...comment, likes: comment.likes.filter(id => id !== userId) }
            : comment
        ),
      }));
    } catch (error) {
      console.error("좋아요 취소 실패:", error);
    }
  },

  dislikeComment: async (postId, commentId, token, userId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments/${commentId}/dislike`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        comments: state.comments.map(comment =>
          comment._id === commentId
            ? {
                ...comment,
                dislikes: [...comment.dislikes, userId],
                likes: comment.likes.filter(id => id !== userId),
              }
            : comment
        ),
      }));
    } catch (error) {
      console.error("싫어요 실패:", error);
    }
  },

  undislikeComment: async (postId, commentId, token, userId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments/${commentId}/dislike`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        comments: state.comments.map(comment =>
          comment._id === commentId
            ? { ...comment, dislikes: comment.dislikes.filter(id => id !== userId) }
            : comment
        ),
      }));
    } catch (error) {
      console.error("싫어요 취소 실패:", error);
    }
  },

  setPage: (page) => set({ currentPage: page }),
}));