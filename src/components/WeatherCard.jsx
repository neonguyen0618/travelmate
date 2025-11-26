// src/components/WeatherCard.jsx
export default function WeatherCard({ city, weather }) {
  if (!weather || !city) return null;

  const { temp, feelsLike, humidity, wind, description, icon } = weather;

  return (
    <div className="bg-bgSecondary rounded-lg p-4 shadow flex items-center gap-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">
          Weather in {city.name}, {city.stateCode}
        </h3>
        <p className="capitalize opacity-80 mb-1">{description}</p>
        <p className="text-2xl font-bold">{Math.round(temp)}°F</p>
        <p className="text-sm opacity-70">
          Feels like {Math.round(feelsLike)}°F · Humidity {humidity}% · Wind {wind} mph
        </p>
      </div>

      {icon && (
        <img
          src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
          alt="weather icon"
          className="ml-auto w-16 h-16"
        />
      )}
    </div>
  );
}

