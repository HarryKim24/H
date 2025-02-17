const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require('../models/Post');
const cloudinary = require('../config/cloudinary');

const uploadImageToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "posts" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const deleteImageFromCloudinary = (imageUrl) => {
  return new Promise((resolve, reject) => {
    if (!imageUrl) return resolve();

    try {
      const urlParts = imageUrl.split("/");
      const filenameWithExtension = urlParts[urlParts.length - 1];
      const filenameWithoutExtension = filenameWithExtension.split(".")[0];

      const folderName = "posts";
      const publicId = `${folderName}/${filenameWithoutExtension}`;

      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    } catch (error) {
      console.error("Cloudinary publicId 추출 오류:", error);
      reject(error);
    }
  });
};

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "제목 또는 내용을 입력해주세요." });
    }

    let imageUrl = null;
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "posts" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    const newPost = new Post({
      title,
      content,
      author: req.user.id,
      imageUrl
    });

    await newPost.save();

    const user = await User.findById(req.user.id);
    if (user) {
      user.points += 3;
      await user.save();
    } else {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.status(201).json({ message: "게시글이 작성되었습니다.", post: newPost });
  } catch (error) {
    console.error("게시글 작성 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, filter, author } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    if (filter === "popular") {
      query = { $expr: { $gte: [{ $ifNull: [{ $size: "$likes" }, 0] }, 10] } };
    }

    if (filter === "my-posts" && author) {
      query.author = new mongoose.Types.ObjectId(author);
    }

    const totalPosts = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()
      .exec();

    const transformedPosts = posts.map(post => ({
      ...post,
      likes: Array.isArray(post.likes) ? post.likes.map(id => id.toString()) : [],
      dislikes: Array.isArray(post.dislikes) ? post.dislikes.map(id => id.toString()) : []
    }));

    res.json({ posts: transformedPosts, totalPosts, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error("🔥 게시글 목록 불러오기 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

const getPostDetail = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postId) } },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          imageUrl: 1,
          createdAt: 1,
          "author._id": 1,
          "author.username": 1,
          likes: {
            $map: {
              input: { $ifNull: ["$likes", []] },
              as: "like",
              in: { $toString: "$$like" }
            }
          },
          dislikes: {
            $map: {
              input: { $ifNull: ["$dislikes", []] },
              as: "dislike",
              in: { $toString: "$$dislike" }
            }
          }
        }
      }
    ]);

    if (!post || post.length === 0) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    res.json(post[0]);
  } catch (error) {
    console.error("게시글 상세 조회 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "수정 권한이 없습니다." });
    }

    let imageUrl = post.imageUrl;

    if (req.file) {
      if (post.imageUrl) {
        await deleteImageFromCloudinary(post.imageUrl);
      }
      imageUrl = await uploadImageToCloudinary(req.file.buffer);
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.imageUrl = imageUrl;

    await post.save();
    res.json({ message: "게시글이 수정되었습니다.", post });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }

    await post.deleteOne();

    const user = await User.findById(req.user.id);
    if (user) {
      user.points = Math.max(0, user.points - 3);
      await user.save();
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("게시글 삭제 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

const deletePostImage = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "이미지 삭제 권한이 없습니다." });
    }

    if (post.imageUrl) {
      await deleteImageFromCloudinary(post.imageUrl);
      post.imageUrl = null;
      await post.save();
    }

    res.json({ message: "이미지가 삭제되었습니다." });
  } catch (error) {
    console.error("이미지 삭제 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ message: "userId가 필요합니다." });

    const post = await Post.findById(postId).populate("author");
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    const author = await User.findById(post.author._id);
    if (!author) return res.status(404).json({ message: "게시글 작성자를 찾을 수 없습니다." });

    let pointsChange = 0;

    if (post.dislikes.includes(userId)) {
      post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
      author.points += 1;
      pointsChange += 1;
    }

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
      author.points = Math.max(0, author.points - 3);
      pointsChange -= 3;
    } else {
      post.likes.push(userId);
      author.points += 3;
      pointsChange += 3;
    }

    await Promise.all([post.save(), author.save()]);

    res.status(200).json({
      message: "좋아요 업데이트 완료",
      likes: post.likes.map(id => id.toString()),
      dislikes: post.dislikes.map(id => id.toString()),
      points: author.points,
      pointsChange,
    });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ message: "userId가 필요합니다." });

    const post = await Post.findById(postId).populate("author");
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    const author = await User.findById(post.author._id);
    if (!author) return res.status(404).json({ message: "게시글 작성자를 찾을 수 없습니다." });

    if (post.likes.some(id => id.toString() === userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
      author.points = Math.max(0, author.points - 3);
      await Promise.all([post.save(), author.save()]);
    }

    res.json({ 
      message: "좋아요 취소됨", 
      likes: post.likes.map(id => id.toString()), 
      points: author.points 
    });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

const dislikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ message: "userId가 필요합니다." });

    const post = await Post.findById(postId).populate("author");
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    const author = await User.findById(post.author._id);
    if (!author) return res.status(404).json({ message: "게시글 작성자를 찾을 수 없습니다." });

    let pointsChange = 0;

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
      author.points = Math.max(0, author.points - 3);
      pointsChange -= 3;
    }

    if (post.dislikes.includes(userId)) {
      post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
      author.points += 1;
      pointsChange += 1;
    } else {
      post.dislikes.push(userId);
      author.points = Math.max(0, author.points - 1);
      pointsChange -= 1;
    }

    await Promise.all([post.save(), author.save()]);

    res.status(200).json({
      message: "싫어요 업데이트 완료",
      likes: post.likes.map(id => id.toString()),
      dislikes: post.dislikes.map(id => id.toString()),
      points: author.points,
      pointsChange,
    });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

const undislikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ message: "userId가 필요합니다." });

    const post = await Post.findById(postId).populate("author");
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    const author = await User.findById(post.author._id);
    if (!author) return res.status(404).json({ message: "게시글 작성자를 찾을 수 없습니다." });

    if (post.dislikes.some(id => id.toString() === userId)) {
      post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
      author.points += 1;
      await Promise.all([post.save(), author.save()]);
    }

    res.json({ 
      message: "싫어요 취소됨", 
      dislikes: post.dislikes.map(id => id.toString()), 
      points: author.points 
    });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};


module.exports = { 
  createPost, 
  getPosts, 
  getPostDetail, 
  updatePost, 
  deletePost, 
  deletePostImage, 
  likePost,
  unlikePost,
  dislikePost,
  undislikePost 
};