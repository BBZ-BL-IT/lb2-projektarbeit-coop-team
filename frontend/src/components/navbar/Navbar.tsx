import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div>
          <h1>Memoriq</h1>
        </div>
        <div className="sign-in-out-container">
          <button className="sign-in-out-button">Sign in</button>
        </div>
      </div>
    </nav>
  );
}
