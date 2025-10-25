import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from model.predict import predict_podium

load_dotenv()

app = FastAPI(title="Example API")

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

@app.get("/health")
async def health():
    return {"ok": True}

@app.post("/predict")
async def predict(body: PredictBody):
    try:
        return await predict_podium(mode=body.mode)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "prediction_failed", "message": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=PORT, reload=True)