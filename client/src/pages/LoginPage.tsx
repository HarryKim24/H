import { useState } from "react";
import { useAuthStore } from "../context/authStore";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Box } from "@mui/material";

const LoginPage = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [user_id, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(user_id, password);
    if (success) {
      navigate("/");
    } else {
      setError("아이디 또는 비밀번호를 확인하세요.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h5">로그인</Typography>
        {error && <Typography color="error">{error}</Typography>}

        <form onSubmit={handleLogin}>
          <TextField
            label="아이디"
            fullWidth
            margin="normal"
            value={user_id}
            onChange={(e) => setUserId(e.target.value)}
            autoComplete="username"
          />
          <TextField
            label="비밀번호"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mt: 2 }}
          >
            로그인
          </Button>
        </form>

        <Typography 
          onClick={() => navigate("/signup")} 
          sx={{ 
            mt: 2, 
            cursor: "pointer", 
            textDecoration: "none", 
            color: "primary.main",
            "&:hover": { textDecoration: "underline" } 
          }}
        >
          회원가입 페이지로 이동
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;