import { createContext, useState, useEffect } from "react";

export const TripsContext = createContext();

export const TripsProvider = ({ children }) => {
  const stored = JSON.parse(localStorage.getItem("trips")) || [];

  const [trip, setTrip] = useState(stored);

  useEffect(() => {
    localStorage.setItem("trips", JSON.stringify(trip));
  }, [trip]);

  const addToTrip = (place) => {
    if (!trip.some(p => p.id === place.id)) {
      setTrip([...trip, place]);
    }
  };

  const removeFromTrip = (id) => {
    setTrip(trip.filter(p => p.id !== id));
  };

  return (
    <TripsContext.Provider value={{ trip, addToTrip, removeFromTrip }}>
      {children}
    </TripsContext.Provider>
  );
};
