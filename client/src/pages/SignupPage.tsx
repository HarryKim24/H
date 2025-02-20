/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box, Button, Container, TextField, Typography, CircularProgress, IconButton, InputAdornment
} from "@mui/material";
import axios from "axios";
import { FormEvent, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const validateSignupForm = (form: { userId: string; username: string; password: string; confirmPassword: string }) => {
  const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; 
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; 
  const usernameRegex = /^[A-Za-z가-힣\d]{2,}$/;

  if (!form.userId || !form.username || !form.password || !form.confirmPassword) {
    return "모든 필드를 입력해주세요.";
  }
  if (!idRegex.test(form.userId)) {
    return "아이디는 최소 8자 이상이며, 영문과 숫자를 포함해야 합니다.";
  }
  if (!usernameRegex.test(form.username)) {
    return "닉네임은 최소 2자 이상이며, 영문, 한글, 숫자만 가능합니다.";
  }
  if (!passwordRegex.test(form.password)) {
    return "비밀번호는 최소 8자 이상이며, 영문과 숫자를 포함해야 합니다.";
  }
  if (form.password !== form.confirmPassword) {
    return "비밀번호가 일치하지 않습니다.";
  }
  return;
};

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userId: "", username: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
  
    const validationError = validateSignupForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
  
    try {
      setLoading(true);
  
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/signup`, {
        user_id: form.userId,
        username: form.username,
        password: form.password,
      });
  
      alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
      navigate("/login");
    } catch (err: any) {
      alert(err?.response?.data?.message || "회원가입 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h5">회원가입</Typography>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

        <form onSubmit={handleSignup}>
          <TextField name="userId" label="아이디" fullWidth margin="normal" value={form.userId} onChange={handleChange} helperText="아이디는 최소 8자 이상, 영문과 숫자를 포함해야 합니다." />
          <TextField name="username" label="닉네임" fullWidth margin="normal" value={form.username} onChange={handleChange} autoComplete="username" helperText="닉네임은 최소 2자 이상이며, 영문, 한글, 숫자만 가능합니다." />

          <TextField name="password" label="비밀번호" type={showPassword ? "text" : "password"} fullWidth margin="normal" value={form.password} onChange={handleChange} autoComplete="new-password"
            helperText="비밀번호는 최소 8자 이상, 영문과 숫자를 포함해야 합니다."
            slotProps={{ input: { endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <Visibility /> : <VisibilityOff />}</IconButton></InputAdornment>) } }}
          />

          <TextField name="confirmPassword" label="비밀번호 확인" type={showConfirmPassword ? "text" : "password"} fullWidth margin="normal" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password"
            slotProps={{ input: { endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <Visibility /> : <VisibilityOff />}</IconButton></InputAdornment>) } }}
          />

          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "회원가입"}
          </Button>
        </form>

        <Typography onClick={() => navigate("/login")} sx={{ mt: 2, cursor: "pointer", textDecoration: "none", color: "primary.main", "&:hover": { textDecoration: "underline" } }}>
          로그인 페이지로 이동
        </Typography>
      </Box>
    </Container>
  );
};

export default SignupPage;