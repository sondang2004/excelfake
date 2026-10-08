# Multi-stage Dockerfile for Boss Key Sheet (Frontend + Backend)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd backend && npm ci
RUN cd frontend && npm ci

# Copy application source
COPY backend ./backend
COPY frontend ./frontend

# Build React production bundle
RUN cd frontend && npm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules and built static assets
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

CMD ["node", "backend/index.js"]
