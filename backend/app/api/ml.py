from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from typing import Any, List
import logging
import io
import pandas as pd

from app.services.ml_service import (
    predict_fault_from_wav,
    predict_faults_from_csv
)

from app.models.schemas import PredictionResponse, PredictionHistory
from app.models.database import SessionLocal, VibrationInput, VibrationResult

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/history/recent", response_model=List[PredictionHistory])
def get_recent_predictions():
    session = SessionLocal()
    try:
        results = (
            session.query(VibrationInput, VibrationResult)
            .join(VibrationResult, VibrationResult.input_id == VibrationInput.id)
            .order_by(VibrationResult.predicted_time.desc())
            .limit(10)
            .all()
        )
        return [
            PredictionHistory(
                id=r[1].id,
                predicted_fault=r[1].predicted_fault,
                predicted_time=r[1].predicted_time,
                features={
                    "mean": r[0].mean,
                    "stddev": r[0].stddev,
                    "rms": r[0].rms,
                    "max": r[0].max,
                    "min": r[0].min,
                    "ptp": r[0].ptp,
                    "skewness": r[0].skewness,
                    "kurtosis": r[0].kurtosis,
                    "crest_factor": r[0].crest_factor,
                    "freq_mean": r[0].freq_mean,
                    "freq_stddev": r[0].freq_stddev,
                    "freq_centroid": r[0].freq_centroid,
                    "freq_bandwidth": r[0].freq_bandwidth,
                }
            )
            for r in results
        ]
    finally:
        session.close()


@router.post("/predict-fault", response_model=PredictionResponse)
async def predict_fault(file: UploadFile = File(...)) -> Any:
    try:
        result = await predict_fault_from_wav(file)
        return result
    except ValueError as ve:
        logger.error(f"Prediction ValueError: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/predict-csv")
async def predict_faults_from_csv_endpoint(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        result_df = predict_faults_from_csv(df)

        output = io.StringIO()
        result_df.to_csv(output, index=False)
        output.seek(0)

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=result.csv"},
        )
    except Exception as e:
        logger.error(f"CSV Prediction Error: {e}")
        raise HTTPException(status_code=500, detail="CSV 예측 처리 실패")
