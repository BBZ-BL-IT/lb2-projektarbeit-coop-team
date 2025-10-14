import { useAuth } from "../../contexts/AuthContext";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h2>Please sign in to access your profile</h2>
      </div>
    );
  }

  return (
    <div>
      {/* <StatsCard statsText={user?.name || "User"}></StatsCard> */}
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Welcome back, {user?.name}!</h2>
        <p>Email: {user?.email}</p>
        <p>User ID: {user?.uuid}</p>
      </div>
    </div>
  );
}
