# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd backend && npm install --omit=dev
RUN cd frontend && npm install --omit=dev

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Copy built frontend to backend public directory
RUN cp -r frontend/dist/* backend/public/

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
