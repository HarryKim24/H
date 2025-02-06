const User = require('../models/User');
const bcrypt = require('bcryptjs');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    
    res.json({
      user_id: user.user_id,
      username: user.username,
      points: user.points,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    user.username = username || user.username;
    await user.save();

    res.json({ message: "프로필이 업데이트되었습니다.", user });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "회원 탈퇴가 완료되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
  }
};

module.exports = { getUserProfile, updateUserProfile, deleteUser };
