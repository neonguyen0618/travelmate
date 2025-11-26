import axios from "axios";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

let lastCoords = "";
let lastWeather = null;

/**
 * Get weather for coordinates
 */
export async function getWeather(lat, lon) {
  if (!lat || !lon) return null;

  const coordKey = `${lat}-${lon}`;

  // Prevent duplicate fetch
  if (coordKey === lastCoords) {
    return lastWeather;
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        lat,
        lon,
        units: "imperial",
        appid: API_KEY
      }
    });

    const data = response.data;

    const weather = {
      temp: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      wind: data.wind.speed,
      description: data.weather[0].description,
      icon: data.weather[0].icon
    };

    // Save cache
    lastCoords = coordKey;
    lastWeather = weather;

    return weather;

  } catch (err) {
    console.error("Weather Error:", err);
    return null;
  }
}
