// src/components/ExploreFilters.jsx
import { FILTER_CATEGORIES } from "../data/filters";

export default function ExploreFilters({ filters, setFilters }) {
  const toggleCategory = (id) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  };

  const updateRadius = (radius) => {
    setFilters((prev) => ({ ...prev, radius }));
  };

  return (
    <div className="bg-bgSecondary p-4 rounded shadow mb-4">
      <h3 className="text-lg font-semibold mb-3">Filters</h3>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {FILTER_CATEGORIES.map((cat) => (
          <label
            key={cat.id}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={filters.categories.includes(cat.id)}
              onChange={() => toggleCategory(cat.id)}
            />
            <span className="text-sm">{cat.name}</span>
          </label>
        ))}
      </div>

      {/* Radius */}
      <div className="mt-3">
        <label className="text-sm font-medium">Search Radius</label>
        <input
          type="range"
          min="1000"
          max="20000"
          step="1000"
          value={filters.radius}
          onChange={(e) => updateRadius(Number(e.target.value))}
          className="w-full mt-1"
        />
        <div className="text-xs opacity-70 mt-1">
          {Math.round(filters.radius / 1000)} km
        </div>
      </div>
    </div>
  );
}
