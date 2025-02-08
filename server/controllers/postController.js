const Post = require('../models/Post');
const cloudinary = require('../config/cloudinary');

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
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(posts);
  } catch (error) {
    console.error("게시글 목록 불러오기 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

const getPostDetail = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'username')
      .populate('likes', '_id')
      .populate('dislikes', '_id');

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    res.json(post);
  } catch (error) {
    console.error("게시글 조회 오류:", error);
    res.status(500).json({ message: "서버 오류", error });
  }
};

module.exports = { createPost, getPosts, getPostDetail };