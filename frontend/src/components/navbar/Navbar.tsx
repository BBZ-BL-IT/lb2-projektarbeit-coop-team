// import {  useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  // const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div>
          <h1>Memoriq</h1>
        </div>
        <div className="navbar-button-container">
          TODO: Conditionally render buttons based on auth state
          <button
            className="navbar-button"
            onClick={() => (window.location.href = "http://localhost:8002")}
          >
            Sign In
          </button>
          <button
            className="navbar-button"
            onClick={() =>
              (window.location.href = "http://localhost:8002/#/manage")
            }
          >
            Manage Account
          </button>
        </div>
      </div>
    </nav>
  );
}
