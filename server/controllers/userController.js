const User = require('../models/User');
const bcrypt = require('bcryptjs');

const handleError = (res, error, message = "서버 오류", status = 500) => {
  console.error(`🔥 ${message}:`, error);
  res.status(status).json({ message, error });
};

const getUserProfile = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "인증되지 않은 사용자입니다." });

    const user = await User.findById(req.user.id).select("user_id username points createdAt");
    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    res.json(user);
  } catch (error) {
    handleError(res, error);
  }
};

const getUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: "유효한 사용자명을 입력하세요." });

    const user = await User.findOne({ username }).select("username points");
    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    res.json(user);
  } catch (error) {
    handleError(res, error);
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) return res.status(400).json({ message: "이미 사용 중인 닉네임입니다." });
      user.username = username;
    }

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: "현재 비밀번호를 입력해주세요." });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "현재 비밀번호가 일치하지 않습니다." });

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.json({ message: "프로필이 업데이트되었습니다.", user: { username: user.username, points: user.points, createdAt: user.createdAt } });
  } catch (error) {
    handleError(res, error, "프로필 업데이트 오류");
  }
};

const deleteUser = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });

    await user.deleteOne();
    res.json({ message: "회원 탈퇴가 완료되었습니다." });
  } catch (error) {
    handleError(res, error, "회원 탈퇴 오류");
  }
};

module.exports = { getUserProfile, getUsername, updateUserProfile, deleteUser };