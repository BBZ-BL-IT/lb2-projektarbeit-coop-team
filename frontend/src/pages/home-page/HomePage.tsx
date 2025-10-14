import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import "./HomePage.css";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState("");
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [error, setError] = useState("");

  const socket = useSocket();

  if (isLoading) {
    return (
      <div className="home-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="home-container">
        <h2>Please sign in to access your profile!</h2>
      </div>
    );
  }

  const handleCreateGame = async () => {
    if (!socket) {
      setError("Unable to connect to game server");
      return;
    }

    if (!user) {
      setError("User information not available. Please sign in again.");
      return;
    }

    setIsCreatingGame(true);
    setError("");

    // Entferne alle bestehenden Event-Listener für diesen Zweck
    socket.off("authenticated");
    socket.off("game-created");
    socket.off("game-error");

    // Set up event listeners mit einmaliger Verwendung
    socket.once(
      "authenticated",
      (data: { success: boolean; error?: string }) => {
        if (data.success) {
          console.log("Authentication successful, creating game...");
          socket.emit("create-game");
        } else {
          setError(data.error || "Authentication failed");
          setIsCreatingGame(false);
        }
      }
    );

    socket.once("game-created", (gameId: string) => {
      console.log("Game created with ID:", gameId);
      setIsCreatingGame(false);
      navigate(`/multiplayer/${gameId}`);
    });

    socket.once("game-error", (errorMessage: string) => {
      console.log("Game creation error:", errorMessage);
      setError(errorMessage);
      setIsCreatingGame(false);
    });

    // Authenticate and create game
    console.log("Authenticating user:", user.name);
    socket.emit("authenticate", {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
    });
  };

  const handleJoinGame = async () => {
    if (!gameCode.trim()) {
      setError("Please enter a game code");
      return;
    }

    if (!socket) {
      setError("Unable to connect to game server");
      return;
    }

    setIsJoiningGame(true);
    setError("");

    try {
      // Navigate directly to the multiplayer game page
      // The authentication and joining will be handled there
      navigate(`/multiplayer/${gameCode.trim().toUpperCase()}`);
    } catch (error) {
      console.error("Error joining game:", error);
      setError("Error joining game. Please check the game code and try again.");
    } finally {
      setIsJoiningGame(false);
      setGameCode("");
    }
  };

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h2>Welcome back, {user?.name}!</h2>
        <div className="user-info">
          <p>Email: {user?.email}</p>
          <p>User ID: {user?.uuid}</p>
        </div>
      </div>

      {error && (
        <div
          className="error-message"
          style={{
            background: "rgba(220, 53, 69, 0.1)",
            border: "2px solid #dc3545",
            borderRadius: "10px",
            padding: "15px",
            margin: "15px 0",
            textAlign: "center",
            fontWeight: "bold",
            color: "#721c24",
          }}
        >
          {error}
        </div>
      )}

      <div className="game-actions">
        <div className="action-section">
          <h3>Start Playing</h3>

          <div className="create-game-section">
            <h4>Create New Multiplayer Game</h4>
            <button
              className="game-button create-button"
              onClick={handleCreateGame}
              disabled={isCreatingGame}
            >
              {isCreatingGame ? "Creating..." : "Create Multiplayer Game"}
            </button>
          </div>

          <div className="join-game-section">
            <h4>Join Existing Multiplayer Game</h4>
            <div className="join-game-container">
              <input
                type="text"
                className="game-code-input"
                placeholder="Enter 4-digit game code"
                value={gameCode}
                onChange={(e) => {
                  // Nur Zahlen erlauben und auf 4 Zeichen begrenzen
                  const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setGameCode(value);
                }}
                onKeyPress={(e) =>
                  e.key === "Enter" && gameCode.length === 4 && handleJoinGame()
                }
                disabled={isJoiningGame}
                maxLength={4}
              />
              <button
                className="game-button join-button"
                onClick={handleJoinGame}
                disabled={isJoiningGame || gameCode.length !== 4}
              >
                {isJoiningGame ? "Joining..." : "Join Multiplayer Game"}
              </button>
            </div>
          </div>

          <div
            className="single-player-section"
            style={{
              marginTop: "30px",
              borderTop: "1px solid #ddd",
              paddingTop: "20px",
            }}
          >
            <h4>Single Player Practice</h4>
            <button
              className="game-button"
              onClick={() => navigate("/game/practice")}
              style={{ background: "#6c757d" }}
            >
              Play Solo (Practice Mode)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
