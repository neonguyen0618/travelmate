import { Link } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-bgSecondary shadow">
      <h1 className="text-xl font-bold">
        <Link to="/" className="text-textPrimary">TravelMate</Link>
      </h1>

      <div className="flex items-center gap-4">
        <Link to="/explore" className="hover:text-accent">Explore</Link>
        <Link to="/favorites" className="hover:text-accent">Favorites</Link>  
        <Link to="/trip" className="hover:text-accent">Trip Planner</Link>
        <Link to="/itinerary" className="hover:text-accent">Itinerary</Link>
        <ThemeSwitcher />
      </div>
    </nav>
  );
}
