# ML Model Service

This directory contains the FastAPI application that serves the trained model used for predictions.

## Training the Model

1. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the training script:
   ```bash
   python train.py
   ```
   This generates `model/sales_predictor.pkl`. Ensure the `ML_MODEL_PATH` variable in `.env.development` points to this file.

## Running Locally

Start the API with:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Docker

This service is also configured for Docker. Build and run it manually with:
```bash
docker build -t nyc-ml-model .
docker run -p 8000:8000 nyc-ml-model
```

Or run all services together using `docker compose` from the repository root.
