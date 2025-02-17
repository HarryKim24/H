const mongoose = require("mongoose");
const User = require("../models/User");
const Comment = require("../models/Comment");

const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content.trim()) {
      return res.status(400).json({ message: "댓글 내용을 입력하세요." });
    }

    const newComment = new Comment({
      postId: new mongoose.Types.ObjectId(postId),
      userId: new mongoose.Types.ObjectId(userId),
      content,
    });

    await newComment.save();

    const user = await User.findById(userId);
    if (user) {
      user.points += 1;
      await user.save();
    }

    res.status(201).json({ message: "댓글이 작성되었습니다.", comment: newComment });
  } catch (error) {
    console.error("댓글 작성 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const totalComments = await Comment.countDocuments({ postId });

    const comments = await Comment.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(postId) } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 1,
          content: 1,
          createdAt: 1,
          "author._id": 1,
          "author.username": 1,
          likes: { $ifNull: ["$likes", []] },
          dislikes: { $ifNull: ["$dislikes", []] },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: Number(limit) },
    ]);

    res.json({ comments, totalComments });
  } catch (error) {
    console.error("댓글 목록 불러오기 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    if (comment.userId.toString() !== userId) return res.status(403).json({ message: "수정 권한이 없습니다." });

    comment.content = content || comment.content;
    await comment.save();

    res.status(200).json({ message: "댓글이 수정되었습니다.", comment });
  } catch (error) {
    console.error("댓글 수정 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    if (comment.userId.toString() !== userId) return res.status(403).json({ message: "삭제 권한이 없습니다." });

    await comment.deleteOne();

    const user = await User.findById(userId);
    if (user) {
      user.points = Math.max(0, user.points - 1);
      await user.save();
    }

    res.status(200).json({ message: "댓글이 삭제되었습니다." });
  } catch (error) {
    console.error("댓글 삭제 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });

    if (!comment.likes.includes(userId)) {
      comment.likes.push(userId);
      comment.dislikes = comment.dislikes.filter((id) => id.toString() !== userId);
    }

    await comment.save();
    res.status(200).json({ message: "좋아요가 추가되었습니다.", comment });
  } catch (error) {
    console.error("좋아요 추가 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

const unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });

    comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    await comment.save();

    res.status(200).json({ message: "좋아요가 취소되었습니다.", comment });
  } catch (error) {
    console.error("좋아요 취소 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

const dislikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });

    if (!comment.dislikes.includes(userId)) {
      comment.dislikes.push(userId);
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    }

    await comment.save();
    res.status(200).json({ message: "싫어요가 추가되었습니다.", comment });
  } catch (error) {
    console.error("싫어요 추가 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

const undislikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });

    comment.dislikes = comment.dislikes.filter((id) => id.toString() !== userId);
    await comment.save();

    res.status(200).json({ message: "싫어요가 취소되었습니다.", comment });
  } catch (error) {
    console.error("싫어요 취소 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

module.exports = {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  dislikeComment,
  undislikeComment,
};
