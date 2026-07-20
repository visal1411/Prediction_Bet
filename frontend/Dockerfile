FROM node:22-bullseye-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Start Vite with --host flag so it's accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host"]
