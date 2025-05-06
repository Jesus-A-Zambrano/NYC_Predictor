# NYC_Predictor

## Getting Started

1.  Clone the repository.
2.  Build and run the services using Docker Compose:

    ```bash
    docker-compose up --build
    ```

3.  The backend will be available at `http://localhost:3000`.
4.  The ML microservice will be available at `http://localhost:8000`.
5.  Access the API documentation (Swagger UI) at `http://localhost:3000/api-docs`.

## Development

Each service (`backend` and `ml-model`) has its own dependencies and development setup. Refer to the READMEs within each service directory for specific instructions.


## Model Versioning

The `ml-model/model/` directory contains the serialized model (`model.pkl`) and metadata (`metadata.json`). The `train.py` script can be used to retrain the model, and `retrain.sh` provides an example automation script.

## Environment Variables

Environment variables are managed using `.env.development` and `.env.production` files at the project root. Copy `.env.development` to `.env` for local development if not using docker-compose with explicit env_file.

## API Documentation

The backend provides automatic API documentation using Swagger UI, available at `/api-docs` when the backend service is running.