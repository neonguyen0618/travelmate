import { createContext, useState, useEffect } from "react";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const stored = JSON.parse(localStorage.getItem("favorites")) || [];

  const [favorites, setFavorites] = useState(stored);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (place) => {
    if (!favorites.some((p) => p.id === place.id)) {
      setFavorites([...favorites, place]);
    }
  };

  const removeFavorite = (id) => {
    setFavorites(favorites.filter((p) => p.id !== id));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
