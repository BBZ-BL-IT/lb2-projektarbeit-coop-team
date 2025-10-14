import { useState } from "react";
import "./Card.css";

interface CardProps {
  id?: string;
  imageUrl: string;
  altText?: string;
  // Multiplayer-spezifische Props
  isFlipped?: boolean;
  isMatched?: boolean;
  isClickable?: boolean;
  onClick?: () => void;
  matchedBy?: string; // ID des Spielers der das Match gemacht hat
  currentUserId?: string; // ID des aktuellen Spielers
}

export default function Card({
  id,
  imageUrl,
  altText = "Pokemon",
  isFlipped: externalIsFlipped,
  isMatched = false,
  isClickable = true,
  onClick,
  matchedBy,
  currentUserId,
}: CardProps) {
  const [internalIsFlipped, setInternalIsFlipped] = useState(false);

  // Verwende externen Zustand (Multiplayer) oder internen Zustand (Singleplayer)
  const isFlipped =
    externalIsFlipped !== undefined ? externalIsFlipped : internalIsFlipped;

  // Bestimme die Farbe basierend auf dem Spieler
  const getMatchedClass = () => {
    if (!isMatched || !matchedBy) return "";
    if (matchedBy === currentUserId) return "matched-own";
    return "matched-opponent";
  };

  const handleClick = () => {
    if (!isClickable) return;

    if (onClick) {
      // Multiplayer-Modus: Verwende externe onClick-Funktion
      onClick();
    } else {
      // Singleplayer-Modus: Verwende internen Zustand
      setInternalIsFlipped(!internalIsFlipped);
    }
  };

  return (
    <div
      className={`card ${isFlipped || isMatched ? "flipped" : ""} ${!isClickable ? "not-clickable" : ""}`}
      onClick={handleClick}
      data-card-id={id}
    >
      <div className="card-inner">
        <div className="card-face card-front"></div>
        <div
          className={`card-face card-back ${isMatched ? `matched ${getMatchedClass()}` : ""}`}
        >
          <img src={imageUrl} alt={altText} draggable="false" />
        </div>
      </div>
    </div>
  );
}
