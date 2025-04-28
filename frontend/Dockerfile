FROM node:18-alpine

WORKDIR /app

# Install dependencies only when needed
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

# Build app
RUN npm run build

# Expose port
EXPOSE 3001

# Start app in development mode
CMD ["npm", "run", "dev"] 