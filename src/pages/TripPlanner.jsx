// src/pages/TripPlanner.jsx
import { useContext, useState } from "react";
import { TripsContext } from "../context/TripsContext";
import PlaceCard from "../components/PlaceCard";

export default function TripPlanner() {
  const { trip, removeFromTrip } = useContext(TripsContext);

  // LOCAL STATE FOR DETAILS
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [expandedPlaceId, setExpandedPlaceId] = useState(null);

  return (
    <section className="p-6">
      <h2 className="text-3xl font-bold mb-4">Your Trip Plan</h2>

      {trip.length === 0 ? (
        <p>No places added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trip.map((place) => (
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
                onClick={() => removeFromTrip(place.id)}
                className="absolute top-2 right-2 text-red-600 underline"
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
