# --- Build stage: compile the React app ---
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# Baked into the build so the browser knows where the API lives.
ARG REACT_APP_API_BASE=http://localhost:8001
ENV REACT_APP_API_BASE=$REACT_APP_API_BASE
RUN npm run build

# --- Serve stage: static files via nginx ---
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
