import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import StatsCard from "../../components/stats-card/StatsCard";
import Leaderboard from "../../components/leaderboard/leaderboard";
import { leaderboardMock, userStatsMock } from "../../data/dummy-objects";
import "./HomePage.css";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState("");
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [error, setError] = useState("");

  const socket = useSocket();

  // StatsCard bekommt immer die Dummy-Daten
  const stats = userStatsMock;

  if (isLoading) {
    return (
      <div className="home-container">
        <div className="ambient" />
        <div className="shell">
          <h2 className="headline shimmer">Loading…</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="home-container">
        <div className="ambient" />
        <div className="shell">
          <h2 className="headline">Bitte einloggen, um fortzufahren</h2>
          <p className="subtle">
            Du brauchst ein Konto, um Multiplayer zu nutzen.
          </p>
        </div>
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

    socket.off("authenticated");
    socket.off("game-created");
    socket.off("game-error");

    socket.once(
      "authenticated",
      (data: { success: boolean; error?: string }) => {
        if (data.success) {
          socket.emit("create-game");
        } else {
          setError(data.error || "Authentication failed");
          setIsCreatingGame(false);
        }
      },
    );

    socket.once("game-created", (gameId: string) => {
      setIsCreatingGame(false);
      navigate(`/multiplayer/${gameId}`);
    });

    socket.once("game-error", (errorMessage: string) => {
      setError(errorMessage);
      setIsCreatingGame(false);
    });

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
      <div className="ambient" />
      <div className="cards-row">
        <div className="stats-card-col">
          <StatsCard stats={stats} />
        </div>
        <div className="main-card-col">
          {/* Der Mittelteil bleibt exakt wie bisher! */}
          <div className="welcome-section glass glow">
            <h2 className="headline">
              Welcome back, <span className="gradient-text">{user?.name}</span>!
            </h2>
            <div className="user-info">
              <p>Email: {user?.email}</p>
              <p>User ID: {user?.uuid}</p>
            </div>
          </div>
          {error && (
            <div className="error-message glow error-glow">{error}</div>
          )}
          <div className="game-actions glass glow">
            <h3 className="section-title">Start Playing</h3>
            <div className="grid">
              {/* Create */}
              <div className="pane">
                <h4 className="pane-title">Create New Multiplayer Game</h4>
                <button
                  className="game-button btn-primary"
                  onClick={handleCreateGame}
                  disabled={isCreatingGame}
                >
                  {isCreatingGame ? "Creating…" : "Create Multiplayer Game"}
                </button>
                <p className="hint">Instant lobby • Share the 4-digit code</p>
              </div>
              {/* Join */}
              <div className="pane">
                <h4 className="pane-title">Join Existing Multiplayer Game</h4>
                <div className="join-game-container">
                  <div
                    className={`code-input-wrap ${gameCode.length === 4 ? "ok" : ""}`}
                  >
                    <input
                      type="text"
                      className="game-code-input"
                      placeholder="0000"
                      value={gameCode}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);
                        setGameCode(value);
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        gameCode.length === 4 &&
                        handleJoinGame()
                      }
                      disabled={isJoiningGame}
                      maxLength={4}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      aria-label="Enter 4 digit game code"
                    />
                    <span className="code-dots" aria-hidden="true">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <span
                          key={i}
                          className={i < gameCode.length ? "filled" : ""}
                        />
                      ))}
                    </span>
                  </div>
                  <button
                    className="game-button btn-accent"
                    onClick={handleJoinGame}
                    disabled={isJoiningGame || gameCode.length !== 4}
                  >
                    {isJoiningGame ? "Joining…" : "Join Multiplayer Game"}
                  </button>
                </div>
                <p className="hint">Type the 4 digits • Press Enter to join</p>
              </div>
            </div>
            <div className="divider" />
            <div className="single-player-section">
              <h4 className="pane-title">Single Player Practice</h4>
              <button
                className="game-button btn-muted"
                onClick={() => navigate("/game/practice")}
              >
                Play Solo (Practice Mode)
              </button>
            </div>
          </div>
        </div>
        <div className="leaderboard-card-col">
          <Leaderboard entries={leaderboardMock} />
        </div>
      </div>
    </div>
  );
}
