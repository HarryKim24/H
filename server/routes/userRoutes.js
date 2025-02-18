const express = require('express');
const { getUserProfile, updateUserProfile, deleteUser, getUsername } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.delete('/profile', authMiddleware, deleteUser);
router.get('/get-username', getUsername);

module.exports = router;
