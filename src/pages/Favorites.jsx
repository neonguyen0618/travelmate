// src/pages/Favorites.jsx
import { useContext, useState } from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import PlaceCard from "../components/PlaceCard";

export default function Favorites() {
  const { favorites, removeFavorite } = useContext(FavoritesContext);

  // LOCAL STATE FOR DETAILS
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [expandedPlaceId, setExpandedPlaceId] = useState(null);

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Favorites</h2>

      {favorites.length === 0 ? (
        <p>No favorites saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {favorites.map((place) => (
            <div key={place.id} className="relative">
              
              <PlaceCard
                place={place}
                selectedPlaceId={selectedPlaceId}
                setSelectedPlaceId={setSelectedPlaceId}
                expandedPlaceId={expandedPlaceId}
                setExpandedPlaceId={setExpandedPlaceId}
                selectedCoords={null}
                setSelectedCoords={null}
              />

              <button
                onClick={() => removeFavorite(place.id)}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
