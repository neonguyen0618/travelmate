// src/components/MapView.jsx
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useMemo, useState, useEffect } from "react";

// Fix default Leaflet icon paths
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import redMarkerIcon from "../assets/icons/marker-red.png";
import PlaceDetailsInline from "./PlaceDetailsInline";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Default blue marker (Leaflet)
const defaultIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Google-style red selected marker
const selectedIcon = new L.Icon({
  iconUrl: redMarkerIcon,
  shadowUrl: markerShadow,
  iconSize: [40, 45],
  iconAnchor: [20, 45],
});

export default function MapView({
  center,
  places,
  customLocation,
  setCustomLocation,
  selectedPlaceId,
  setSelectedPlaceId,
  expandedPlaceId,
  setExpandedPlaceId,
  selectedCoords,
  setSelectedCoords,
}) 
{
  const mapCenter = useMemo(() => [center.lat, center.lon], [center.lat, center.lon]);
  const [pinPosition, setPinPosition] = useState(customLocation);

  // Sync external customLocation → internal pin
  useEffect(() => {
    setPinPosition(customLocation);
  }, [customLocation]);

  // Component to capture map click events
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPinPosition({ lat, lon: lng });
        if (setCustomLocation) {
          setCustomLocation({ lat, lon: lng });     // Notify parent
        }
      }
    });
    return null;
  }

  // Recenter map when selecting a place from card or clicking marker
  useEffect(() => {
    if (!selectedPlaceId || !places.length) return;

    const selected = places.find((p) => p.id === selectedPlaceId);
    if (!selected) return;

    // flyTo for smooth animation
    window.map?.flyTo([selected.lat, selected.lon], 15);
  }, [selectedPlaceId]);

  useEffect(() => {
    if (!selectedCoords) return;
    if (!window.map) return;

    window.map.flyTo([selectedCoords.lat, selectedCoords.lon], 15, {
      duration: 0.6,
    });
  }, [selectedCoords]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        className="w-full h-full"
        whenCreated={(map) => (window.map = map)}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler />

        {/* User-Dropped Pin */}
        {pinPosition && (
          <Marker
            position={[pinPosition.lat, pinPosition.lon]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const { lat, lng } = marker.getLatLng();
                const newPos = { lat, lon: lng };
                setPinPosition(newPos);
                if (setCustomLocation) {
                  setCustomLocation(newPos);    // Notify parent
                }
              },
            }}
          >
            <Popup>
              <div className="text-sm">
                Custom Search Point  
                <br />
                Lat: {pinPosition.lat.toFixed(5)}
                <br />
                Lon: {pinPosition.lon.toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Places Returned by API */}
        {places.map((place) => (
          <Marker 
            key={place.id} 
            position={[place.lat, place.lon]}
            icon={selectedPlaceId === place.id ? selectedIcon : defaultIcon}
            eventHandlers={{ click: () => setSelectedPlaceId(place.id),}}
          >
            <Popup>
              <div className="space-y-2 text-sm">
                <div className="font-semibold">{place.name}</div>

                {place.address && (
                  <div className="opacity-80 text-xs">{place.address}</div>
                )}

                <div className="opacity-70 text-xs capitalize">
                  {place.category}
                  {place.rating ? ` · Rating: ${place.rating}` : ""}
                </div>

                {/* Details button toggles inline details */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlaceId(place.id);
                    if (setSelectedCoords) {
                      setSelectedCoords({ lat: place.lat, lon: place.lon });
                    }
                    if (setExpandedPlaceId) {
                      setExpandedPlaceId(
                        expandedPlaceId === place.id ? null : place.id
                      );
                    }
                  }}
                  className="mt-2 inline-block px-3 py-1 bg-accent text-white rounded text-xs cursor-pointer hover:opacity-90"
                >
                  {expandedPlaceId === place.id ? "Hide details" : "Details"}
                </button>

                {/* Inline details inside popup */}
                {expandedPlaceId === place.id && (
                  <PlaceDetailsInline placeId={place.id} initialPlace={place} />
                )}
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
}
