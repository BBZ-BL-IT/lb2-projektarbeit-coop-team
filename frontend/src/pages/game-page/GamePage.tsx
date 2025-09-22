import { useParams } from "react-router-dom";
import Card from "../../components/card/Card";
import "./GamePage.css"

export default function GamePage() {
    const {id} = useParams();
    return (
        <div>
            <h1>Game-Page</h1>
            <p>Du befindest dich auf der Seite: {id}</p>
            <div className="cards-container">
                <Card/>
                <Card/>
                <Card/>
                <Card/>
                <Card/>
                <Card/>
                <Card/>
                <Card/>
                <Card/>
                <Card/>
                <Card/>
                <Card/>
                <Card/>
                <Card/>
                <Card/>
                <Card/>
            </div>
        </div>
    );
};
