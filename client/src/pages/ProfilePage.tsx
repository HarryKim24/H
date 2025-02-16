/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../context/authStore";
import { 
  Container, TextField, Typography, Button, Box, CircularProgress, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useTheme 
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const theme = useTheme(); 
  const [username, setUsername] = useState(user?.username || "");
  const [points, setPoints] = useState(0);
  const [createdAt, setCreatedAt] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("로그인 후 이용해 주세요.");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsername(res.data.username);
        setPoints(res.data.points);
        setCreatedAt(new Date(res.data.createdAt).toLocaleDateString());
      } catch (err) {
        console.error("프로필 불러오기 실패:", err);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const updateData: any = { username };
      if (newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/user/profile`, 
        updateData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("프로필이 업데이트되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "프로필 업데이트 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password },
      });

      logout();
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "회원 탈퇴 실패");
    } finally {
      setLoading(false);
      setOpen(false);
      setPassword("");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h5">프로필 관리</Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {message && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}

        <form onSubmit={handleUpdateProfile} autoComplete="off">
          <TextField 
            label="닉네임" 
            fullWidth 
            margin="normal" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
  
          <TextField
            label="현재 비밀번호"
            type="password"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
  
          <TextField
            label="새 비밀번호"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
  
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>보유 포인트:</strong> {points}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
            <strong>가입 날짜:</strong> {createdAt}
          </Typography>
  
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            disabled={loading} 
            onClick={handleUpdateProfile} 
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "프로필 업데이트"}
          </Button>
        </form>

        <Button 
          variant="contained"  
          size="small"
          disabled={loading} 
          onClick={() => setOpen(true)} 
          sx={{ 
            mt: 2, 
            backgroundColor: theme.palette.error.main, 
            "&:hover": { backgroundColor: theme.palette.error.dark }, 
            fontSize: "0.8rem",
            padding: "5px 10px",
            minWidth: "100px",
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "회원 탈퇴"}
        </Button>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle sx={{ color: theme.palette.warning.main }}>회원 탈퇴 확인</DialogTitle>
          <DialogContent>
            <DialogContentText>
              현재 비밀번호를 입력하세요.
            </DialogContentText>

            <form onSubmit={handleDeleteAccount}>
              <TextField
                label="현재 비밀번호"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <DialogActions>
                <Button onClick={() => setOpen(false)} color="primary">
                  취소
                </Button>
                <Button type="submit" sx={{ color: theme.palette.error.main }} disabled={!password}>
                  탈퇴
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProfilePage;
