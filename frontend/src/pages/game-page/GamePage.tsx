import { useParams } from "react-router-dom";
import Card from "../../components/card/Card";

export default function GamePage() {
    const {id} = useParams();
    return (
        <div>
            <h1>Game-Page</h1>

            <div>
                <Card></Card>
            </div>
        </div>
    );
};
