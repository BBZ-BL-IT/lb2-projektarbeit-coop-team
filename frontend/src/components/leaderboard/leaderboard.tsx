import "./leaderboard.css";

export type LeaderboardEntry = {
  id: number | string;
  name: string;
  gewinnt: number; // Anzahl gewonnener Spiele
};

export default function Leaderboard({
  entries,
  title = "Leaderboard",
  maxRows = 5,
}: {
  entries: LeaderboardEntry[];
  title?: string;
  maxRows?: number;
}) {
  // Sortierung: absteigend nach Gewinnen
  const sorted = [...entries].sort((a, b) => b.gewinnt - a.gewinnt);
  const top = sorted.slice(0, maxRows);

  // ggf. mit Platzhaltern auffüllen
  const placeholdersCount = Math.max(0, maxRows - top.length);
  const placeholders = Array.from({ length: placeholdersCount }).map(
    (_, i) => ({
      id: `placeholder-${i}`,
      name: "--",
      gewinnt: NaN,
      placeholder: true,
    }),
  );

  const rows = [...top, ...placeholders];

  // CSS-Variable für die Zeilenanzahl, damit die Liste die Card-Höhe gleichmäßig füllt
  const listGridVars = { ["--lb-rows" as any]: rows.length };

  return (
    <section className="leaderboard-card glass glow">
      <header className="leaderboard-header">
        <h4 className="leaderboard-title">{title}</h4>
        <span className="leaderboard-subtle">Top {maxRows}</span>
      </header>

      <div className="leaderboard-list" role="list" style={listGridVars}>
        {rows.map((row, idx) => {
          const rank = idx + 1;
          const isPlaceholder = (row as any).placeholder;

          return (
            <div
              className={`leaderboard-entry ${isPlaceholder ? "placeholder" : ""}`}
              role="listitem"
              key={row.id}
            >
              <RankBadge rank={rank} />
              <div
                className={`leaderboard-name ${isPlaceholder ? "muted" : ""}`}
              >
                {row.name}
              </div>
              <div
                className={`leaderboard-score ${isPlaceholder ? "muted" : ""}`}
              >
                {isPlaceholder ? "--" : `${row.gewinnt} wins`}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="rank-badge medal gold" title="1. Platz">
        🥇
      </span>
    );
  if (rank === 2)
    return (
      <span className="rank-badge medal silver" title="2. Platz">
        🥈
      </span>
    );
  if (rank === 3)
    return (
      <span className="rank-badge medal bronze" title="3. Platz">
        🥉
      </span>
    );
  return (
    <span className="rank-badge number" aria-label={`${rank}. Platz`}>
      {rank}
    </span>
  );
}
