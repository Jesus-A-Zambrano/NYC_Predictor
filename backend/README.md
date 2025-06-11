# Backend Service

This directory contains the Node.js/Express API used by the project.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.development` from the repository root (or create a `.env` file) and ensure variables like `PORT`, `REDIS_URL` and `ML_SERVICE_URL` are defined.

3. Start the service in development mode with hot reload:
   ```bash
   npm run dev
   ```

4. To build and run the compiled code:
   ```bash
   npm run build
   npm start
   ```

## Docker

This service is included in the project's `docker-compose.yml` but can also be built separately:
```bash
docker build -t nyc-backend .
docker run -p 3000:3000 nyc-backend
```
