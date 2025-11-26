// src/components/SearchBar.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { usCities } from "../data/usCities";

export default function SearchBar({ onSearch, savedValue = "" }) {
  const [query, setQuery] = useState(savedValue || "");
  const [lastSearch, setLastSearch] = useState(savedValue || "");
  const [dropdownForcedClosed, setDropdownForcedClosed] = useState(false);

  const dropdownRef = useRef(null);
  const enterTimerRef = useRef(null);

  /* ----------------------------------------------------------
     Derive suggestions using memoization
     (No state updates inside effects)
  ---------------------------------------------------------- */
  const computedSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();

    return usCities
      .filter(({ city }) => city.toLowerCase().startsWith(lower))
      .slice(0, 8);
  }, [query]);

  /* ----------------------------------------------------------
     Final dropdown visibility state
     - Opens when typing
     - Closes when clicking outside or selecting a suggestion
  ---------------------------------------------------------- */
  const dropdownOpen =
    query.trim().length > 0 &&
    computedSuggestions.length > 0 &&
    dropdownForcedClosed === false;

  /* ----------------------------------------------------------
     RUN SEARCH (safe, prevents duplicates)
  ---------------------------------------------------------- */
  const runSearch = () => {
    if (!query.trim()) return;

    const normalized = query.trim().toLowerCase();
    if (normalized === lastSearch.toLowerCase()) {
      console.log("Duplicate search prevented.");
      return;
    }

    setLastSearch(query);
    onSearch(query);
    setDropdownForcedClosed(true);
  };

  /* ----------------------------------------------------------
     DEBOUNCED ENTER KEY
  ---------------------------------------------------------- */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      enterTimerRef.current = setTimeout(runSearch, 300);
    }
  };

  /* ----------------------------------------------------------
     CLICK A SUGGESTION
  ---------------------------------------------------------- */
  const handleSuggestionClick = (entry) => {
    const pretty = `${entry.city}, ${entry.state}`;
    const clean = entry.city;

    setQuery(pretty);
    setLastSearch(pretty);
    setDropdownForcedClosed(true);

    onSearch(clean);
  };

  /* ----------------------------------------------------------
     CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  ---------------------------------------------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownForcedClosed(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ----------------------------------------------------------
     OPEN DROPDOWN WHEN USER TYPES
  ---------------------------------------------------------- */
  const handleChange = (value) => {
    setQuery(value);
    setDropdownForcedClosed(false); // reopen
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* SEARCH INPUT */}
      <input
        type="text"
        value={query}
        placeholder="Search U.S. cities…"
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full p-3 bg-bgSecondary border border-accent rounded text-textPrimary"
      />

      {/* SUGGESTIONS DROPDOWN */}
      {dropdownOpen && (
        <ul className="absolute bg-bgPrimary border border-accent mt-1 w-full rounded shadow-lg z-30 max-h-60 overflow-y-auto">
          {computedSuggestions.map((entry, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(entry)}
              className="p-2 cursor-pointer hover:bg-accent hover:text-white transition"
            >
              {entry.city}, {entry.state}
            </li>
          ))}
        </ul>
      )}

      {/* SEARCH BUTTON */}
      <button
        onClick={runSearch}
        disabled={query === lastSearch}
        className={`mt-2 w-full py-2 rounded text-white
        ${
          query === lastSearch
            ? "opacity-40 cursor-not-allowed bg-accent"
            : "bg-accent hover:bg-accent/90"
        }`}
      >
        Search
      </button>
    </div>
  );
}
