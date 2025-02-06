import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../context/authStore"
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          H
        </Typography>

        <Box>
          {!user ? (
            <>
              <Button color="inherit" component={Link} to="/login">로그인</Button>
              <Button color="inherit" component={Link} to="/signup">회원가입</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/profile">프로필</Button>
              <Button color="inherit" onClick={handleLogout}>로그아웃</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar;