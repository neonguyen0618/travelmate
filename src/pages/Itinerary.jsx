import { useState, useEffect } from "react";

export default function Itinerary() {
  const stored = JSON.parse(localStorage.getItem("itinerary")) || [];
  const [days, setDays] = useState(stored);

  useEffect(() => {
    localStorage.setItem("itinerary", JSON.stringify(days));
  }, [days]);

  const addDay = () => {
    setDays([...days, { title: "", notes: "" }]);
  };

  const updateDay = (index, field, value) => {
    const draft = [...days];
    draft[index][field] = value;
    setDays(draft);
  };

  const removeDay = (index) => {
    const updated = [...days];
    updated.splice(index, 1);
    setDays(updated);
  };

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Itinerary Builder</h1>

      <button
        onClick={addDay}
        className="bg-accent text-white px-4 py-2 rounded mb-4"
      >
        + Add Day
      </button>

      {days.map((day, i) => (
        <div key={i} className="bg-bgSecondary p-4 rounded shadow mb-4">

          {/* Day Title */}
          <input
            className="w-full bg-bgPrimary p-2 rounded mb-2"
            placeholder={`Day ${i + 1} Title`}
            value={day.title}
            onChange={(e) => updateDay(i, "title", e.target.value)}
          />

          {/* Notes */}
          <textarea
            className="w-full bg-bgPrimary p-2 rounded"
            placeholder="Notes like things to do..."
            value={day.notes}
            onChange={(e) => updateDay(i, "notes", e.target.value)}
          />

          {/* Remove Button */}
          <button
            onClick={() => removeDay(i)}
            className="text-red-600 underline text-sm mt-2"
          >
            Remove
          </button>
        </div>
      ))}
    </section>
  );
}
