FROM node:22-bullseye-slim

# Install git in case any npm dependencies require it
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8545

# Start the hardhat node on 0.0.0.0 to allow external connections
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
