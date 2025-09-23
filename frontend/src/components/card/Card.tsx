import {useState} from "react";
import "./Card.css";

export default function Card() {
    const relaxo = "/pokemon-image/Relaxo.png";
    const charmander = "/pokemon-image/Mewtwo.webp";
    const [isFlipped, setIsFlipped] = useState(false);

    return (
            <div className={`card ${isFlipped ? "flipped" : ""}`} onClick={() => setIsFlipped((!isFlipped))}>
                <div className="card-inner">
                    <div className="card-face card-front"></div>
                    <div className="card-face card-back">
                        <img src={charmander} alt="Relaxo" draggable="false"/>
                    </div>
                </div>
            </div>
    );
}
