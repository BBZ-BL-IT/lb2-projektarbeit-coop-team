import { Card, Game, GameState, Player } from '../types/game';
import { pokemons } from '../utils/pokemons';

export class GameManager {
  private games: Map<string, Game> = new Map();
  private playerGameMap: Map<string, string> = new Map();

  // Erstelle ein neues Spiel
  createGame(player: Player): string {
    const gameId = this.generateGameId();
    const cards = this.generateCards();

    const game: Game = {
      id: gameId,
      players: [player],
      cards,
      currentPlayerIndex: 0,
      status: 'waiting',
      flippedCards: [],
      scores: { [player.id]: 0 },
      createdAt: new Date(),
      lastActivity: new Date(),
      playerFinishTimes: {},
      playerTotalTime: {},
    };

    this.games.set(gameId, game);
    this.playerGameMap.set(player.id, gameId);

    return gameId;
  }

  // Spieler einem Spiel hinzufügen
  joinGame(gameId: string, player: Player): boolean {
    const game = this.games.get(gameId);

    console.log(`Join attempt: gameId=${gameId}, player=${player.name}`);
    console.log(`Game exists: ${!!game}`);

    if (!game) {
      console.log(`Game ${gameId} not found`);
      return false;
    }

    console.log(`Game status: ${game.status}, players: ${game.players.length}`);

    if (game.players.length >= 2) {
      console.log(`Game ${gameId} is full`);
      return false;
    }

    if (game.status !== 'waiting') {
      console.log(`Game ${gameId} is not in waiting status`);
      return false;
    }

    // Prüfe ob Spieler bereits im Spiel ist
    const existingPlayer = game.players.find((p) => p.id === player.id);
    if (existingPlayer) {
      console.log(`Player ${player.name} is already in game ${gameId}`);
      return true; // Erlaube erneutes Joinen für den gleichen Spieler
    }

    game.players.push(player);
    game.scores[player.id] = 0;
    this.playerGameMap.set(player.id, gameId);

    console.log(`Player ${player.name} successfully joined game ${gameId}`);

    // Wenn 2 Spieler da sind, starte das Spiel
    if (game.players.length === 2) {
      console.log(`Starting game ${gameId} with 2 players`);
      this.startGame(gameId);
    }

    game.lastActivity = new Date();
    return true;
  }

  // Starte das Spiel
  private startGame(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    game.status = 'playing';
    game.startTime = new Date(); // Startzeit setzen

    // Initialisiere Bedenkzeiten
    if (!game.playerTotalTime) game.playerTotalTime = {};
    game.players.forEach((player) => {
      game.playerTotalTime![player.id] = 0;
    });

    // Zufällig bestimmen, wer anfängt
    game.currentPlayerIndex = Math.floor(Math.random() * 2);

    // Starte den Timer für den ersten Spieler
    game.currentTurnStartTime = new Date();

    game.lastActivity = new Date();
  }

  // Karte umdrehen
  flipCard(gameId: string, playerId: string, cardId: string): GameState | null {
    const game = this.games.get(gameId);

    if (!game || game.status !== 'playing' || game.isProcessingMatch) {
      return null;
    }

    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      return null;
    }

    const card = game.cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) {
      return null;
    }

    // Karte umdrehen
    card.isFlipped = true;
    game.flippedCards.push(cardId);

    // Wenn 2 Karten aufgedeckt sind, blockiere weitere Aktionen
    if (game.flippedCards.length === 2) {
      game.isProcessingMatch = true;
    }

    game.lastActivity = new Date();
    return this.getGameState(gameId, playerId);
  }

  // Aktualisiere die Zeit für den aktuellen Spieler
  private updateCurrentPlayerTime(game: Game): void {
    if (!game.currentTurnStartTime || !game.playerTotalTime) return;

    const currentPlayer = game.players[game.currentPlayerIndex];
    const turnDuration = Date.now() - game.currentTurnStartTime.getTime();

    // Addiere die aktuelle Zug-Zeit zur Gesamtzeit des Spielers
    game.playerTotalTime[currentPlayer.id] =
      (game.playerTotalTime[currentPlayer.id] || 0) + turnDuration;
  }

  // Prüfe auf Match
  private checkMatch(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game || game.flippedCards.length !== 2) return;

    // Aktualisiere die Zeit für den aktuellen Spieler
    this.updateCurrentPlayerTime(game);

    const [cardId1, cardId2] = game.flippedCards;
    const card1 = game.cards.find((c) => c.id === cardId1);
    const card2 = game.cards.find((c) => c.id === cardId2);

    if (!card1 || !card2) return;

    const isMatch = card1.pokemonName === card2.pokemonName;
    const currentPlayer = game.players[game.currentPlayerIndex];

    if (isMatch) {
      // Match gefunden
      card1.isMatched = true;
      card2.isMatched = true;
      card1.matchedBy = currentPlayer.id;
      card2.matchedBy = currentPlayer.id;

      game.scores[currentPlayer.id]++;

      // Aktualisiere die Finish-Zeit für diesen Spieler
      if (!game.playerFinishTimes) game.playerFinishTimes = {};
      game.playerFinishTimes[currentPlayer.id] = new Date();

      // Spieler darf nochmal (currentPlayerIndex bleibt gleich)
      // Timer läuft weiter für den gleichen Spieler
    } else {
      // Kein Match - Karten wieder umdrehen
      card1.isFlipped = false;
      card2.isFlipped = false;

      // Nächster Spieler ist dran
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;

      // Starte Timer für neuen Spieler
      game.currentTurnStartTime = new Date();
    }

    game.flippedCards = [];
    game.isProcessingMatch = false; // Match-Verarbeitung beendet

    // Prüfe ob Spiel beendet ist
    const allMatched = game.cards.every((card) => card.isMatched);
    if (allMatched) {
      game.status = 'finished';
      game.finishTime = new Date();
      game.winner = this.determineWinner(game);
    }

    game.lastActivity = new Date();
  }

  // Öffentliche Methode für den SocketHandler um Match-Prüfung zu triggern
  public triggerMatchCheck(
    gameId: string,
    socketHandler: { broadcastGameUpdate: (gameId: string) => void },
  ): void {
    setTimeout(() => {
      this.checkMatch(gameId);
      // Benachrichtige den SocketHandler über das Update
      const game = this.getGame(gameId);
      if (game && socketHandler) {
        socketHandler.broadcastGameUpdate(gameId);
      }
    }, 800); // Reduziert von 1500ms auf 800ms
  }

  // Spieler verlässt Spiel
  leaveGame(playerId: string): string | null {
    const gameId = this.playerGameMap.get(playerId);
    if (!gameId) return null;

    const game = this.games.get(gameId);
    if (!game) return null;

    // Entferne Spieler aus dem Spiel
    game.players = game.players.filter((p) => p.id !== playerId);
    delete game.scores[playerId];
    this.playerGameMap.delete(playerId);

    // Wenn keine Spieler mehr da sind, lösche das Spiel
    if (game.players.length === 0) {
      this.games.delete(gameId);
    } else {
      // Wenn nur noch ein Spieler da ist, beende das Spiel
      game.status = 'finished';
    }

    return gameId;
  }

  // Hole Spielstatus
  getGameState(gameId: string, playerId: string): GameState | null {
    const game = this.games.get(gameId);
    if (!game) return null;

    const player = game.players.find((p) => p.id === playerId);
    if (!player) return null;

    const currentPlayer = game.players[game.currentPlayerIndex];
    const isYourTurn = currentPlayer?.id === playerId;

    return {
      game,
      currentPlayer,
      isYourTurn,
      message: this.getGameMessage(game, isYourTurn, playerId),
    };
  }

  // Hole Spiel nach ID
  getGame(gameId: string): Game | null {
    return this.games.get(gameId) || null;
  }

  // Finde Spiel eines Spielers
  getPlayerGameId(playerId: string): string | null {
    return this.playerGameMap.get(playerId) || null;
  }

  // Generiere Spielkarten
  private generateCards(): Card[] {
    // Wähle 8 zufällige Pokemon aus
    const shuffledPokemons = [...pokemons].sort(() => Math.random() - 0.5);
    const selectedPokemons = shuffledPokemons.slice(0, 8);

    const cards: Card[] = [];
    selectedPokemons.forEach((pokemon, index) => {
      // Erstelle 2 Karten pro Pokemon
      cards.push({
        id: `${index}-1`,
        pokemonName: pokemon.name,
        pokemonImg: pokemon.img,
        isFlipped: false,
        isMatched: false,
      });
      cards.push({
        id: `${index}-2`,
        pokemonName: pokemon.name,
        pokemonImg: pokemon.img,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Mische die Karten
    return cards.sort(() => Math.random() - 0.5);
  }

  // Bestimme den Gewinner
  private determineWinner(game: Game): string {
    const players = game.players;
    const scores = game.scores;

    // Sortiere Spieler nach Score (höchster zuerst)
    const sortedByScore = players.sort((a, b) => {
      const scoreA = scores[a.id] || 0;
      const scoreB = scores[b.id] || 0;
      return scoreB - scoreA;
    });

    const player1 = sortedByScore[0];
    const player2 = sortedByScore[1];
    const score1 = scores[player1.id] || 0;
    const score2 = scores[player2.id] || 0;

    // Wenn unterschiedliche Scores, gewinnt der mit mehr Matches
    if (score1 !== score2) {
      return player1.id;
    }

    // Bei Gleichstand: Der mit der geringeren Zeit gewinnt
    if (
      game.playerFinishTimes &&
      game.playerFinishTimes[player1.id] &&
      game.playerFinishTimes[player2.id]
    ) {
      const time1 = game.playerFinishTimes[player1.id].getTime();
      const time2 = game.playerFinishTimes[player2.id].getTime();

      // Der Spieler mit der früheren (niedrigeren) Finish-Zeit gewinnt
      if (time1 < time2) {
        return player1.id;
      } else if (time2 < time1) {
        return player2.id;
      }
    }

    // Fallback: Erster Spieler gewinnt
    return player1.id;
  }

  // Generiere eindeutige Spiel-ID (4-stellige Zahlen)
  private generateGameId(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Generiere Spielnachricht
  private getGameMessage(game: Game, isYourTurn: boolean, currentPlayerId: string): string {
    switch (game.status) {
      case 'waiting':
        return 'Waiting for another player to join...';
      case 'playing':
        return isYourTurn ? 'Your turn!' : 'Waiting for opponent...';
      case 'finished':
        if (!game.winner) return 'Game finished!';

        const winner = game.players.find((p) => p.id === game.winner);
        const loser = game.players.find((p) => p.id !== game.winner);
        const currentPlayer = game.players.find((p) => p.id === currentPlayerId);
        const currentPlayerScore = game.scores[currentPlayerId] || 0;
        const winnerScore = game.scores[game.winner] || 0;
        const loserScore = game.scores[loser?.id || ''] || 0;

        // Prüfe ob Gleichstand bei Matches war
        const isScoreTie = winnerScore === loserScore;

        if (game.winner === currentPlayerId) {
          if (isScoreTie && game.playerFinishTimes && loser) {
            // Gewonnen durch Zeit bei Gleichstand
            const winTime = game.playerFinishTimes[currentPlayerId];
            const loseTime = game.playerFinishTimes[loser.id];
            if (winTime && loseTime && game.startTime) {
              const winDuration = Math.round((winTime.getTime() - game.startTime.getTime()) / 1000);
              const loseDuration = Math.round(
                (loseTime.getTime() - game.startTime.getTime()) / 1000,
              );
              return `🎉 You won! Both found ${currentPlayerScore} matches, but you were faster (${winDuration}s vs ${loseDuration}s)!`;
            }
          }
          return `🎉 You won! You found ${currentPlayerScore} matches!`;
        } else {
          if (isScoreTie && game.playerFinishTimes && winner) {
            // Verloren durch Zeit bei Gleichstand
            const winTime = game.playerFinishTimes[game.winner];
            const loseTime = game.playerFinishTimes[currentPlayerId];
            if (winTime && loseTime && game.startTime) {
              const winDuration = Math.round((winTime.getTime() - game.startTime.getTime()) / 1000);
              const loseDuration = Math.round(
                (loseTime.getTime() - game.startTime.getTime()) / 1000,
              );
              return `😢 You lost! Both found ${currentPlayerScore} matches, but ${winner?.name} was faster (${winDuration}s vs ${loseDuration}s)`;
            }
          }
          return `😢 You lost! ${winner?.name} won with ${winnerScore} matches (you: ${currentPlayerScore})`;
        }
      default:
        return '';
    }
  }

  // Cleanup-Funktion für alte Spiele
  cleanupOldGames(): void {
    const now = new Date();
    const maxAge = 30 * 60 * 1000; // 30 Minuten

    for (const [gameId, game] of this.games.entries()) {
      if (now.getTime() - game.lastActivity.getTime() > maxAge) {
        // Entferne alle Spieler aus der playerGameMap
        game.players.forEach((player) => {
          this.playerGameMap.delete(player.id);
        });
        this.games.delete(gameId);
      }
    }
  }
}
