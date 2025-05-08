# Stage 1: Build the frontend application
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

# Check for bun.lock and install using bun if it exists, otherwise use npm
RUN if [ -f bun.lock ]; then corepack enable bun && bun install; else npm install; fi

COPY . .

# Build the application (adjust the build command as needed)
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
