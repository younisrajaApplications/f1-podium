import "./styles.css";
import DriverSelect from "./components/DriverSelect";
import { useCallback, useEffect, useState, useMemo } from "react";
import ModelCompare from "./components/ModelCompare";
import PastResultsPanel from "./components/PastResultsPanel";
import UpcomingRaceBar from "./components/UpcomingRaceBar";
import { toPodiumShape, clear } from "./utils/podium";
import { useRoster } from "./utils/roster";
import { fetchModelPrediction } from "./api/predict";

export default function App() {


  const {roster, loadingRoster, rosterError, refresh} = useRoster();
  
  //Picks for the different positions
  const [picks, setPicks] = useState({1: null, 2: null, 3: null,});
  const userPodium = useMemo(() => toPodiumShape(picks), [picks]);

  const [savedUser, setSavedUser] = useState(null);
  const [savedModel, setSavedModel] = useState(null);
  const [saveError, setSaveError] = useState("");

  // Model picks
  const [modelPicks, setModelPicks] = useState({ 1: null, 2: null, 3: null });
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState("");
  const [modelMeta, setModelMeta] = useState(null);

  const hasFull = useMemo(() => {
    const p = userPodium;
    return p && [1,2,3].every(pos => p[pos] && (p[pos].code || p[pos].name));
  }, [userPodium]);

  // Saving user prediction
  async function onSaveUser() {
    if (!hasFull) return;
    setSaveError("");
    try {
      const res = await saveUpcoming("user", userPodium);
      setSavedUser(userPodium);
    } catch (e) {
      console.error(e);
      setSaveError("Couldn't save your prediction.");
    }
  }

  // Saving model predictions
  async function onSaveModel() {
    if (![1,2,3].every(pos => modelPicks[pos])) return;
    setSaveError("");
    try {
      const res = await saveUpcoming("model", modelPicks);
      setSavedModel(modelPicks);
    } catch (e) {
      console.error(e);
      setSaveError("Couldn't save model prediction.");
    }
  }

  // Load existing predictions
  useEffect(() => {
    (async () => {
      try {
        const data = await listUpcoming();
        const lastUser = data.items.find(x => x.kind === "user");
        const lastModel = data.items.find(x => x.kind === "model");
        if (lastUser) setSavedUser(lastUser.picks);
        if (lastModel) setSavedModel(lastModel.picks);
      } catch {}
    })();
  }, []);

  // Generate model from backend API
  const generateModelFromAPI = useCallback(async () => {
    setModelLoading(true);
    setModelError("");
    try {
      const out = await fetchModelPrediction("auto");
      setModelPicks({
        1: out.podium[1] || null,
        2: out.podium[2] || null,
        3: out.podium[3] || null,
      });

      setModelMeta({timeStamp: out.madeAt});
    } catch (e) {
      console.error(e);
      setModelError("Couldn’t build a prediction right now.");
    } finally {
      setModelLoading(false);
    }
  }, []);

  useEffect(() => { generateModelFromAPI(); }, [generateModelFromAPI]);

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
        <div className="subtle"> Step 9 - Persistence Layer: Optimistic UI, Caching & DB Sync </div>
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
          onRefreshModel={generateModelFromAPI}
          modelLoading={modelLoading}
          modelError={modelError}
          modelMeta={modelMeta?.timeStamp}
        />
      </section>
      <UpcomingRaceBar userPicks={toPodiumShape(picks)} modelPicks={modelPicks} />
      <PastResultsPanel />
    </div>
  );
}
