const mongoose = require("mongoose");
const Post = require('../models/Post');
const cloudinary = require('../config/cloudinary');
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
    res.status(201).json({ message: "게시글이 작성되었습니다.", post: newPost });
  } catch (error) {
    console.error("게시글 작성 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const totalPosts = await Post.countDocuments();
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ posts, totalPosts });
  } catch (error) {
    console.error("게시글 목록 불러오기 오류:", error);
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
          likes: { $ifNull: ["$likes", []] },
          dislikes: { $ifNull: ["$dislikes", []] }
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

    if (post.imageUrl) {
      await deleteImageFromCloudinary(post.imageUrl);
    }

    await post.deleteOne();
    res.json({ message: "게시글이 삭제되었습니다." });
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

      if (!userId) return res.status(400).json({ message: 'userId가 필요합니다.' });

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

      post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
      
      if (post.likes.includes(userId)) {
          post.likes = post.likes.filter(id => id.toString() !== userId);
      } else {
          post.likes.push(userId);
      }

      await post.save();
      res.json({ message: '좋아요가 업데이트되었습니다.', likes: post.likes.length });
  } catch (err) {
      res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

const unlikePost = async (req, res) => {
  try {
      const { postId } = req.params;
      const { userId } = req.body;

      if (!userId) return res.status(400).json({ message: 'userId가 필요합니다.' });

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

      post.likes = post.likes.filter(id => id.toString() !== userId);

      await post.save();
      res.json({ message: '좋아요가 취소되었습니다.', likes: post.likes.length });
  } catch (err) {
      res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

const dislikePost = async (req, res) => {
  try {
      const { postId } = req.params;
      const { userId } = req.body;

      if (!userId) return res.status(400).json({ message: 'userId가 필요합니다.' });

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

      post.likes = post.likes.filter(id => id.toString() !== userId);
      
      if (post.dislikes.includes(userId)) {
          post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
      } else {
          post.dislikes.push(userId);
      }

      await post.save();
      res.json({ message: '싫어요가 업데이트되었습니다.', dislikes: post.dislikes.length });
  } catch (err) {
      res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

const undislikePost = async (req, res) => {
  try {
      const { postId } = req.params;
      const { userId } = req.body;

      if (!userId) return res.status(400).json({ message: 'userId가 필요합니다.' });

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

      post.dislikes = post.dislikes.filter(id => id.toString() !== userId);

      await post.save();
      res.json({ message: '싫어요가 취소되었습니다.', dislikes: post.dislikes.length });
  } catch (err) {
      res.status(500).json({ message: '서버 오류', error: err.message });
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