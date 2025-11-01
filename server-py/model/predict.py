from __future__ import annotations
from typing import Any, Dict, List
import math
from datetime import datetime

from .ergast import (
    fetch_upcoming_race,
    fetch_circuit_history,
    fetch_driver_standings,
    fetch_constructor_standings,
    fetch_qualifying,
    fetch_driver_recent,
)

OVERTAKE = {
    "monaco": 0.95, "hungaroring": 0.75, "imola": 0.70, "monza": 0.25,
    "spa": 0.35, "bahrain": 0.40, "jeddah": 0.30, "singapore": 0.80, "marina_bay": 0.80,
}
W = {"trackHistory": 0.20, "driverForm": 0.50, "constructor": 0.10, "qualiImpact": 0.20}

## Turning the position into a score - higher score is better
def pos_score(p: int) -> float:
    if p is None or p <= 0 or p >= 40:
        return 0.0
    return (40.0 - float(p)) / 40.0

## Find out how much impact the start position has
def grid_factor(grid: int | None, overtake: float = 0.5) -> float:
    if not grid or grid <= 0:
        return 0.5
    base = 1.0 - min(grid, 20) / 22.0
    return base * (1.0 - 0.5 * overtake)

## Look at the driver's recent form, giving more weight to most recent
def recent_form(results: List[Dict[str, Any]], N: int = 2) -> float:
    take = results[-N:]
    num = 0.0
    den = 0.0
    w = 1.0
    for r in reversed(take):
        num += pos_score(r.get("pos")) * w
        den += w
        w *= 0.75
    return (num / den) if den else 0.5

## The drivers perfomance on the track
def track_history_score(history_rows: List[Dict[str, Any]], driver_id: str, K: int = 5) -> float:
    rows = [r for r in history_rows if r.get("driverId") == driver_id][-K:]
    if not rows:
        return 0.5
    return sum(pos_score(r.get("pos")) for r in rows) / float(len(rows))

## How the team is performing this season
def constructor_form_score(standings: List[Dict[str, Any]], constructor_id: str | None) -> float:
    total = sum(s.get("points") or 0 for s in standings) or 1.0
    me = next((s for s in standings if s.get("constructorId") == constructor_id), None)
    share = (me.get("points") or 0) / total if me else 0.0
    return math.sqrt(share)

async def predict_podium(mode: str = "auto") -> Dict[str, Any]:
    upcoming = await fetch_upcoming_race()
    if not upcoming:
        raise RuntimeError("No upcoming race found")
    season = int(upcoming["season"])
    round_ = int(upcoming["round"])
    circuit_id = upcoming["circuitId"]
    race_name = upcoming["name"]

    quali_list: List[Dict[str, Any]] = []
    try:
        quali_list = await fetch_qualifying(season, round_)
    except Exception:
        pass
    has_quali = bool(quali_list)
    use_mode = ("postQuali" if has_quali else "preQuali") if mode == "auto" else mode

    history = await fetch_circuit_history(circuit_id, 100)
    d_stand = await fetch_driver_standings()
    c_stand = await fetch_constructor_standings()

    drivers = [{
        "driverId": d["driverId"],
        "code": d.get("code") or "",
        "name": d.get("name") or "",
        "constructorId": d.get("constructorId")
    } for d in d_stand]

    recent_map: Dict[str, float] = {}
    for d in drivers:
        try:
            rec = await fetch_driver_recent(season, d["driverId"], limit=10)
            recent_map[d["driverId"]] = recent_form(rec, 5)
        except Exception:
            recent_map[d["driverId"]] = 0.5
        
    over = OVERTAKE.get(circuit_id, 0.5)

    grid_map: Dict[str, int] = {}
    if use_mode == "postQuali" and quali_list:
        for i, q in enumerate(quali_list):
            grid_map[q["driverId"]] = q.get("grid") or (i + 1)
    else:
        ## order the drivers list by using "points" as the key to determine order
        ordered = sorted(d_stand, key=lambda x: x.get("points", 0), reverse = True)
        for idx, d in enumerate(ordered):
            grid_map[d["driverId"]] = idx + 1
    
    per_driver: List[Dict[str, Any]] = []
    for d in drivers:
        th = track_history_score(history, d["driverId"], 5)
        df = recent_map.get(d["driverId"], 0.5)
        cf = constructor_form_score(c_stand, d.get("constructorId"))
        gf = grid_factor(grid_map.get(d["driverId"]), over)
        score = W["trackHistory"]*th + W["driverForm"]*df + W["constructor"]*cf + W["qualiImpact"]*gf
        per_driver.append({
            "driverId": d["driverId"],
            "code": d["code"],
            "name": d["name"],
            "score": score,
            "components": {"th": th, "df": df, "cf": cf, "gf": gf},
        })

    ## Sort the scored driver list using the key "score" as the determining factor and get the top 3
    per_driver.sort(key=lambda x: x["score"], reverse=True)
    top3 = per_driver[:3]

    podium = {
        1: {"code": top3[0]["code"] if len(top3)>0 else "", "name": top3[0]["name"] if len(top3)>0 else ""},
        2: {"code": top3[1]["code"] if len(top3)>1 else "", "name": top3[1]["name"] if len(top3)>1 else ""},
        3: {"code": top3[2]["code"] if len(top3)>2 else "", "name": top3[2]["name"] if len(top3)>2 else ""},
    }

    return {
        "podium": podium,
        "perDriver": per_driver,
        "meta": {
            "race": race_name,
            "circuitId": circuit_id,
            "mode": use_mode,
            "overtakeIndex": over,
            "weights": W,
        },
        "modelVersion": "v1-heuristic",
        "madeAt": datetime.utcnow().isoformat() + "Z",
    }