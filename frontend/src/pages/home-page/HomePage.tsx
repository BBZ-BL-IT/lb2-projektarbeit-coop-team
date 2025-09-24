import { userStatsMock } from "../../data/dummy-objects";

export default function HomePage() {
  return (
    <div>
      <h1>Home-Page</h1>
      <p>Welcome to our Memory Game</p>
      <p>Stats:</p>
      <ul>
        <li>Wins: {userStatsMock.wins}</li>
        <li>Losses: {userStatsMock.losses}</li>
        <li>Draws: {userStatsMock.draws}</li>
        <li>Total Games: {userStatsMock.totalGames}</li>
        <li>Win Rate: {userStatsMock.winRate}%</li>
      </ul>
    </div>
  );
}
