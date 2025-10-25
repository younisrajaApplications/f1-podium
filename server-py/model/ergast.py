import os
from typing import Any, Dict, List, Optional
import httpx

BASE = os.getenv("JOLPICA_BASE", "https://api.jolpi.ca/ergast/f1")

async def get_json(path: str) -> Dict[str, Any]:
    url = f"{BASE}{path}"
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get(url, headers={"Accept": "application/json"})
        r.raise_for_status()
        return r.json()

async def fetch_upcoming_race() -> Optional[Dict[str, Any]]:
    d = await get_json("/current/next.json")
    r = (d.get("MRData", {}).get("RaceTable", {}).get("Races") or [None])[0]
    if not r:
        return None
    return {
        "season": int(r.get("season")),
        "round": int(r.get("round")),
        "raceId": f'{r.get("season")}-{r.get("round")}',
        "name": r.get("raceName"),
        "circuitId": r.get("Circuit", {}).get("circuitId"),
        "locality": r.get("Circuit", {}).get("Location", {}).get("locality", ""),
        "country":  r.get("Circuit", {}).get("Location", {}).get("country", ""),
    }

async def fetch_circuit_history(circuit_id: str, limit: int = 100) -> List[Dict[str, Any]]:
    d = await get_json(f"/circuits/{circuit_id}/results.json?limit={limit}")
    races = d.get("MRData", {}).get("RaceTable", {}).get("Races", []) or []
    rows: List[Dict[str, Any]] = []
    for race in races:
        season = int(race.get("season"))
        round_ = int(race.get("round"))
        for res in race.get("Results", []) or []:
            rows.append({
                "season": season,
                "round": round_,
                "driverId": res.get("Driver", {}).get("driverId"),
                "driverCode": res.get("Driver", {}).get("code", "") or "",
                "driverName": f'{res.get("Driver", {}).get("givenName","")} {res.get("Driver", {}).get("familyName","")}'.strip(),
                "constructorId": res.get("Constructor", {}).get("constructorId"),
                "grid": int(res.get("grid") or 0),
                "pos": int(res.get("position") or 99),
                "status": res.get("Time", {}).get("time") or res.get("status"),
            })
    return rows

async def fetch_driver_standings() -> List[Dict[str, Any]]:
    d = await get_json("/current/driverStandings.json")
    arr = d.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", []) or []
    standings = (arr[0].get("DriverStandings") if arr else []) or []
    out = []
    for s in standings:
        drv = s.get("Driver", {})
        cons = (s.get("Constructors") or [None])[0] or {}
        out.append({
            "driverId": drv.get("driverId"),
            "code": drv.get("code") or "",
            "name": f'{drv.get("givenName","")} {drv.get("familyName","")}'.strip() if hasattr(str, 'trim') else f'{drv.get("givenName","")} {drv.get("familyName","")}'.strip(),
            "points": float(s.get("points") or 0),
            "wins": int(s.get("wins") or 0),
            "constructorId": cons.get("constructorId"),
        })
    return out

async def fetch_constructor_standings() -> List[Dict[str, Any]]:
    d = await get_json("/current/constructorStandings.json")
    arr = d.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", []) or []
    standings = (arr[0].get("ConstructorStandings") if arr else []) or []
    out = []
    for s in standings:
        cons = s.get("Constructor", {})
        out.append({
            "constructorId": cons.get("constructorId"),
            "name": cons.get("name") or "",
            "points": float(s.get("points") or 0),
            "wins": int(s.get("wins") or 0),
        })
    return out

async def fetch_qualifying(season: int, round_: int) -> List[Dict[str, Any]]:
    d = await get_json(f"/{season}/{round_}/qualifying.json")
    race = (d.get("MRData", {}).get("RaceTable", {}).get("Races") or [None])[0] or {}
    q = race.get("QualifyingResults") or []
    out = []
    for i, r in enumerate(q):
        drv = r.get("Driver", {})
        out.append({
            "driverId": drv.get("driverId"),
            "code": drv.get("code") or "",
            "name": f'{drv.get("givenName","")} {drv.get("familyName","")}'.strip(),
            "grid": i + 1,
        })
    return out

async def fetch_driver_recent(season: int, driver_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    d = await get_json(f"/{season}/drivers/{driver_id}/results.json?limit={limit}")
    races = d.get("MRData", {}).get("RaceTable", {}).get("Races", []) or []
    out = []
    for r in races:
        res = (r.get("Results") or [None])[0] or {}
        out.append({
            "round": int(r.get("round")),
            "pos": int(res.get("position") or 99),
            "grid": int(res.get("grid") or 0),
            "status": res.get("status") or "",
            "constructorId": res.get("Constructor", {}).get("constructorId"),
        })
    return out