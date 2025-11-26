// src/pages/Explore.jsx
import { useRef, useState, useEffect, useContext } from "react";
import SearchBar from "../components/SearchBar";
import PlaceCard from "../components/PlaceCard";
import WeatherCard from "../components/WeatherCard";
import MapView from "../components/MapView";
import LoadingSpinner from "../components/LoadingSpinner";

import { getCityCoordinates } from "../api/geodb";
import { getPlaces } from "../api/geoapify";
import { getWeather } from "../api/weather";
import { ExploreContext } from "../context/ExploreContext";

const CATEGORY_OPTIONS = [
  { id: "tourism", label: "Attractions" },
  { id: "accommodation", label: "Hotels" },
  { id: "catering", label: "Food & Drinks" },
  { id: "entertainment", label: "Entertainment" },
  { id: "natural", label: "Nature" },
  { id: "commercial", label: "Shopping" },
];
const RADIUS_OPTIONS = [
  { label: "3 mi", value: 5000 },
  { label: "5 mi", value: 10000 },
  { label: "10 mi", value: 20000 },
  { label: "20 mi", value: 30000 },
  { label: "30 mi", value: 50000 },
];

export default function Explore() { 
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [error, setError] = useState("");  
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [expandedPlaceId, setExpandedPlaceId] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState(null);

  const {
    city, setCity,
    places, setPlaces,
    weather, setWeather,

    selectedCategory, setSelectedCategory,
    radius, setRadius,
    sortBy, setSortBy,

    customLocation, setCustomLocation,
    visibleCount, setVisibleCount,

    searchText, setSearchText,
  } = useContext(ExploreContext);

  const useCustomLocation = customLocation !== null;            // use custom pin instead of city center
  const sentinelRef = useRef(null);
  const placeCardRefs = useRef({});

  function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;                                           // km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
          Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) ** 2;

      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const handleUseMyLocation = () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported.");
        return;        
      }

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        setCustomLocation({ lat, lon });
        setCity({ name: "Your Location", lat, lon, stateCode: "" });

        setIsLoading(true);

        const [placesData, weatherData] = await Promise.all([
          getPlaces(lat, lon, selectedCategory, radius),
          getWeather(lat, lon)
        ]);

        setPlaces(placesData);
        setWeather(weatherData);
        setIsLoading(false);
        setSelectedPlaceId(null);
        setExpandedPlaceId(null);
      });
    };

  // When user searches a city
  const handleSearchCity = async (cityName) => {
    setError("");
    setIsLoading(true);
    setPlaces([]);
    setWeather(null);
    setCity(null);    
    setSelectedPlaceId(null);
    setExpandedPlaceId(null);

    try {
      // Extract only the city part
      const cleanCity = cityName.split(",")[0].trim();
      const coords = await getCityCoordinates(cleanCity);

      if (!coords) {
        setError("City not found in USA. Try another city from suggestions.");
        setIsLoading(false);
        return;
      }

      setCity(coords);

      // Fetch places + weather concurrently
      const [placesData, weatherData] = await Promise.all([
        getPlaces(
          useCustomLocation ? customLocation.lat : coords.lat,
          useCustomLocation ? customLocation.lon : coords.lon,
          selectedCategory,
          radius
        ),
        getWeather(coords.lat, coords.lon),
      ]);

      setPlaces(placesData);
      setVisibleCount(20);
      setWeather(weatherData);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  // When user changes category but same city
  const handleChangeCategory = async (categoryId) => {
    if (!city) return;
    if (categoryId === selectedCategory) return;

    setSelectedCategory(categoryId);
    setLoadingPlaces(true);
    setError("");

    // Auto radius per category 
    const autoRadiusMap = {
      tourism: 5000,         // 5 km
      accommodation: 5000,   // 5 km (hotels nearby)
      catering: 5000,        // 5 km (restaurants)
      entertainment: 5000,   // 5 km
      natural: 50000,        // 50 km (nature spans large areas)
      commercial: 5000       // 5 km
    };

    setRadius(autoRadiusMap[categoryId] || 5000);

    try {
      const placesData = await getPlaces(
        city.lat,
        city.lon,
        categoryId,
        autoRadiusMap[categoryId] || 5000
      );

      setPlaces(placesData);
    } catch (err) {
      console.error(err);
      setError("Could not load places for this category.");
    } finally {
      setLoadingPlaces(false);
    }
  };

  useEffect(() => {
    if (!city) return;

    async function refetchForRadius() {
      setLoadingPlaces(true);

      const targetLat = useCustomLocation ? customLocation.lat : city.lat;
      const targetLon = useCustomLocation ? customLocation.lon : city.lon;

      const placesData = await getPlaces(
        targetLat,
        targetLon,
        selectedCategory,
        radius
      );

      setPlaces(placesData);
      setLoadingPlaces(false);
    }

    refetchForRadius();
  }, [radius]);

  useEffect(() => {
    if (!city || !customLocation) return;

    async function refetchForPin() {
      setLoadingPlaces(true);

      const placesData = await getPlaces(
        customLocation.lat,
        customLocation.lon,
        selectedCategory,
        radius
      );

      setPlaces(placesData);
      setLoadingPlaces(false);
    }

    refetchForPin();
  }, [customLocation]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => {
            if (prev < places.length) return prev + 20;
            return prev;
          });
        }
      },
      { threshold: 1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [places]);

  // Scroll AFTER the card actually exists
  useEffect(() => {
    const el = placeCardRefs.current[selectedPlaceId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });      
    }
  }, [visibleCount, selectedPlaceId]);

  // Ensure selected place is rendered in DOM
useEffect(() => {
  if (!selectedPlaceId) return;

  const index = places.findIndex((p) => p.id === selectedPlaceId);
  if (index === -1) return;

  // If the selected item is outside visible list → expand visibleCount
  if (index >= visibleCount) {
    setVisibleCount(index + 1);
  }
}, [selectedPlaceId, places, visibleCount]);

  return (
    <section className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Explore Places in the USA</h2>

      <button
        onClick={handleUseMyLocation}
        className="px-4 py-2 bg-accent text-white rounded shadow hover:opacity-90"
      >
        Use My Location
      </button>

      {/* Search Bar */}
      <div className="max-w-xl">
        <SearchBar 
          onSearch={(value) => {
            setSearchText(value);
            handleSearchCity(value);
          }}
          savedValue={searchText}
        />
      </div>

      {/* Loading state for main search */}
      {isLoading && <LoadingSpinner />}

      {/* Error message */}
      {error && (
        <div className="bg-red-200 text-red-900 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* Show weather + category filters + map + results only when city exists */}
      {city && !isLoading && (
        <>        
          {/* Weather */}
          <WeatherCard city={city} weather={weather} />

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleChangeCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-sm border
                  ${
                    selectedCategory === cat.id
                      ? "bg-accent text-white border-accent"
                      : "bg-bgSecondary text-textPrimary border-accent/40"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Radius Selector */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm opacity-70">Radius:</span>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="px-3 py-1 rounded border border-accent bg-bgSecondary"
            >
              {RADIUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Selector */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm opacity-70">Sort by:</span>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 rounded border border-accent bg-bgSecondary"
            >
              <option value="distance">Distance</option>
              <option value="rating">Rating</option>
              <option value="az">A → Z</option>
            </select>
          </div>

          {/* TWO-PANE LAYOUT: LEFT = MAP, RIGHT = SCROLLABLE PLACES */}
          <div className="mt-6 flex flex-col lg:flex-row gap-6">

            {/* LEFT: FIXED MAP VIEW */}
            <div className="lg:w-1/2 lg:sticky lg:top-20 lg:h-[calc(100vh-100px)] h-[500px]">
              {/* Map */}
              <MapView
                center={useCustomLocation ? customLocation : city}
                places={places}
                customLocation={customLocation}
                setCustomLocation={setCustomLocation}
                selectedPlaceId={selectedPlaceId}
                setSelectedPlaceId={setSelectedPlaceId}
                expandedPlaceId={expandedPlaceId}
                setExpandedPlaceId={setExpandedPlaceId}
                selectedCoords={selectedCoords}
                setSelectedCoords={setSelectedCoords}
              />            
            </div>

            {/* RIGHT: SCROLLABLE PLACES SECTION */}
            <div className="lg:w-1/2 lg:h-[calc(100vh-150px)] lg:overflow-y-auto pr-2">
            
              {/* Places Loading */}
              {loadingPlaces && <LoadingSpinner />}

              {/* Places List */}
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">
                  Places near {city.name}, {city.stateCode} ({places.length})
                </h3>

                {places.length === 0 && !loadingPlaces ? (
                  <p className="opacity-80">
                    No places found for this category. Try another category or city.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {[...places]
                      .sort((a, b) => {
                        if (sortBy === "az") return a.name.localeCompare(b.name);
                        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
                        
                        // distance sorting
                        const originLat = useCustomLocation ? customLocation.lat : city.lat;
                        const originLon = useCustomLocation ? customLocation.lon : city.lon;

                        const distA = getDistance(originLat, originLon, a.lat, a.lon);
                        const distB = getDistance(originLat, originLon, b.lat, b.lon);

                        return distA - distB;
                      })
                      .slice(0, visibleCount)       // show only part of the list
                      .map((place) => (
                        <PlaceCard
                          key={place.id}
                          place={place}
                          selectedPlaceId={selectedPlaceId}
                          setSelectedPlaceId={setSelectedPlaceId}
                          expandedPlaceId={expandedPlaceId}
                          setExpandedPlaceId={setExpandedPlaceId}
                          selectedCoords={selectedCoords}
                          setSelectedCoords={setSelectedCoords}
                          ref={(el) => (placeCardRefs.current[place.id] = el)}
                        />
                      ))
                    }
                  </div>
                )}

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="h-4"></div>

                {/* Load More Button */}
                {visibleCount < places.length && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => setVisibleCount(visibleCount + 20)}
                      className="px-4 py-2 bg-accent text-white rounded hover:opacity-90"
                    >
                      Load More
                    </button>
                  </div>
                )}
            </div>               
          </div>
        </div>
        </>
      )}
    </section>
  );
}
