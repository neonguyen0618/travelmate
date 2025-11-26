// src/context/ExploreContext.jsx
import { createContext, useState } from "react";

export const ExploreContext = createContext();

export function ExploreProvider({ children }) {
  // PERSISTENT EXPLORE UI STATE
  const [city, setCity] = useState(null);
  const [places, setPlaces] = useState([]);
  const [weather, setWeather] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("tourism");
  const [radius, setRadius] = useState(20000);
  const [sortBy, setSortBy] = useState("distance");

  const [customLocation, setCustomLocation] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const [searchText, setSearchText] = useState("");

  return (
    <ExploreContext.Provider
      value={{
        city, setCity,
        places, setPlaces,
        weather, setWeather,

        selectedCategory, setSelectedCategory,
        radius, setRadius,
        sortBy, setSortBy,

        customLocation, setCustomLocation,
        visibleCount, setVisibleCount,

        searchText, setSearchText,
      }}
    >
      {children}
    </ExploreContext.Provider>
  );
}
