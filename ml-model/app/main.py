import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
import os
import numpy as np
from .schemas import PredictionRequest, PredictionResponse

# Define the path for the model pipeline using an environment variable
# Fallback to a relative path for local development if the environment variable is not set
MODEL_PATH = os.environ.get('ML_MODEL_PATH', './model/sales_predictor.pkl')

pipeline = None

# Function to load the model pipeline
def load_pipeline():
    global pipeline
    print(f"Attempting to load model from: {MODEL_PATH}")
    try:
        with open(MODEL_PATH, 'rb') as f:
            pipeline = joblib.load(f)
        print("Model pipeline loaded successfully.")
    except FileNotFoundError:
        print(f"Error: Model pipeline file not found at {MODEL_PATH}")
        pipeline = None # Or handle the error as appropriate
    except Exception as e:
        print(f"Error loading model pipeline: {e}")
        pipeline = None

# Load the pipeline when the application starts
# It's better to load the model just before the app starts serving requests
# For FastAPI, this can be done in a startup event, but for simplicity here, loading directly.
# A more robust approach would be to use FastAPI's lifespan events.
load_pipeline()

app = FastAPI()

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    if pipeline is None:
        raise HTTPException(status_code=500, detail="Model pipeline not loaded")

    try:
        # Create a DataFrame from the request data
        # Ensure the order and names of columns match the training data features used in train.py
        input_data = pd.DataFrame({
            'BOROUGH': [request.BOROUGH],
            'BUILDING_CLASS_AT_TIME_OF_SALE': [request.BUILDING_CLASS_AT_TIME_OF_SALE],
            'GROSS_SQUARE_FEET': [np.log1p(request.GROSS_SQUARE_FEET)], # Apply log1p transformation
            'YEAR_BUILT': [request.YEAR_BUILT],
            'season': '1',
            'TAX_CLASS_AT_TIME_OF_SALE': '1',
            'ZIP_CODE': 10001,
            'RESIDENTIAL_UNITS': 1,
            'SALE_MONTH': 1,
        })

        # Make prediction using the pipeline
        log_prediction = pipeline.predict(input_data)

        # Inverse transform the prediction (from log1p back to original scale)
        prediction = np.expm1(log_prediction[0])

        # Return the prediction
        # Ensure prediction is a float and handle potential non-finite values
        return {"prediction": float(prediction) if np.isfinite(prediction) else None}
    except Exception as e:
        print(f"Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))
