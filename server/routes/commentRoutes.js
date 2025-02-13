const express = require("express");
const {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  dislikeComment,
  undislikeComment,
} = require("../controllers/commentController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/:postId/comments", authMiddleware, addComment);
router.get("/:postId/comments", getComments);
router.put("/:postId/comments/:commentId", authMiddleware, updateComment);
router.delete("/:postId/comments/:commentId", authMiddleware, deleteComment);

router.post("/:postId/comments/:commentId/like", authMiddleware, likeComment);
router.delete("/:postId/comments/:commentId/like", authMiddleware, unlikeComment);
router.post("/:postId/comments/:commentId/dislike", authMiddleware, dislikeComment);
router.delete("/:postId/comments/:commentId/dislike", authMiddleware, undislikeComment);

module.exports = router;
