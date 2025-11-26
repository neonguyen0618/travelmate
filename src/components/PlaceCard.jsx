// src/components/PlaceCard.jsx
import { useContext, forwardRef } from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import { TripsContext } from "../context/TripsContext";
import PlaceDetailsInline from "./PlaceDetailsInline";

const PlaceCard = forwardRef(function PlaceCard(
  { 
    place, 
    selectedPlaceId, 
    setSelectedPlaceId,
    expandedPlaceId, 
    setExpandedPlaceId,
    selectedCoords,
    setSelectedCoords,
  },
  ref
) {
  const { addFavorite } = useContext(FavoritesContext);
  const { addToTrip } = useContext(TripsContext);

  const isSelected = selectedPlaceId === place.id;
  const isExpanded = expandedPlaceId === place.id;

  /* ----------------------------------------------------------
     HANDLE CARD CLICK (map selection + highlight)
  ---------------------------------------------------------- */
  const handleCardClick = () => {
    setSelectedPlaceId(place.id);

    if (setSelectedCoords) {
      setSelectedCoords({ lat: place.lat, lon: place.lon });
    }
  };

  /* ----------------------------------------------------------
     TOGGLE INLINE DETAILS ONLY
  ---------------------------------------------------------- */
  const toggleDetails = (e) => {
    e.stopPropagation(); // prevent triggering card highlight
    setExpandedPlaceId(isExpanded ? null : place.id);
    setSelectedPlaceId(place.id);
  };

  return (
    <div
      ref={ref}
      className={`
        bg-bgSecondary p-4 rounded shadow transition flex flex-col h-full cursor-pointer
        ${isSelected ? "ring-2 ring-accent shadow-lg" : "hover:shadow-lg"}
      `}
      onClick={handleCardClick}
    >
      {/* PLACE BASIC INFO */}
      <h3 className="text-lg font-semibold mb-1">{place.name}</h3>
      <p className="text-sm opacity-80 mb-1">{place.address}</p>
      <p className="text-xs uppercase opacity-70 mb-2">{place.category}</p>

      {/* ACTION BUTTONS */}
      <div className="mt-auto flex justify-between items-center pt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            addFavorite(place);
          }}
          className="text-accent text-sm"
        >
          + Favorite
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            addToTrip(place);
          }}
          className="text-green-500 text-sm"
        >
          + Trip
        </button>

        <button
          type="button"
          onClick={toggleDetails}
          className="text-sm underline text-accent"
        >
          {isExpanded ? "Hide details" : "Details"}
        </button>
      </div>

      {/* INLINE COLLAPSIBLE DETAILS */}
      {isExpanded && (
        <div className="mt-2">
          <PlaceDetailsInline
            placeId={place.id}
            initialPlace={place}
            collapsedByDefault={false} // start opened when expanded
          />
        </div>
      )}
    </div>
  );
});

export default PlaceCard;
