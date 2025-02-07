import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProviderWrapper } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import PostCreatePage from "./pages/PostCreatePage";

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
        </Routes>
      </Router>
    </ThemeProviderWrapper>
  );
}

export default App;
