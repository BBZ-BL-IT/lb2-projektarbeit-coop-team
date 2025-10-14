import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./HomePage.css";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [gameCode, setGameCode] = useState("");
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);

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
    setIsCreatingGame(true);
    try {
      // Hier würde die API-Logik für das Erstellen eines Spiels stehen
      console.log("Creating new game...");
      // Beispiel: API-Call zum Erstellen eines neuen Spiels
      // const response = await fetch("http://localhost:8001/api/games/create", {
      //   method: "POST",
      //   credentials: "include",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ userId: user?.uuid })
      // });
      // const gameData = await response.json();
      // window.location.href = `/game/${gameData.gameId}`;

      // Temporärer Placeholder
      alert("Game creation feature will be implemented soon!");
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Error creating game. Please try again.");
    } finally {
      setIsCreatingGame(false);
    }
  };

  const handleJoinGame = async () => {
    if (!gameCode.trim()) {
      alert("Please enter a game code");
      return;
    }

    setIsJoiningGame(true);
    try {
      // Hier würde die API-Logik für das Beitreten zu einem Spiel stehen
      console.log("Joining game with code:", gameCode);
      // Beispiel: API-Call zum Beitreten zu einem Spiel
      // const response = await fetch(`http://localhost:8001/api/games/join/${gameCode}`, {
      //   method: "POST",
      //   credentials: "include",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ userId: user?.uuid })
      // });
      // const gameData = await response.json();
      // window.location.href = `/game/${gameData.gameId}`;

      // Temporärer Placeholder
      alert(`Joining game with code: ${gameCode}`);
      setGameCode("");
    } catch (error) {
      console.error("Error joining game:", error);
      alert("Error joining game. Please check the game code and try again.");
    } finally {
      setIsJoiningGame(false);
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

      <div className="game-actions">
        <div className="action-section">
          <h3>Start Playing</h3>

          <div className="create-game-section">
            <h4>Create New Game</h4>
            <button
              className="game-button create-button"
              onClick={handleCreateGame}
              disabled={isCreatingGame}
            >
              {isCreatingGame ? "Creating..." : "Create Game"}
            </button>
          </div>

          <div className="join-game-section">
            <h4>Join Existing Game</h4>
            <div className="join-game-container">
              <input
                type="text"
                className="game-code-input"
                placeholder="Enter game code"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoinGame()}
                disabled={isJoiningGame}
              />
              <button
                className="game-button join-button"
                onClick={handleJoinGame}
                disabled={isJoiningGame || !gameCode.trim()}
              >
                {isJoiningGame ? "Joining..." : "Join Game"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
