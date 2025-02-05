const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

exports.authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }
};
