import "./StatsCard.css";

interface statsCardProps {
  statsText: string;
}

export default function StatsCard({ statsText }: statsCardProps) {
  return (
    <div className="card-inner">
      <div className="card-face"></div>
      <h2>{statsText}</h2>
    </div>
  );
}
