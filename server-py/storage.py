import json, os, sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "predictions.db"))

def _conn():
    return sqlite3.connect(DB_PATH, check_same_thread=False)

def init_db():
    with _conn() as cx:
        cx.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            race_id TEXT NOT NULL,
            race_name TEXT NOT NULL,
            mode TEXT NOT NULL,         -- "preQuali" | "postQuali" | "auto"
            kind TEXT NOT NULL,         -- "user" | "model"
            picks_json TEXT NOT NULL,   -- JSON object {1:{...},2:{...},3:{...}}
            made_at TEXT NOT NULL       -- ISO timestamp
        )
        """)
        cx.commit()

def save_prediction(race_id: str, race_name: str, mode: str, kind: str, picks: Dict[str, Any], made_at: Optional[str]=None) -> int:
    made_at = made_at or (datetime.utcnow().isoformat() + "Z")
    with _conn() as cx:
        cur = cx.execute(
            "INSERT INTO predictions (race_id, race_name, mode, kind, picks_json, made_at) VALUES (?,?,?,?,?,?)",
            (race_id, race_name, mode, kind, json.dumps(picks), made_at)
        )
        cx.commit()
        return cur.lastrowid

def list_predictions_for_race(race_id: str) -> List[Dict[str, Any]]:
    with _conn() as cx:
        cur = cx.execute(
            "SELECT id, race_id, race_name, mode, kind, picks_json, made_at FROM predictions WHERE race_id=? ORDER BY id DESC",
            (race_id,)
        )
        rows = cur.fetchall()
    out = []
    for r in rows:
        out.append({
            "id": r[0],
            "raceId": r[1],
            "raceName": r[2],
            "mode": r[3],
            "kind": r[4],
            "picks": json.loads(r[5]),
            "madeAt": r[6],
        })
    return out

