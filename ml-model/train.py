import pandas as pd
import numpy as np
import joblib
import json
import os
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error

# Define paths
DATA_PATH = "./data/resultado_NYC.csv"
MODEL_DIR = "model"
MODEL_PATH = os.path.join(MODEL_DIR, "sales_predictor.pkl")
METADATA_PATH = os.path.join(MODEL_DIR, "metadata.json")

# Ensure model directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

print("Loading data...")
try:
    df = pd.read_csv(DATA_PATH)
except FileNotFoundError:
    print(f"Error: Data file not found at {DATA_PATH}")
    # Exit or raise an error if data is mandatory
    exit()

print("Data loaded successfully. Shape:", df.shape)

# --- Data Cleaning and Preparation ---
df_model = df[df['SALE_PRICE'].notna() & (df['SALE_PRICE'] > 0)].copy() # Use .copy() to avoid SettingWithCopyWarning

# --- Outliers ---
q_low = df_model['GROSS_SQUARE_FEET'].quantile(0.01)
q_high = df_model['GROSS_SQUARE_FEET'].quantile(0.99)
df_model = df_model[(df_model['GROSS_SQUARE_FEET'] >= q_low) & (df_model['GROSS_SQUARE_FEET'] <= q_high)].copy()

q_low_price = df_model['SALE_PRICE'].quantile(0.01)
q_high_price = df_model['SALE_PRICE'].quantile(0.99)
df_model = df_model[(df_model['SALE_PRICE'] >= q_low_price) & (df_model['SALE_PRICE'] <= q_high_price)].copy()

# --- Transformation ---
df_model['SALE_PRICE'] = np.log1p(df_model['SALE_PRICE'])
df_model['GROSS_SQUARE_FEET'] = np.log1p(df_model['GROSS_SQUARE_FEET'])

# --- Features and Target ---
features = ['BOROUGH', 'BUILDING_CLASS_AT_TIME_OF_SALE', 'GROSS_SQUARE_FEET', 'YEAR_BUILT']
target = 'SALE_PRICE'
X = df_model[features]
y = df_model[target]

# --- Feature Types ---
categorical_features = ['BUILDING_CLASS_AT_TIME_OF_SALE']
numerical_features = ['BOROUGH', 'GROSS_SQUARE_FEET', 'YEAR_BUILT']

# --- Preprocessing Pipeline ---
# Create the column transformer. handle_unknown='ignore' is important for prediction on unseen categories.
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
        ('num', StandardScaler(), numerical_features)
    ],
    remainder='passthrough' # Keep other columns if any
)

# --- Model Training Pipeline ---
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

print("Starting model training...")
# Train the pipeline on the full data (or X, y if you prefer training on the whole dataset for the final model)
pipeline.fit(X, y) # Training on the full data for the final model

print("Model training complete.")

# --- Evaluation (Optional - usually done on a test set or with cross-validation) ---
# For a production script, you might want to save evaluation metrics.
# y_pred = pipeline.predict(X_test)
# rmse = np.sqrt(mean_squared_error(y_test, y_pred))
# print(f"RMSE on test set: ${rmse:,.2f}")

# --- Save the trained model pipeline ---
joblib.dump(pipeline, MODEL_PATH)
print(f"Model pipeline saved to {MODEL_PATH}")

# --- Create and Save Metadata ---
metadata = {
    "version": "2.0", # Updated version
    "trained_date": datetime.now().isoformat(),
    "model_name": "RandomForestRegressor_NYC_Sales",
    "features": features,
    "target": target,
    "preprocessing": {
        "categorical": categorical_features,
        "numerical": numerical_features
    },
    # Add evaluation metrics here if calculated
    # "metrics": {
    #     "rmse": rmse
    # }
}

with open(METADATA_PATH, 'w') as f:
    json.dump(metadata, f, indent=4)

print(f"Metadata saved to {METADATA_PATH}")

print("Training script finished.")
