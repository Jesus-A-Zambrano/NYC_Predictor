# Frontend Application

This directory contains the React/Vite client for the NYC Property Price Predictor.

## Local Development

1. Install dependencies with [Bun](https://bun.sh/) (or `npm install`):
   ```bash
   bun install
   ```
2. Start the development server:
   ```bash
   bun run dev
   ```
   The app will be available at `http://localhost:5173` and proxies `/api` requests to the backend running on `http://localhost:3000`.

## Production Build

Generate an optimized build with:
```bash
bun run build
```
The build output is placed in the `dist/` directory. The provided `Dockerfile` serves this build using Nginx on port `80`.

## Tests

Execute unit tests with:
```bash
bun run test
```
