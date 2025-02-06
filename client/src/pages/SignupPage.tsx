/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, Container, TextField, Typography, CircularProgress } from "@mui/material";
import axios from "axios";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userId || !username || !password) {
      setError("아이디, 닉네임, 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/signup`, {
        user_id: userId,
        username,
        password,
      });
      setSuccess("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "회원가입 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h5">회원가입</Typography>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {success && <Typography color="primary" sx={{ mt: 2 }}>{success}</Typography>}
        
        <form onSubmit={handleSignup}>
          <TextField 
            label="아이디" fullWidth margin="normal"
            value={userId} onChange={(e) => setUserId(e.target.value)}
          />
          <TextField 
            label="닉네임" fullWidth margin="normal"
            value={username} onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <TextField 
            label="비밀번호" type="password" fullWidth margin="normal"
            value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <Button 
            type="submit" 
            variant="contained" color="primary" fullWidth 
            disabled={loading} sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "회원가입"}
          </Button>
        </form>

        <Typography 
          onClick={() => navigate("/login")} 
          sx={{ 
            mt: 2, 
            cursor: "pointer", 
            textDecoration: "none", 
            color: "primary.main",
            "&:hover": { textDecoration: "underline" } 
          }}
        >
          로그인 페이지로 이동
        </Typography>
      </Box>
    </Container>
  )
}

export default SignupPage;
