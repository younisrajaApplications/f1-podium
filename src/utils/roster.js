import { fetchCurrentRoster } from "../api/ergast";
import { useState, useRef, useEffect } from "react";

// tiny offline fallback so UI remains usable
const FALLBACK = [
  { id: "ver", name: "Max Verstappen", code: "VER", team: "Red Bull" },
  { id: "nor", name: "Lando Norris", code: "NOR", team: "McLaren" },
  { id: "lec", name: "Charles Leclerc", code: "LEC", team: "Ferrari" },
  { id: "ham", name: "Lewis Hamilton", code: "HAM", team: "Mercedes" },
  { id: "rus", name: "George Russell", code: "RUS", team: "Mercedes" },
];

export function useRoster() {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const cancelled = useRef(false);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const live = await fetchCurrentRoster();
      if (!cancelled.current) setRoster(live);
    } catch (err) {
      console.error(err);
      if (!cancelled.current) {
        setError("Couldn’t fetch the current drivers. Using a tiny fallback list.");
        setRoster(FALLBACK);
      }
    } finally {
      if (!cancelled.current) setLoading(false);
    }
  };

  useEffect(() => {
    cancelled.current = false;
    load();
    return () => {
      cancelled.current = true;
    };
    // deps intentionally empty: run once on mount
  }, []);

  const refresh = () => load();

  return { roster, loading, error, refresh };
}