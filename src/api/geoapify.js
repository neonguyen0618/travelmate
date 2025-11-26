import axios from "axios";
import { mapCategoryToSearchSet } from "../utils/categoryMap";

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const BASE_URL = "https://api.geoapify.com/v2/places";

let lastRequest = "";
let lastData = null;

/**
 * Fetch places (POIs) from Geoapify based on coordinates + categories
 */
export async function getPlaces(lat, lon, category = "tourism", radius = 20000) {
  if (!lat || !lon) return [];

  const requestKey = `${lat}-${lon}-${category}-${radius}`;

  // Prevent duplicate fetches
  if (requestKey === lastRequest) return lastData;

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        categories: category,
        filter: `circle:${lon},${lat},${radius}`,    
        bias: `proximity:${lon},${lat}`,
        limit: 200,
        apiKey: API_KEY
      }
    });

    const places = response.data.features.map((place) => ({
      id: place.properties.place_id,
      name: place.properties.name || "Unnamed Place",
      category: place.properties.categories?.[0] || category,
      address: place.properties.formatted,
      lat: place.properties.lat,
      lon: place.properties.lon,
      rating: place.properties.rating || null,
      image: place.properties.datasource?.raw?.image || null
    }));

    // Save cache
    lastRequest = requestKey;
    lastData = places;

    return places;

  } catch (err) {
    console.error("Geoapify Error:", err);
    return [];
  }
}

/**
 * Get detailed information for one place
 */
export async function getPlaceDetails(placeId) {
  if (!placeId) return null;

  try {
    const url = `https://api.geoapify.com/v2/place-details`;
    const response = await axios.get(url, {
      params: {
        id: placeId,
        apiKey: API_KEY
      }
    });

    const props = response.data.features?.[0]?.properties;
    if (!props) return null;

    return {
      id: placeId,
      name: props.name || "Unnamed Place",
      address: props.formatted,
      categories: props.categories || [],
      lat: props.lat,
      lon: props.lon,
      website: props.website || null,
      openingHours: props.opening_hours || null
    };

  } catch (err) {
    console.error("Geoapify Place Details Error:", err);
    return null;
  }
}

/**
 * Get nearby places based on the selected place’s category.
 */
export async function getNearbyPlaces(lat, lon, primaryCategory) {
  if (!lat || !lon) return [];

  const categories = mapCategoryToSearchSet(primaryCategory);

  const BASE_URL = "https://api.geoapify.com/v2/places";

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        categories,                     // ← REQUIRED!!!
        filter: `circle:${lon},${lat},800`,  // LON,LAT
        bias: `proximity:${lon},${lat}`,
        limit: 20,
        apiKey: import.meta.env.VITE_GEOAPIFY_API_KEY
      },
    });

    return response.data.features.map((place) => ({
      id: place.properties.place_id,
      name: place.properties.name || "Unnamed Place",
      category: place.properties.categories?.[0] || "unknown",
      address: place.properties.formatted,
      lat: place.properties.lat,
      lon: place.properties.lon
    }));

  } catch (err) {
    console.error("Geoapify Nearby Error:", err);
    return [];
  }
}
