const express = require('express');
const { 
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
} = require('../controllers/postController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/', authMiddleware, upload.single('image'), createPost);
router.get('/', getPosts);
router.get('/:postId', getPostDetail);
router.put('/:postId', authMiddleware, upload.single("image"), updatePost);
router.delete('/:postId', authMiddleware, deletePost);
router.delete("/:postId/image", authMiddleware, deletePostImage);

router.post('/:postId/like', likePost);
router.delete('/:postId/like', unlikePost);
router.post('/:postId/dislike', dislikePost);
router.delete('/:postId/dislike', undislikePost);

module.exports = router;
