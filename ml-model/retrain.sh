#!/bin/bash

# Script to retrain the ML model

echo "Retraining the ML model..."

# Navigate to the ml-model directory
# cd ml-model # This assumes the script is run from the project root. Adjust if needed.

# Run the training script
python train.py

echo "Model retraining complete."
