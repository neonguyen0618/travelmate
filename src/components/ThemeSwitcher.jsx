import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useContext(ThemeContext);

  const themes = [
    { id: "ocean", name: "Ocean Blue" },
    { id: "emerald", name: "Emerald Green" },
    { id: "sunset", name: "Sunset Orange" },
    { id: "dark", name: "Dark Mode" },
    { id: "light", name: "Minimal Light" },
  ];

  return (
    <select
      className="p-2 rounded bg-bgPrimary text-textPrimary border border-accent"
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
    >
      {themes.map((t) => (
        <option key={t.id} value={t.id}>{t.name}</option>
      ))}
    </select>
  );
}
