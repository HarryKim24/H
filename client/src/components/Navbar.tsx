import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuthStore } from "../context/authStore";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { Brightness4, Brightness7 } from "@mui/icons-material";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { toggleTheme, darkMode } = useContext(ThemeContext) || { toggleTheme: () => {}, darkMode: false };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
        >
          H
        </Typography>

        <IconButton onClick={toggleTheme} className="theme-toggle">
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>


        {!user ? (
          <>
            <Typography 
              component={Link} 
              to="/login" 
              sx={{ 
                textDecoration: "none", 
                color: "inherit", 
                mx: 2, 
                cursor: "pointer", 
                "&:hover": { textDecoration: "underline" } 
              }}
            >
              로그인
            </Typography>
            <Typography 
              component={Link} 
              to="/signup" 
              sx={{ 
                textDecoration: "none", 
                color: "inherit", 
                mx: 2, 
                cursor: "pointer", 
                "&:hover": { textDecoration: "underline" } 
              }}
            >
              회원가입
            </Typography>
          </>
        ) : (
          <>
            <Typography 
              component={Link} 
              to="/profile" 
              sx={{ 
                textDecoration: "none", 
                color: "inherit", 
                mx: 2, 
                cursor: "pointer", 
                "&:hover": { textDecoration: "underline" } 
              }}
            >
              프로필
            </Typography>
            <Typography 
              onClick={logout} 
              sx={{ 
                textDecoration: "none", 
                color: "inherit", 
                mx: 2, 
                cursor: "pointer", 
                "&:hover": { textDecoration: "underline" } 
              }}
            >
              로그아웃
            </Typography>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;