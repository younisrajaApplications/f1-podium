import "./styles.css";
import DriverSelect from "./components/DriverSelect";
import { useCallback, useEffect, useState, useMemo } from "react";
import ModelCompare from "./components/ModelCompare";
import { fetchCurrentRoster } from "./api/ergast";
import PastResultsPanel from "./components/PastResultsPanel";

export default function App() {

  //Live roster
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [rosterError, setRosterError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingRoster(true);
        const live = await fetchCurrentRoster();
        if (!cancelled) setRoster(live);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setRosterError(
            "Couldn’t fetch the current drivers. Using a tiny fallback list."
          );
          // Minimal fallback so the UI is usable offline
          setRoster([
            { id: "ver", name: "Max Verstappen", code: "VER", team: "Red Bull" },
            { id: "nor", name: "Lando Norris", code: "NOR", team: "McLaren" },
            { id: "lec", name: "Charles Leclerc", code: "LEC", team: "Ferrari" },
            { id: "ham", name: "Lewis Hamilton", code: "HAM", team: "Mercedes" },
            { id: "rus", name: "George Russell", code: "RUS", team: "Mercedes" },
          ]);
        }
      } finally {
        if (!cancelled) setLoadingRoster(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  //Picks for the different positions

  const [picks, setPicks] = useState({1: null, 2: null, 3: null,});

  const toPodiumShape = (src) => ({
    1: src[1] ? { name: src[1].name, code: src[1].code } : null,
    2: src[2] ? { name: src[2].name, code: src[2].code } : null,
    3: src[3] ? { name: src[3].name, code: src[3].code } : null,
  });

  const userPodium = toPodiumShape(picks);

  // Model picks
  const [modelPicks, setModelPicks] = useState({ 1: null, 2: null, 3: null });

  // Model picks generation - random distinct drivers for now

  const pick3 = useCallback((arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i],a[j]] = [a[j], a[i]];
    }
    return a.slice(0,3);
  }, []);

  const generateMockModel = useCallback(() => {
    const chosen = pick3(roster.length ? roster : []);
    if (chosen.length === 3) {
      setModelPicks({
        1: { name: chosen[0].name, code: chosen[0].code },
        2: { name: chosen[1].name, code: chosen[1].code },
        3: { name: chosen[2].name, code: chosen[2].code },
      });
    }
  }, [pick3, roster]);

  useEffect(() => {
    generateMockModel();
  }, [generateMockModel]);

  const clear = () => setPicks({1: null, 2: null, 3: null,});

  return (
    <div className="page">
      <header className="header">
        <div className="title">F1 Podium Predictor</div>
        <div className="subtle">Step 4 - Picks From Current Roster (Fourth Stage)</div>
      </header>

      <section className="card">
        <h3 style={{ margin: "0 0 12px" }}>Choose Your Podium</h3>
        <DriverSelect roster={roster} picks={picks} setPicks={setPicks} />
        <div className="controls">
          <button className="btn" onClick={clear}>Clear picks</button>
        </div>
      </section>
      {/* Start lights above user reveal (purely visual) */}
      <div className="start-lights">
        <span className="light on" />
        <span className="light on" />
        <span className="light on" />
        <span className="light on" />
        <span className="light on" />
      </div>
      <section className="card" style={{padding: 0}}>
        <ModelCompare
          userPicks={userPodium}
          modelPicks={modelPicks}
          onRefreshModel={generateMockModel}
        />
      </section>
      <PastResultsPanel />
    </div>
  );
}
