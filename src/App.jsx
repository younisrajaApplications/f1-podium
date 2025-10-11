import "./styles.css";
import Podium from "./components/Podium";

export default function App() {
  // Create mock options which will later be replaced with user picks

  const userPicks = {
    1: {name: "Max Verstappen", code: "VER"},
    2: {name: "Lando Norris", code: "NOR"},
    3: {name: "Charles Leclerc", code: "LEC"},
  }

  return (
    <div className="page">
      <header className="header">
        <div className="title">F1 Podium Predictor</div>
        <div className="subtle">Step 1 - Animated Podium (First Stage)</div>
      </header>

      <section className="card">
        <h3 style={{ margin: "0 0 8px" }}>Animated Podium</h3>
        <Podium picks={userPicks} />
      </section>
    </div>
  );
}
