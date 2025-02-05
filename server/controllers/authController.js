const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { jwtSecret, jwtExpiresIn } = require('../config');

exports.signup = async (req, res) => {
    try {
        const { user_id, username, password } = req.body;
        if (!user_id || !username || !password) {
            return res.status(400).json({ message: "아이디, 닉네임, 비밀번호를 입력해주세요." });
        }

        const existingUser = await User.findOne({ user_id });
        if (existingUser) {
            return res.status(400).json({ message: "이미 사용 중인 아이디입니다." });
        }

        const newUser = new User({ user_id, username, password });
        await newUser.save();

        res.status(201).json({ message: "회원가입 성공" });
    } catch (error) {
        res.status(500).json({ message: "서버 오류", error });
    }
};

exports.login = async (req, res) => {
  try {
      const { user_id, password } = req.body;
      if (!user_id || !password) {
          return res.status(400).json({ message: "아이디와 비밀번호를 입력해주세요." });
      }

      const user = await User.findOne({ user_id });
      if (!user) {
          return res.status(400).json({ message: "존재하지 않는 아이디입니다." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
      }

      const token = jwt.sign({ id: user._id, user_id: user.user_id }, jwtSecret, { expiresIn: jwtExpiresIn });

      res.status(200).json({ message: "로그인 성공", token, user: { id: user._id, user_id: user.user_id, username: user.username } });
  } catch (error) {
      res.status(500).json({ message: "서버 오류", error });
  }
};
