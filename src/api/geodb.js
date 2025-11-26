import axios from "axios";

const API_KEY = import.meta.env.VITE_GEODB_API_KEY;
const BASE_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities";

let lastQuery = "";
let lastResult = null;

/**
 * Get latitude and longitude for a city
 */
export async function getCityCoordinates(cityName) {
  cityName = cityName.trim();

  if (!cityName) return null;

  // Prevent repeated calls
  if (cityName.toLowerCase() === lastQuery.toLowerCase()) {
    return lastResult;
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        namePrefix: cityName,
        limit: 1,
        countryIds: "US",           // limit to USA
        sort: "-population",
        types: "CITY",
      },
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
      }
    });

    const city = response.data.data[0];

    if (!city) return null;

    const result = {
      name: city.city,
      state: city.region,
      stateCode: city.regionCode,
      country: city.countryCode,
      postalCode: city.postalCode,
      lat: city.latitude,
      lon: city.longitude
    };

    // Save cache
    lastQuery = cityName;
    lastResult = result;

    return result;

  } catch (error) {
    console.error("GeoDB Error:", error);
    return null;
  }
}
