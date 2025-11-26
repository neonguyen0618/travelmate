import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "leaflet/dist/leaflet.css";

import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { TripsProvider } from "./context/TripsContext";
import { ExploreProvider } from "./context/ExploreContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <FavoritesProvider>
        <TripsProvider>
          <ExploreProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ExploreProvider>
        </TripsProvider>
      </FavoritesProvider>
    </ThemeProvider>
  </React.StrictMode>
);
