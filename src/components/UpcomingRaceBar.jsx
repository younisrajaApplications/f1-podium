import { useEffect, useState } from "react";
import { fetchUpcomingRace } from "../api/ergast";
import { savePrediction, getPredictions } from "../data/predictions";
import { saveUpcoming, listUpcoming } from "../api/predict"; 

export default function UpcomingRaceBar({userPicks, modelPicks}) {
    const [race, setRace] = useState(null);
    const [saved, setSaved] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try { // Trys to get the upcoming race
                const r = await fetchUpcomingRace();
                setRace(r);
                if (r) setSaved(getPredictions(r.raceId));
            } catch (e) { 
                console.error(e);
                setError("Couldn’t load upcoming race.");
            }
        })();
    }, []);

    const hasFull = (p) => p && [1,2,3].every((pos) => !!(p[pos] && (p[pos].code || p[pos].name)));

    const toSaveShape = (p) => ({
        1: p?.[1] ? { code: p[1].code || p[1].name, name: p[1].name || p[1].code } : null,
        2: p?.[2] ? { code: p[2].code || p[2].name, name: p[2].name || p[2].code } : null,
        3: p?.[3] ? { code: p[3].code || p[3].name, name: p[3].name || p[3].code } : null,
    });

    const badge = (madeAt) => {
        if (!madeAt || !race) return null;
        const when = new Date(madeAt).toISOString().slice(0,16).replace("T"," ");
        const q = race.qualifiersStart ? new Date(race.qualifiersStart) : null;
        const rs = race.raceStart ? new Date(race.raceStart) : null;
        let tag = "After race";
        if (q && new Date(madeAt) < q) tag = "Before qualifiers";
        else if (rs && new Date(madeAt) < rs) tag = "After qualifiers";
        return <span className="badge" title={when}>{tag}</span>;
    }

    useEffect(() => {
        let cancelled = false;
        (async () => {
        try {
            const data = await listUpcoming(); // { raceId, raceName, items: [...] }
            if (cancelled) return;
            // pick the latest entries per kind (user/model)
            const latestUser = data.items.find(x => x.kind === "user") || null;
            const latestModel = data.items.find(x => x.kind === "model") || null;
            setSaved({
            user: latestUser,
            model: latestModel,
            });
        } catch (e) {
            if (!cancelled) setError("Couldn't load saved predictions.");
            console.error(e);
        }
        })();
        return () => { cancelled = true; };
    }, []);

    const saveUser = async () => {
        if (!hasFull(userPicks)) {
            setError("Please select 1st, 2nd and 3rd before saving your prediction.");
            return;
        }
        setError("");
        try {
            await saveUpcoming("user", toSaveShape(userPicks));
            // re-fetch latest
            const data = await listUpcoming();
            const latestUser = data.items.find(x => x.kind === "user") || null;
            setSaved(s => ({ ...s, user: latestUser }));
        } catch (e) {
            console.error(e);
            setError("Couldn't save your prediction.");
        }
    };

    const saveModel = async () => {
        if (!hasFull(modelPicks)) {
            setError("Please run the model prediction.");
            return;
        }
        setError("");
        try {
            await saveUpcoming("model", toSaveShape(modelPicks));
            // re-fetch latest
            const data = await listUpcoming();
            const latestModel = data.items.find(x => x.kind === "model") || null;
            setSaved(s => ({ ...s, model: latestModel }));
        } catch (e) {
            console.error(e);
            setError("Couldn't save model prediction.");
        }
    };

    const renderSavedLine = (label, slot) => {
        const rec = saved?.[slot];
        if (!rec) return <div className="helper">No {label.toLowerCase()} prediction saved yet.</div>;

        // backend returns: { id, raceId, raceName, mode, kind, picks, madeAt }
        const p = rec.picks || {};
        const n = (x) => x?.name || x?.code || "—";
        const madeAt = rec.madeAt ? new Date(rec.madeAt).toLocaleString() : "—";

        return (
        <div className="helper">
            <strong>{label} Prediction:</strong>{" "}
            1. {n(p["1"])} &nbsp; 2. {n(p["2"])} &nbsp; 3. {n(p["3"])} &nbsp; 
            <span className="badge" style={{ marginLeft: 6 }}>Saved {madeAt}</span>
            {badge(rec.madeAt)}
        </div>
        );
    };

    if (!race) {
        return (
            <section className="card panel f1-kerb" style={{ marginTop: 0}}>
                <div className="panel-header">
                    <h4 className="panel-title"><span className="badge">Upcoming Race</span></h4>
                </div>
                <div className="helper">{error || "Loading..."}</div>
            </section>
        );
    }

    return (
        <section className="card panel f1-kerb" style={{ marginTop: 0 }}>
            <div className="panel-header">
                <h4 className="panel-title">
                <span className="badge">Upcoming</span> {race.name} — {race.locality}, {race.country}
                </h4>
            </div>

            <div className="controls" style={{ marginBottom: 8 }}>
                <button className="btn primary" onClick={saveUser} disabled={!hasFull(userPicks)} title={!hasFull(userPicks) ? "Pick all 3 places first" : undefined}>Save my prediction</button>
                <button className="btn" onClick={saveModel} disabled={!hasFull(modelPicks)} title={!hasFull(modelPicks) ? "Generate model picks" : undefined}>Save model prediction</button>
            </div>

            {error && <div className="helper" style={{ marginBottom: 6 }}>{error}</div>}

            {renderSavedLine("Your", "user")}
            <div style={{ height: 4 }} />
            {renderSavedLine("Model", "model")}
        </section>
    );
}