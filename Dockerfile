FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=""

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]