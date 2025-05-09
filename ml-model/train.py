import os
import json
import pandas as pd
import numpy as np
import joblib
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# --- Paths ---
DATA_PATH = "./data/training_NYC.csv"
MODEL_DIR = "model"
MODEL_PATH = os.path.join(MODEL_DIR, "sales_predictor.pkl")
METADATA_PATH = os.path.join(MODEL_DIR, "metadata.json")

os.makedirs(MODEL_DIR, exist_ok=True)

# --- Load Data ---
print("📥 Cargando datos...")
df = pd.read_csv(DATA_PATH)
print("✅ Datos cargados. Dimensiones:", df.shape)

# --- Feature Engineering ---
print("🛠️ Procesando columnas de fecha...")
df['SALE_DATE'] = pd.to_datetime(df['SALE_DATE'], errors='coerce')
df['SALE_MONTH'] = df['SALE_DATE'].dt.month

# --- Cleaning ---
print("🧹 Limpiando datos...")
df_model = df[df['SALE_PRICE'].notna() & (df['SALE_PRICE'] > 0)].copy()

# --- Outliers ---
print("📊 Eliminando outliers...")
q_low = df_model['GROSS_SQUARE_FEET'].quantile(0.01)
q_high = df_model['GROSS_SQUARE_FEET'].quantile(0.99)
df_model = df_model[(df_model['GROSS_SQUARE_FEET'] >= q_low) & (df_model['GROSS_SQUARE_FEET'] <= q_high)]

q_low_price = df_model['SALE_PRICE'].quantile(0.01)
q_high_price = df_model['SALE_PRICE'].quantile(0.99)
df_model = df_model[(df_model['SALE_PRICE'] >= q_low_price) & (df_model['SALE_PRICE'] <= q_high_price)]

# --- Transformations ---
print("🔄 Aplicando transformaciones logarítmicas...")
df_model['SALE_PRICE'] = np.log1p(df_model['SALE_PRICE'])
df_model['GROSS_SQUARE_FEET'] = np.log1p(df_model['GROSS_SQUARE_FEET'])

# --- Features ---
features = [
    'BOROUGH', 'BUILDING_CLASS_AT_TIME_OF_SALE', 'GROSS_SQUARE_FEET', 'YEAR_BUILT',
    'season', 'TAX_CLASS_AT_TIME_OF_SALE', 'ZIP_CODE', 'RESIDENTIAL_UNITS', 'SALE_MONTH'
]
target = 'SALE_PRICE'
X = df_model[features]
y = df_model[target]

categorical = [
    'BUILDING_CLASS_AT_TIME_OF_SALE', 'season', 'TAX_CLASS_AT_TIME_OF_SALE',
    'ZIP_CODE', 'YEAR_BUILT', 'SALE_MONTH', 'RESIDENTIAL_UNITS'
]
numerical = ['BOROUGH', 'GROSS_SQUARE_FEET']

# --- Pipeline ---
print("🔧 Construyendo pipeline de entrenamiento...")
preprocessor = ColumnTransformer([
    ('cat', OneHotEncoder(handle_unknown='ignore'), categorical),
    ('num', StandardScaler(), numerical)
])
pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42, verbose=1, n_jobs=-1))])

# --- Train ---
print("🚀 Entrenando modelo... esto puede tardar un poco.")
pipeline.fit(X, y)
print("✅ Entrenamiento completado.")

# --- Save model ---
print("💾 Guardando modelo...")
joblib.dump(pipeline, MODEL_PATH)
print(f"✅ Modelo guardado en {MODEL_PATH}")

# --- Save Metadata ---
print("📝 Guardando metadatos...")
metadata = {
    "version": "1.0",
    "trained_date": datetime.now().isoformat(),
    "model_name": "RandomForestRegressor_NYC_Sales_Backend",
    "features": features,
    "target": target,
    "transformations": {
        "SALE_PRICE": "log1p",
        "GROSS_SQUARE_FEET": "log1p"
    },
    "preprocessing": {
        "categorical": categorical,
        "numerical": numerical
    }
}

with open(METADATA_PATH, 'w') as f:
    json.dump(metadata, f, indent=4)

print(f"✅ Metadatos guardados en {METADATA_PATH}")
print("🏁 Script finalizado.")
