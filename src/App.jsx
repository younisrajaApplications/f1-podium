import "./styles.css";
import Podium from "./components/Podium";
import DriverSelect from "./components/DriverSelect";
import { useCallback, useEffect, useState, useMemo } from "react";
import ModelCompare from "./components/ModelCompare";

// Create mock roster which will later be replaced

const useRoster = () => useMemo(() => [
  { id: "ver", name: "Max Verstappen", code: "VER", team: "Red Bull" },
  { id: "nor", name: "Lando Norris", code: "NOR", team: "McLaren" },
  { id: "lec", name: "Charles Leclerc", code: "LEC", team: "Ferrari" },
  { id: "ham", name: "Lewis Hamilton", code: "HAM", team: "Mercedes" },
  { id: "rus", name: "George Russell", code: "RUS", team: "Mercedes" },
], []);

function pick3(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i],a[j]] = [a[j], a[i]];
  }
  return a.slice(0,3);
}

export default function App() {
  const roster = useRoster();

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
  const generateMockModel = useCallback(() => {
    const [p1, p2, p3] = pick3(roster);
    setModelPicks({
      1: { name: p1.name, code: p1.code },
      2: { name: p2.name, code: p2.code },
      3: { name: p3.name, code: p3.code },
    });
  }, [roster]);

  useEffect(() => {
    generateMockModel();
  }, [generateMockModel]);

  const clear = () => setPicks({1: null, 2: null, 3: null,});

  return (
    <div className="page">
      <header className="header">
        <div className="title">F1 Podium Predictor</div>
        <div className="subtle">Step 3 - User Picks vs Random Pick Model (Third Stage)</div>
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
    </div>
  );
}
