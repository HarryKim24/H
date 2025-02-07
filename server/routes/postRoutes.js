const express = require('express');
const { createPost, getPosts } = require('../controllers/postController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/', authMiddleware, upload.single('image'), createPost);
router.get('/', getPosts);

module.exports = router;
