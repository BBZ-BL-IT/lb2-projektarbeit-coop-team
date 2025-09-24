import {useState} from "react";
import "./Card.css";

interface CardProps {
    imageUrl: string;
    altText?: string;
}

export default function Card({ imageUrl, altText = "Pokemon" }: CardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
            <div className={`card ${isFlipped ? "flipped" : ""}`} onClick={() => setIsFlipped((!isFlipped))}>
                <div className="card-inner">
                    <div className="card-face card-front"></div>
                    <div className="card-face card-back">
                        <img src={imageUrl} alt={altText} draggable="false"/>
                    </div>
                </div>
            </div>
    );
}
