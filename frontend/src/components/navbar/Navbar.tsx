import { useEffect, useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to check if user is authenticated by calling the backend
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      // Call the protected /auth endpoint which will verify the httpOnly cookie
      const response = await fetch("http://localhost:8001/auth", {
        method: "GET",
        credentials: "include", // Important: This sends cookies with the request
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Auth check response status:", response.status);

      if (response.status === 200) {
        const data = await response.json();
        console.log("Auth check success:", data);
        return true;
      } else {
        console.log("Auth check failed:", response.status);
        return false;
      }
    } catch (error) {
      console.error("Auth check error:", error);
      return false;
    }
  };
  useEffect(() => {
    // Check auth status on component mount
    const checkInitialAuth = async () => {
      const isAuth = await checkAuthStatus();
      setIsAuthenticated(isAuth);
    };

    checkInitialAuth();
  }, []);

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
            <button
              className="navbar-button"
              onClick={() =>
                (window.location.href = "http://localhost:8002/#/manage")
              }
            >
              Manage Account
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
