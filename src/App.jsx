import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Favorites from "./pages/Favorites";
import TripPlanner from "./pages/TripPlanner";
import Itinerary from "./pages/Itinerary";

export default function App() {
  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/favorites" element={<Favorites />} />         
        <Route path="/trip" element={<TripPlanner />} />
        <Route path="/itinerary" element={<Itinerary />} />          
      </Routes>
    </div>
  );
}
