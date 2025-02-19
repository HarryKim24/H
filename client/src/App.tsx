import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProviderWrapper } from "./store/ThemeContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import PostCreatePage from "./pages/PostCreatePage";
import PostDetailPage from "./pages/PostDetailPage";
import PostEditPage from "./pages/PostEditPage";

function App() {
  return (
    <ThemeProviderWrapper>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create" element={<PostCreatePage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/posts/:postId/edit" element={<PostEditPage />} />
        </Routes>
      </Router>
    </ThemeProviderWrapper>
  );
}

export default App;
