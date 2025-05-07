# NYC Property Price Predictor

This project is an Express project developed over 5 days. It consists of a backend service (Node.js/Express) and an ML model service (Python/FastAPI) that predicts NYC property prices. The project uses Docker Compose for easy setup and deployment.


## Prerequisites

Before you begin, ensure you have the following installed:

*   **Docker:** [Get Docker](https://docs.docker.com/get-docker/)
*   **Docker Compose:** Docker Desktop includes Compose V2. If you have an older version of Docker, you might need to [install Docker Compose](https://docker.github.io/compose/install/)

## Getting Started

Follow these steps to get the project up and running using Docker Compose:

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```
    (Note: Replace `<repository_url>` and `<repository_name>` with your actual repository details.)

2.  **Create environment file:**
    Create a file named `.env.development` in the root directory. You can start with the following content:

    ```env
    PORT=3000
    REDIS_URL=redis://redis:6379
    ML_SERVICE_URL=http://ml-model:8000
    # Add any other necessary environment variables here
    ```

3.  **Build and run the services:**
    Navigate to the `temp-repo` directory in your terminal and run the following command:

    ```bash
    docker compose up -d --build
    ```
    This command will:
    *   Build the Docker images for the backend and ml-model services based on their respective Dockerfiles.
    *   Create and start the containers for the backend, ml-model, and redis services.
    *   The `-d` flag runs the containers in detached mode (in the background).
    *   The `--build` flag forces a rebuild of the images.

4.  **Verify the services are running:**
    You can check the status of the running containers with:

    ```bash
    docker compose ps
    ```
    You should see the `backend`, `ml-model`, and `redis` services listed with a state of `running`.

## Backend Service

The backend service is a Node.js/Express application that serves as the API gateway. It handles incoming requests from the frontend, communicates with the ML model service to get predictions, and uses Redis for caching.

*   **Port:** The backend service runs on port `3000` (as defined in `.env.development` and exposed in `docker-compose.yml`).
*   **API Documentation (Swagger):** Once the backend service is running, you can access the interactive API documentation (Swagger UI) at `http://localhost:3000/api-docs`. This provides detailed information about the available endpoints, their parameters, and response formats.
*   **Error Handling:** The API includes middleware to handle validation errors (400 Bad Request) and internal server errors (500 Internal Server Error).

## ML Model Service

The ML model service is a Python/FastAPI application that hosts the trained machine learning model and provides a prediction endpoint.

> [!IMPORTANT]
> The trained machine learning model file (`sales_predictor.pkl`) is **not** included in the repository You must train the model first for the ML service to function correctly.

*   **Port:** The ML model service runs on port `8000`.
*   **Prediction Endpoint:** The backend service communicates with this service internally at `/predict` to obtain predictions. Frontend applications typically interact only with the backend service.
*   **Model:** The trained model file (`sales_predictor.pkl`) is expected to be in the `/app/model/` directory within the container, as configured in the Dockerfile and `docker-compose.yml`.

## Data Science / ML Development

This section is particularly relevant for data scientists working on the ML model.

*   **`notebooks/`:** This directory contains Jupyter notebooks used for data cleaning, exploration, and model training (`cleaning_nyc_sales.ipynb`, `predictive_model_nyc_sales.ipynb`).
*   **`data/`:** This directory should contain the data files used by the ML model. Currently, it includes `resultado_NYC.csv`. Ensure this file is present before training.
*   **`model/`:** This directory stores the trained machine learning model file (`sales_predictor.pkl`). This file will be generated after running the training script.
*   **`requirements.txt`:** Lists the Python dependencies required for the ML model service and notebooks.
*   **`train.py`:** A Python script for training the model.
*   **`retrain.sh`:** A shell script that can be used to automate the retraining process (you might need to adjust this script based on your specific retraining workflow).

### Training the ML Model

To train the ML model and generate the `sales_predictor.pkl` file, follow these steps:

1.  Ensure you have Python installed and a virtual environment set up (optional but recommended).
2.  Navigate to the `ml-model/` directory in your terminal.
3.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the training script:
    ```bash
    python train.py
    ```
    This script will train the model and save the `sales_predictor.pkl` file in the `ml-model/model/` directory.

5.  After training, rebuild the `ml-model` Docker image to include the newly generated model file:
    ```bash
    cd .. # Navigate back to the temp-repo directory
    docker compose up -d --build ml-model
    ```
    Or rebuild all services:
    ```bash
    docker compose up -d --build
    ```

To work on the ML model further (e.g., running notebooks):

1.  Ensure you have Python and Jupyter installed in your development environment.
2.  Install the required Python packages: `pip install -r ml-model/requirements.txt`
3.  You can run the Jupyter notebooks locally to understand the data processing and model training steps.

## Environment Variables

The `.env.development` file in the root directory is used to configure environment variables for the services in development.

*   `PORT`: The port on which the backend service listens.
*   `REDIS_URL`: The URL for the Redis cache service.
*   `ML_SERVICE_URL`: The URL for the ML model service (used by the backend to communicate with the ML model).

Make sure to update this file with the correct values if your environment requires different configurations.

## Stopping the Services

To stop the running Docker containers, navigate to the root directory in your terminal and run:

```bash
docker compose down
```
This command will stop and remove the containers, networks, and volumes created by `docker compose up`.
