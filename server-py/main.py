import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from typing import Any, Dict, List, Optional

from model.predict import predict_podium
from storage import init_db, save_prediction, list_predictions_for_race
from model.ergast import fetch_upcoming_race

load_dotenv()

app = FastAPI(title="F1 Podium API")
init_db()

## CORS: allows react server to interact with this
origins = [
    os.getenv("CORS_ORIGIN", "http://localhost:5173")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,  # only if cookies/auth is used
)

class PredictBody(BaseModel):
    mode: str = "auto"

class SaveBody(BaseModel):
    kind: str = Field(..., pattern="^(user|model)$")
    picks: Dict[str, Any]  # { "1": {...}, "2": {...}, "3": {...} } or numeric keys

@app.get("/health")
async def health():
    return {"ok": True}

@app.post("/predict")
async def predict(body: PredictBody):
    try:
        return await predict_podium(mode=body.mode)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "prediction_failed", "message": str(e)})

@app.post("/predictions/upcoming/save")
async def save_for_upcoming(body: SaveBody):
    """Save user or model picks for the upcoming race only (prevents mixing with past races)."""
    up = await fetch_upcoming_race()
    if not up:
        raise HTTPException(status_code=400, detail="No upcoming race found")
    # normalize picks keys to strings to be consistent
    picks = {str(k): v for k, v in body.picks.items()}
    rec_id = save_prediction(
        race_id=f"{up['season']}-{up['round']}",
        race_name=up["name"],
        mode="auto",              # you can pass through a client mode if you want
        kind=body.kind,           # "user" | "model"
        picks=picks
    )
    return {"id": rec_id, "saved": True}

@app.get("/predictions/upcoming")
async def list_for_upcoming():
    up = await fetch_upcoming_race()
    if not up:
        raise HTTPException(status_code=400, detail="No upcoming race found")
    race_id = f"{up['season']}-{up['round']}"
    rows = list_predictions_for_race(race_id)
    return {"raceId": race_id, "raceName": up["name"], "items": rows}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=PORT, reload=True)