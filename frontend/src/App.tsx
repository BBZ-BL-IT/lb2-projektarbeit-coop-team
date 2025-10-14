import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/footer/Footer";
import Navbar from "./components/navbar/Navbar";
import { AuthProvider } from "./contexts/AuthContext";
import GamePage from "./pages/game-page/GamePage";
import HomePage from "./pages/home-page/HomePage";
import MultiplayerGamePage from "./pages/multiplayer-game-page/MultiplayerGamePage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game/:id" element={<GamePage />} />
            <Route
              path="/multiplayer/:gameId"
              element={<MultiplayerGamePage />}
            />
            <Route path="*" element={<h1>404: Page Not Found</h1>} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
