import "./styles.css";
import DriverSelect from "./components/DriverSelect";
import { useCallback, useEffect, useState, useMemo } from "react";
import ModelCompare from "./components/ModelCompare";
import PastResultsPanel from "./components/PastResultsPanel";
import UpcomingRaceBar from "./components/UpcomingRaceBar";
import { toPodiumShape, clear } from "./utils/podium";
import { useRoster } from "./utils/roster";

export default function App() {


  const {roster, loadingRoster, rosterError, refresh} = useRoster();
  
  //Picks for the different positions
  const [picks, setPicks] = useState({1: null, 2: null, 3: null,});

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

  return (
    <div className="page">
      <header className="header">
        <div className="title">F1 Podium Predictor</div>
        <div className="subtle">Step 7 - Create & Save Predictions (Seventh Stage)</div>
      </header>

      <section className="card">
        <h3 style={{ margin: "0 0 12px" }}>Choose Your Podium</h3>
        <DriverSelect roster={roster} picks={picks} setPicks={setPicks} />
        <div className="controls">
          <button className="btn" onClick={() => clear(setPicks)}>Clear picks</button>
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
      <UpcomingRaceBar userPicks={toPodiumShape(picks)} modelPicks={modelPicks} />
      <PastResultsPanel />
    </div>
  );
}
