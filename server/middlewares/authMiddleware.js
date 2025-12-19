const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "로그인이 필요합니다.",
      code: "NO_TOKEN"
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
        code: "TOKEN_EXPIRED"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "유효하지 않은 토큰입니다.",
        code: "INVALID_TOKEN"
      });
    }

    return res.status(401).json({
      message: "인증 오류가 발생했습니다.",
      code: "AUTH_ERROR"
    });
  }
};

module.exports = { authMiddleware };