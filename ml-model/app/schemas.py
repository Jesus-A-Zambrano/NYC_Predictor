from pydantic import BaseModel
from typing import List

class PredictionRequest(BaseModel):
    BOROUGH: int
    BUILDING_CLASS_AT_TIME_OF_SALE: str
    GROSS_SQUARE_FEET: float
    YEAR_BUILT: int

class PredictionResponse(BaseModel):
    prediction: float
