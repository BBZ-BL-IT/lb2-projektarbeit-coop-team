import { useParams } from "react-router-dom";

export default function GamePage() {
  const { id } = useParams();
  return (
    <div>
      <h1>Game-Page</h1>
      <p>Current Game: {id}</p>
    </div>
  );
}
