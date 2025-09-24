import Card from "../../components/card/Card";
import "./GamePage.css"
import { pokemons } from "../../pokemons";
import { useState, useEffect } from "react";

interface GameCard {
    id: string;
    pokemon: {
        name: string;
        img: string;
    };
}

export default function GamePage() {
    const [gameCards, setGameCards] = useState<GameCard[]>([]);

    useEffect(() => {
        const shuffledPokemons = [...pokemons].sort(() => Math.random() - 0.5);
        const selectedPokemons = shuffledPokemons.slice(0, 8);

        const cards: GameCard[] = [];
        selectedPokemons.forEach((pokemon, index) => {
            cards.push({
                id: `${index}-1`,
                pokemon: pokemon
            });
            cards.push({
                id: `${index}-2`,
                pokemon: pokemon
            });
        });

        const shuffledCards = cards.sort(() => Math.random() - 0.5);
        setGameCards(shuffledCards);
    }, []);

    return (
        <div>
            <div className="cards-container">
                {gameCards.map((card) => (
                    <Card
                        key={card.id}
                        imageUrl={card.pokemon.img}
                        altText={card.pokemon.name}
                    />
                ))}
            </div>
        </div>
    );
};
