import Podium from "./Podium";

/**
 * ModelCompare
 * User choices
 * modelPicks
 */

export default function ModelCompare({userPicks, modelPicks, onRefreshModel}) {
    return (
        <>
            <div className="compare-grid">
                {/* User Side */}
                <div className="card panel panel--user f1-kerb f1-checker panel--race" style={{ margin: 0 }}>
                    <h4 className="panel-title" style={{marginBottom: 10}}>
                        <span className="badge">Your Podium</span>
                    </h4>
                    <Podium picks={userPicks} model={"userBtn"} />
                </div>

                {/* Model Side */}
                <div className="card panel panel--model f1-kerb f1-checker panel--race" style={{ margin: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <h4 className="panel-title" style={{ margin: 0 }}>
                            <span className="badge"> Model prediction</span>
                        </h4>
                        <button className="btn" onClick={onRefreshModel}>Refresh model</button>
                    </div>
                    <Podium picks={modelPicks} model={"machineBtn"}/>
                </div>
            </div>
        </>
    )
}