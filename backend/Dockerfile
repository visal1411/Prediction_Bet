FROM node:22-bullseye-slim

WORKDIR /app

# Install dependencies required for Prisma and general build
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port and start
EXPOSE 3001
CMD ["npm", "run", "dev"]
