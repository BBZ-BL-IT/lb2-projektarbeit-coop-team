import { userStatsMock } from "../../data/dummy-objects";
import StatsCard from "../../components/stats-card/StatsCard";
export default function HomePage() {
  return (
    <div>
      <StatsCard statsText={userStatsMock.userName}></StatsCard>
    </div>
  );
}
