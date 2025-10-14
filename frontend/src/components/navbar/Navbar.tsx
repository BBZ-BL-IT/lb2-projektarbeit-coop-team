import { useAuth } from "../../contexts/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <div>
            <h1>Memoriq</h1>
          </div>
          <div className="navbar-button-container">
            <span>Loading...</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div>
          <h1>Memoriq</h1>
        </div>
        <div className="navbar-button-container">
          {!isAuthenticated ? (
            <button
              className="navbar-button"
              onClick={() => (window.location.href = "http://localhost:8002")}
            >
              Sign In
            </button>
          ) : (
            <>
              {user && (
                <span className="welcome-text">Welcome, {user.name}!</span>
              )}
              <button
                className="navbar-button"
                onClick={() =>
                  (window.location.href = "http://localhost:8002/#/manage")
                }
              >
                Manage Account
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
