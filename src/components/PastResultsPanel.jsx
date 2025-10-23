import { useEffect, useMemo, useState } from "react";
import { fetchSeasons, fetchSchedule, fetchRaceResult } from "../api/ergast";
import Podium from "./Podium";

export default function PastResultsPanel() {
    const [seasons, setSeasons] = useState([]);
    const [season, setSeason] = useState("");
    const [schedule, setSchedule] = useState([]);
    const [round, setRound] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const [resultReveal, setResultReveal] = useState(false);

    // Loading the seasons
    useEffect(() => {
        (async () => {
        try {
            const s = await fetchSeasons({ limit: 20 });
            setSeasons(s);
            setSeason(s[0] || "current");
        } catch (e) {
            console.error(e);
            setError("Couldn’t load seasons.");
        }
        })();
    }, []);

    useEffect(() => {
        if (!season) return;
        setSchedule([]);
        setRound("");
        setResult(null);
        setError("");
        (async () => {
            try {
                const races = await fetchSchedule(season);
                setSchedule(races);
                if (races.length) setRound(races[races.length - 1].round); // default to last round
            } catch (e) {
                console.error(e);
                setError("Couldn’t load schedule.");
            }
        })();
    }, [season]);

    useEffect(() => {
        if (!season || !round) return;
        setLoading(true);
        setError("");
        setResultReveal(false);
        (async () => {
            try {
                const data = await fetchRaceResult(season, round);
                setResult(data);
            } catch (e) {
                console.error(e);
                setError("Couldn’t load race result.");
            } finally {
                setLoading(false);
            }
        })();
    }, [season, round]);

    const podiumPicks = useMemo(() => {
        if (!result) return { 1: null, 2: null, 3: null };
        // map positions 1..3 into the Podium shape
        const byPos = {};
        result.podium.forEach(p => { byPos[Number(p.position)] = { name: p.name, code: p.code }; });
        return { 1: byPos[1] || null, 2: byPos[2] || null, 3: byPos[3] || null };
    }, [result]);

    return (
        <section className="card panel f1-kerb">
            <div className="panel-header">
                <h4 className="panel-title">
                    <span className="badge">Previous Race Results</span>
                </h4>
            </div>

            <div className="select-row" style={{ marginBottom: 8}}>
                <div className="select-col">
                    <label className="select-label">Season</label>
                    <select className="select" value={season} onChange={(e) => setSeason(e.target.value)}>
                        {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="select-col" style={{ gridColumn: "span 2" }}>
                    <label className="select-label">Race</label>
                    <select className="select" value={round} onChange={(e) => setRound(e.target.value)}>
                        {schedule.map(r => (
                        <option key={r.round} value={r.round}>
                            R{r.round} — {r.raceName} ({r.locality}, {r.country})
                        </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <div className="helper" style={{ marginBottom: 8 }}>{error}</div>}
            {loading && <div className="helper" style={{ marginBottom: 8 }}>Loading…</div>}

            {result && (
                <>
                    <div className="helper" style={{marginBottom: 8}}>
                        {result.meta.raceName} — {result.meta.circuit} — {result.meta.date}
                    </div>

                    {/* Show Podium for Selected Race */}
                    <Podium picks={podiumPicks} label={"Show Race Results"} reveal={resultReveal} setReveal={setResultReveal}/>

                    {/* The Top 10 List */}
                    {resultReveal &&
                        <div style={{marginTop: 12}}>
                            <div className="helper" style={{ marginBottom: 6 }}>Top 10</div>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {result.top10.map(row => (
                                <li key={row.pos} style={{
                                    display: "grid",
                                    gridTemplateColumns: "40px 1fr 140px 120px 70px",
                                    gap: "8px",
                                    padding: "6px 0",
                                    borderBottom: "1px solid var(--border)"
                                }}>
                                    <span style={{ fontWeight: 700 }}>#{row.pos}</span>
                                    <span>{row.driver}</span>
                                    <span className="subtle" style={{ color: "var(--muted)" }}>{row.team}</span>
                                    <span className="subtle" style={{ color: "var(--muted)" }}>{row.status}</span>
                                    <span className="code" style={{ justifySelf: "end" }}>{row.code}</span>
                                </li>
                                ))}
                            </ul>
                        </div>
                    }
                </>
            )}
        </section>
    )
}