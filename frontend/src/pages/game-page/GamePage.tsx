import { useParams } from "react-router-dom";
import Card from "../../components/card/Card";
import "./GamePage.css"

export default function GamePage() {
    const {id} = useParams();
    return (
        <div>
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
