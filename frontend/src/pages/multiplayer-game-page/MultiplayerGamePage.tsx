import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/card/Card";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import "./MultiplayerGamePage.css";

interface Player {
  id: string;
  name: string;
  email: string;
  socketId: string;
  isReady: boolean;
}

interface Card {
  id: string;
  pokemonName: string;
  pokemonImg: string;
  isFlipped: boolean;
  isMatched: boolean;
  matchedBy?: string; // ID des Spielers der das Match gemacht hat
}

interface Game {
  id: string;
  players: Player[];
  cards: Card[];
  currentPlayerIndex: number;
  status: "waiting" | "playing" | "finished";
  flippedCards: string[];
  scores: { [playerId: string]: number };
  createdAt: string;
  lastActivity: string;
  isProcessingMatch?: boolean; // Verhindert weitere Züge während Match-Prüfung
  playerFinishTimes?: { [playerId: string]: string }; // Frontend erhält Dates als Strings
  playerTotalTime?: { [playerId: string]: number }; // Akkumulierte Zeit pro Spieler in ms
  currentTurnStartTime?: string; // Wann der aktuelle Zug gestartet wurde
}

interface GameState {
  game: Game;
  currentPlayer: Player;
  isYourTurn: boolean;
  message?: string;
}

export default function MultiplayerGamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(true);
  const [timers, setTimers] = useState<{ [playerId: string]: number }>({});

  const socket = useSocket();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/");
      return;
    }

    if (!socket) {
      setError("Unable to connect to game server");
      return;
    }

    // Entferne alle bestehenden Event-Listener
    socket.off("authenticated");
    socket.off("game-joined");
    socket.off("game-state-updated");
    socket.off("player-joined");
    socket.off("player-left");
    socket.off("game-finished");
    socket.off("game-error");

    // Socket Event Listeners mit einmaliger Verwendung
    socket.once(
      "authenticated",
      (data: { success: boolean; error?: string }) => {
        console.log("Authentication result:", data);
        if (data.success) {
          setIsConnecting(false);
          // Versuche dem Spiel beizutreten
          if (gameId) {
            console.log("Attempting to join game:", gameId);
            socket.emit("join-game", gameId);
          }
        } else {
          setError(data.error || "Authentication failed");
          setIsConnecting(false);
        }
      }
    );

    socket.on("game-joined", (joinedGameId: string) => {
      console.log("Successfully joined game:", joinedGameId);
      setError("");
    });

    socket.on("game-state-updated", (newGameState: GameState) => {
      console.log("Game state updated:", newGameState);
      setGameState(newGameState);
    });

    socket.on("player-joined", (player: Player) => {
      console.log("Player joined:", player);
    });

    socket.on("player-left", (playerId: string) => {
      console.log("Player left:", playerId);
    });

    socket.on(
      "game-finished",
      (winner: Player, finalScores: { [playerId: string]: number }) => {
        console.log("Game finished:", winner, finalScores);
      }
    );

    socket.on("game-error", (errorMessage: string) => {
      console.log("Game error:", errorMessage);
      setError(errorMessage);
    });

    // Authentifizierung mit Socket
    console.log("Authenticating user:", user.name);
    socket.emit("authenticate", {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
    });

    // Cleanup
    return () => {
      socket.off("authenticated");
      socket.off("game-joined");
      socket.off("game-state-updated");
      socket.off("player-joined");
      socket.off("player-left");
      socket.off("game-finished");
      socket.off("game-error");
    };
  }, [socket, isAuthenticated, user, gameId, navigate]);

  const handleCardClick = (cardId: string) => {
    if (!socket || !gameState || !gameState.isYourTurn) {
      return;
    }

    const card = gameState.game.cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) {
      return;
    }

    socket.emit("flip-card", cardId);
  };

  const handleLeaveGame = () => {
    if (socket) {
      socket.emit("leave-game");
    }
    navigate("/");
  };

  // Timer-Update-Effekt
  useEffect(() => {
    if (!gameState || gameState.game.status !== "playing") {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newTimers: { [playerId: string]: number } = {};

      gameState.game.players.forEach((player) => {
        // Basis: Akkumulierte Zeit für diesen Spieler
        const totalTime = gameState.game.playerTotalTime?.[player.id] || 0;

        // Wenn dieser Spieler gerade am Zug ist, addiere die aktuelle Zug-Zeit
        if (
          gameState.game.currentPlayerIndex ===
            gameState.game.players.indexOf(player) &&
          gameState.game.currentTurnStartTime
        ) {
          const currentTurnStart = new Date(
            gameState.game.currentTurnStartTime
          ).getTime();
          const currentTurnTime = now - currentTurnStart;
          newTimers[player.id] = Math.floor(
            (totalTime + currentTurnTime) / 1000
          );
        } else {
          // Für Spieler die nicht am Zug sind, zeige nur akkumulierte Zeit
          newTimers[player.id] = Math.floor(totalTime / 1000);
        }
      });

      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    gameState?.game.status,
    gameState?.game.playerTotalTime,
    gameState?.game.currentTurnStartTime,
    gameState?.game.currentPlayerIndex,
  ]);

  // Formatiere Zeit in MM:SS Format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="multiplayer-game-container">
        <div className="error-message">Please sign in to play the game.</div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="multiplayer-game-container">
        <div className="status-message">Connecting to game server...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="multiplayer-game-container">
        <div className="error-message">Error: {error}</div>
        <div className="game-controls">
          <button
            className="control-button leave-button"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="multiplayer-game-container">
        <div className="status-message">Loading game...</div>
      </div>
    );
  }

  const { game } = gameState;
  const currentUser = game.players.find((p) => p.id === user?.uuid);
  const opponent = game.players.find((p) => p.id !== user?.uuid);

  return (
    <div className="multiplayer-game-container">
      <div className="game-header">
        <div className="game-info">
          <div className="game-id">Game: {game.id}</div>

          <div className="player-info">
            {currentUser && (
              <div
                className={`player-card ${game.currentPlayerIndex === game.players.findIndex((p) => p.id === currentUser.id) ? "current-player" : ""}`}
              >
                <div className="player-name">{currentUser.name} (You)</div>
                <div className="player-score own-score">
                  Score: {game.scores[currentUser.id] || 0}
                </div>
                {game.status === "playing" && (
                  <div className="player-timer">
                    Time: {formatTime(timers[currentUser.id] || 0)}
                  </div>
                )}
              </div>
            )}

            {opponent && (
              <div
                className={`player-card ${game.currentPlayerIndex === game.players.findIndex((p) => p.id === opponent.id) ? "current-player" : ""}`}
              >
                <div className="player-name">{opponent.name}</div>
                <div className="player-score opponent-score">
                  Score: {game.scores[opponent.id] || 0}
                </div>
                {game.status === "playing" && (
                  <div className="player-timer">
                    Time: {formatTime(timers[opponent.id] || 0)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {game.status === "finished" ? (
          <div
            className={`game-result ${gameState.message?.includes("You won") ? "winner" : "loser"}`}
          >
            {gameState.message}
          </div>
        ) : (
          <div
            className={`turn-indicator ${game.status === "waiting" ? "waiting" : !gameState.isYourTurn ? "waiting" : ""}`}
          >
            {game.status === "waiting"
              ? `Waiting for another player to join... (Game Code: ${game.id})`
              : gameState.message}
          </div>
        )}
      </div>

      {game.status === "playing" && (
        <div className="cards-container">
          {game.cards.map((card) => (
            <Card
              key={card.id}
              id={card.id}
              imageUrl={card.pokemonImg}
              altText={card.pokemonName}
              isFlipped={card.isFlipped}
              isMatched={card.isMatched}
              isClickable={
                gameState.isYourTurn &&
                !card.isFlipped &&
                !card.isMatched &&
                !game.isProcessingMatch
              }
              onClick={() => handleCardClick(card.id)}
              matchedBy={card.matchedBy}
              currentUserId={user?.uuid}
            />
          ))}
        </div>
      )}

      {game.status === "finished" && (
        <div className="cards-container">
          {game.cards.map((card) => (
            <Card
              key={card.id}
              id={card.id}
              imageUrl={card.pokemonImg}
              altText={card.pokemonName}
              isFlipped={card.isFlipped}
              isMatched={card.isMatched}
              isClickable={false}
              onClick={() => {}}
              matchedBy={card.matchedBy}
              currentUserId={user?.uuid}
            />
          ))}
        </div>
      )}

      <div className="game-controls">
        <button
          className="control-button leave-button"
          onClick={handleLeaveGame}
        >
          Leave Game
        </button>
      </div>
    </div>
  );
}
