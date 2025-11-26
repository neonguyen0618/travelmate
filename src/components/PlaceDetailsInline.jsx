// src/components/PlaceDetailsInline.jsx
import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { getPlaceDetails, getNearbyPlaces } from "../api/geoapify";
import { getWikipediaSummary } from "../api/wiki";

/* ----------------------------------------------------------
   SMART WIKI QUERY BUILDER
---------------------------------------------------------- */
function buildWikiQueries(details) {
  const name = details.name?.trim() || "";

  const parts = details.address?.split(",").map(s => s.trim()) || [];
  const city = parts[1] || "";
  const state = parts[2] || "";

  return [
    name,
    `${name} ${city}`,
    `${name} ${city} ${state}`,
    `${name} USA`,
  ].filter(Boolean);
}

export default function PlaceDetailsInline({ placeId, initialPlace, collapsedByDefault = true }) {
  const [isOpen, setIsOpen] = useState(!collapsedByDefault);
  const [place, setPlace] = useState(initialPlace || null);
  const [wiki, setWiki] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [error, setError] = useState("");

  /* ----------------------------------------------------------
     LOAD DETAILS ONLY WHEN EXPANDED
  ---------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen || loadedOnce) return;

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");
      setWiki(null);
      setNearby([]);

      try {
        const details = await getPlaceDetails(placeId);
        if (cancelled) return;

        if (!details) {
          setError("Could not load place details.");
          setLoading(false);
          return;
        }

        setPlace(details);

        // Build multiple search variations
        const queries = buildWikiQueries(details);

        let wikiData = null;
        for (const q of queries) {
          wikiData = await getWikipediaSummary(q);
          if (wikiData) break;
        }

        const category =
          details.categories?.[0] ||
          details.category ||
          "tourism";

        const nearData = await getNearbyPlaces(
          details.lat,
          details.lon,
          category
        );

        if (cancelled) return;

        setWiki(wikiData || null);
        setNearby(nearData || []);
        setLoadedOnce(true);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Error loading extra information.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [isOpen, loadedOnce, placeId]);

  /* ----------------------------------------------------------
     COLLAPSIBLE HEADER
  ---------------------------------------------------------- */
  return (
    <div className="mt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-accent underline text-sm mb-2"
      >
        {isOpen ? "Hide details ▲" : "Show details ▼"}
      </button>

      {/* COLLAPSIBLE CONTENT */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-accent/30 pt-3 space-y-3 text-sm">

          {/* Loading */}
          {loading && (
            <div className="mt-2">
              <LoadingSpinner />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}

          {/* Base place information */}
          {place && (
            <div className="space-y-1">
              {place.address && (
                <p className="opacity-80">{place.address}</p>
              )}

              {place.website && (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent underline text-xs"
                >
                  Visit website
                </a>
              )}

              {place.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {place.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 bg-bgSecondary border border-accent/50 rounded-full text-[11px]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wikipedia */}
          {wiki && (
            <div className="bg-bgPrimary/70 rounded p-2">
              <h4 className="font-semibold text-sm mb-1">
                {wiki.title}
              </h4>
              <p className="text-xs opacity-80 mb-1">{wiki.extract}</p>

              {wiki.url && (
                <a
                  href={wiki.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-accent underline"
                >
                  Read more on Wikipedia
                </a>
              )}
            </div>
          )}

          {/* Nearby places */}
          {nearby.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-1">
                Nearby places ({nearby.length})
              </h4>

              <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {nearby.slice(0, 10).map((p) => (
                  <li key={p.id} className="text-xs">
                    <span className="font-medium">
                      {p.name || "Unnamed place"}
                    </span>
                    {p.category && (
                      <span className="opacity-70"> · {p.category}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
