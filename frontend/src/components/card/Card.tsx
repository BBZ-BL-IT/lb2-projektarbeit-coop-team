import "./Card.css";

export default function Card() {
    const relaxo = '/pokemon-image/Relaxo.png'


    return (

            <div className="card-container">
                <img src={relaxo}/>
            </div>
    );
}