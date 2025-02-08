const express = require('express');
const { createPost, getPosts, getPostDetail, updatePost, deletePost } = require('../controllers/postController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/', authMiddleware, upload.single('image'), createPost);
router.get('/', getPosts);
router.get('/:postId', getPostDetail);
router.put('/:postId', authMiddleware, updatePost);
router.delete('/:postId', authMiddleware, deletePost);

module.exports = router;
