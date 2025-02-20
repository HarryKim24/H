/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormEvent, useEffect, useReducer, useCallback, Dispatch  } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { 
  Container, TextField, Typography, Button, Box, 
  CircularProgress, Alert, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle, 
  useTheme, InputAdornment, IconButton
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import getAnimalIcon from "../utils/getAnimalIcon";

type StateType = {
  username: string;
  currentPassword: string;
  newPassword: string;
  password: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  loading: boolean;
  message: string;
  error: string;
  open: boolean;
  points: number;
  createdAt: string;
};

type ActionType =
  | { type: "SET_FIELD"; field: keyof StateType; value: string | boolean | number }
  | { type: "TOGGLE_PASSWORD"; field: "showCurrentPassword" | "showNewPassword" }
  | { type: "SET_LOADING"; value: boolean }
  | { type: "SET_MESSAGE"; value: string }
  | { type: "SET_ERROR"; value: string }
  | { type: "SET_PROFILE"; payload: Partial<StateType> }
  | { type: "RESET_PASSWORD_FIELDS" }
  | { type: "TOGGLE_DIALOG" };

const initialState = {
  username: "",
  currentPassword: "",
  newPassword: "",
  password: "",
  showCurrentPassword: false,
  showNewPassword: false,
  loading: false,
  message: "",
  error: "",
  open: false,
  points: 0,
  createdAt: "",
};

const reducer = (state: StateType, action: ActionType): StateType => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "TOGGLE_PASSWORD":
      return { ...state, [action.field]: !state[action.field] };
    case "SET_LOADING":
      return { ...state, loading: action.value };
    case "SET_MESSAGE":
      return { ...state, message: action.value };
    case "SET_ERROR":
      return { ...state, error: action.value };
    case "SET_PROFILE":
      return { ...state, ...action.payload };
    case "RESET_PASSWORD_FIELDS":
      return { ...state, currentPassword: "", newPassword: "", password: "" };
    case "TOGGLE_DIALOG":
      return { ...state, open: !state.open };
    default:
      return state;
  }
};

const fetchProfile = async (token: string, dispatch: Dispatch<ActionType>) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch({
      type: "SET_PROFILE",
      payload: {
        username: res.data.username,
        points: res.data.points,
        createdAt: new Date(res.data.createdAt).toLocaleDateString(),
      },
    });
  } catch (err) {
    console.error("프로필 불러오기 실패:", err);
    dispatch({ type: "SET_ERROR", value: "프로필 정보를 불러오지 못했습니다." });
  }
};

const validateProfileUpdate = (username: string, currentPassword: string, newPassword: string) => {
  const usernameRegex = /^[A-Za-z가-힣\d]{2,}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!usernameRegex.test(username)) {
    return "닉네임은 최소 2자 이상이며, 영문, 한글, 숫자만 가능합니다.";
  }

  if (newPassword) {
    if (!passwordRegex.test(newPassword)) {
      return "비밀번호는 최소 8자 이상이며, 영문과 숫자를 포함해야 합니다.";
    }
    if (newPassword === currentPassword) {
      return "새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.";
    }
  }

  return;
};

const ProfilePage = () => {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!token) {
      dispatch({ type: "SET_ERROR", value: "로그인 후 이용해 주세요." });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }
    fetchProfile(token, dispatch);
  }, [token, navigate]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_LOADING", value: true });
    dispatch({ type: "SET_MESSAGE", value: "" });
    dispatch({ type: "SET_ERROR", value: "" });
  
    const validationError = validateProfileUpdate(state.username, state.currentPassword, state.newPassword);
    if (validationError) {
      dispatch({ type: "SET_ERROR", value: validationError });
      dispatch({ type: "SET_LOADING", value: false });
      return;
    }
  
    const updateData: Partial<{ username: string; currentPassword: string; newPassword: string }> = { username: state.username };
    if (state.newPassword) {
      updateData.currentPassword = state.currentPassword;
      updateData.newPassword = state.newPassword;
    }
  
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/user/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const { user, setUser } = useAuthStore.getState();
      if (user) {
        const updatedUser = { ...user, username: state.username };
        setUser(updatedUser);
      }
  
      dispatch({ type: "SET_MESSAGE", value: "프로필이 업데이트되었습니다." });
      dispatch({ type: "RESET_PASSWORD_FIELDS" });
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", value: err.response?.data?.message || "프로필 업데이트 실패" });
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  };

  const handleDeleteAccount = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!state.password) return dispatch({ type: "SET_ERROR", value: "비밀번호를 입력하세요." });

    dispatch({ type: "SET_LOADING", value: true });
    dispatch({ type: "SET_MESSAGE", value: "" });
    dispatch({ type: "SET_ERROR", value: "" });

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password: state.password },
      });

      logout();
      navigate("/");
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", value: err.response?.data?.message || "회원 탈퇴 실패" });
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
      dispatch({ type: "TOGGLE_DIALOG" });
      dispatch({ type: "RESET_PASSWORD_FIELDS" });
    }
  }, [state.password, token, logout, navigate]);

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h5">프로필 관리</Typography>
  
        {state.error && <Alert severity="error" sx={{ mt: 2 }}>{state.error}</Alert>}
        {state.message && <Alert severity="success" sx={{ mt: 2 }}>{state.message}</Alert>}
  
        <form onSubmit={handleUpdateProfile} autoComplete="off">
          <TextField 
            label="닉네임" 
            fullWidth 
            margin="normal" 
            value={state.username} 
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "username", value: e.target.value })}
            autoComplete="username"
          />
          
          <TextField
            label="현재 비밀번호"
            type={state.showCurrentPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={state.currentPassword}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "currentPassword", value: e.target.value })}
            autoComplete="current-password"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => dispatch({ type: "TOGGLE_PASSWORD", field: "showCurrentPassword" })} edge="end">
                      {state.showCurrentPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
          
          <TextField
            label="새 비밀번호"
            type={state.showNewPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={state.newPassword}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "newPassword", value: e.target.value })}
            autoComplete="new-password"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => dispatch({ type: "TOGGLE_PASSWORD", field: "showNewPassword" })} edge="end">
                      {state.showNewPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
          
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 2 }}>
            <Typography variant="body1">
              <strong>보유 포인트:</strong> {state.points}
            </Typography>
            <Box sx={{ ml: 1 }}>
              <img src={getAnimalIcon(state.points)} alt="User rank icon" width={30} />
            </Box>
          </Box>
  
          <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
            <strong>가입 날짜:</strong> {state.createdAt}
          </Typography>
  
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            disabled={state.loading} 
            type="submit"
            sx={{ mt: 2 }}
          >
            {state.loading ? <CircularProgress size={24} color="inherit" /> : "프로필 업데이트"}
          </Button>
        </form>
  
        <Button 
          variant="contained"  
          size="small"
          disabled={state.loading} 
          onClick={() => dispatch({ type: "TOGGLE_DIALOG" })} 
          sx={{ 
            mt: 2, 
            backgroundColor: theme.palette.error.main, 
            "&:hover": { backgroundColor: theme.palette.error.dark }, 
            fontSize: "0.8rem",
            padding: "5px 10px",
            minWidth: "100px",
          }}
        >
          {state.loading ? <CircularProgress size={24} color="inherit" /> : "회원 탈퇴"}
        </Button>
  
        <Dialog open={state.open} onClose={() => dispatch({ type: "TOGGLE_DIALOG" })}>
          <DialogTitle sx={{ color: theme.palette.warning.main }}>회원 탈퇴 확인</DialogTitle>
          <DialogContent>
            <DialogContentText>현재 비밀번호를 입력하세요.</DialogContentText>
  
            <form onSubmit={handleDeleteAccount}>
              <TextField
                label="현재 비밀번호"
                type="password"
                fullWidth
                margin="normal"
                value={state.password}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "password", value: e.target.value })}
                autoComplete="current-password"
              />
  
              <DialogActions>
              <Button 
                onClick={() => dispatch({ type: "TOGGLE_DIALOG" })} 
                color="primary"
                sx={{
                  color: theme.palette.primary.main,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.primary.main}`,
                }}
              >
                취소
              </Button>
              <Button 
                type="submit" 
                sx={{ 
                  color: theme.palette.error.main,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.error.main}`,
                }} 
                disabled={!state.password}
              >
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