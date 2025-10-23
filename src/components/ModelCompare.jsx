import { useState } from "react";
import { scoreSimilarity } from "../utils/scoring";
import Podium from "./Podium";

/**
 * ModelCompare
 * User choices
 * modelPicks
 */

export default function ModelCompare({userPicks, modelPicks, onRefreshModel}) {
    const [userReveal, setUserReveal] = useState(false);
    const [modelReveal, setModelReveal] = useState(false);

    const sim = scoreSimilarity(userPicks, modelPicks);

    return (
        <>
            <div className="compare-grid">
                {/* User Side */}
                <div className="card panel panel--user f1-kerb f1-checker panel--race" style={{ margin: 0 }}>
                    <h4 className="panel-title" style={{marginBottom: 10}}>
                        <span className="badge">Your Podium</span>
                    </h4>
                    <Podium picks={userPicks} label={"Show My Podium"} reveal={userReveal} setReveal={setUserReveal}/>
                </div>

                {/* Model Side */}
                <div className="card panel panel--model f1-kerb f1-checker panel--race" style={{ margin: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <h4 className="panel-title" style={{ margin: 0 }}>
                            <span className="badge"> Model prediction</span>
                        </h4>
                        <button className="btn" onClick={onRefreshModel}>Refresh model</button>
                    </div>
                    <Podium picks={modelPicks} label={"Show Model Podium"} reveal={modelReveal} setReveal={setModelReveal}/>
                </div>

                {/** 
                 * Score Summary (user picks compared with model picks) 
                 * Will later be replaced with user picks vs results and model picks vs results
                 * Score only shows if both user and model podium have been revealed
                 */}
                {userReveal && modelReveal && (
                    <div className="card" style={{ gridColumn: "1 / -1" }}>
                        <div className="panel-header">
                            <h4 className="panel-title"><span className="badge">Match summary</span></h4>
                        </div>
                        <div className="helper">
                            Exact matches: <strong>{sim.exact}</strong> &middot; Anywhere matches: <strong>{sim.any}</strong> &middot; Total: <strong>{sim.total}</strong>
                        </div>
                        <div className="helper" style={{ marginTop: 6 }}>
                            (Rule: exact = 3 pts, right driver wrong spot = 1 pt)
                        </div>
                    </div>
                )}
                {(!userReveal || !modelReveal) && (
                    <div className="card" style={{ gridColumn: "1 / -1" }}>
                        <div className="panel-header">
                            <h4 className="panel-title"><span className="badge">Match summary</span></h4>
                        </div>
                        <div className="helper">
                            Reveal your podium and model podium to get score.
                        </div>
                        <div className="helper" style={{ marginTop: 6 }}>
                            (Rule: exact = 3 pts, right driver wrong spot = 1 pt)
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}