import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/footer/Footer";
import Navbar from "./components/navbar/Navbar";
import { AuthProvider } from "./contexts/AuthContext";
import GamePage from "./pages/game-page/GamePage";
import HomePage from "./pages/home-page/HomePage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
