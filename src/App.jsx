import "./styles.css";
import Podium from "./components/Podium";
import DriverSelect from "./components/DriverSelect";
import { useState } from "react";

export default function App() {
  // Create mock roster which will later be replaced

  const roster = [
    { id: "ver", name: "Max Verstappen", code: "VER", team: "Red Bull" },
    { id: "nor", name: "Lando Norris", code: "NOR", team: "McLaren" },
    { id: "lec", name: "Charles Leclerc", code: "LEC", team: "Ferrari" },
    { id: "ham", name: "Lewis Hamilton", code: "HAM", team: "Mercedes" },
    { id: "rus", name: "George Russell", code: "RUS", team: "Mercedes" },
  ];

  //Picks for the different positions

  const [picks, setPicks] = useState({1: null, 2: null, 3: null,});

  const podiumPicks = {
    1: picks[1] ? { name: picks[1].name, code: picks[1].code } : null,
    2: picks[2] ? { name: picks[2].name, code: picks[2].code } : null,
    3: picks[3] ? { name: picks[3].name, code: picks[3].code } : null,
  };

  const clear = () => setPicks({1: null, 2: null, 3: null,});

  return (
    <div className="page">
      <header className="header">
        <div className="title">F1 Podium Predictor</div>
        <div className="subtle">Step 2 - User Picks Drivers (Second Stage)</div>
      </header>

      <section className="card">
        <h3 style={{ margin: "0 0 8px" }}>Choose Your Podium</h3>
        <DriverSelect roster={roster} picks={picks} setPicks={setPicks} />
        <div className="controls">
          <button className="btn" onClick={clear}>Clear picks</button>
        </div>
        <Podium picks={podiumPicks} />
      </section>
    </div>
  );
}
