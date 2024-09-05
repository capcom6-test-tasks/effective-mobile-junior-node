# Use the official Node.js image from the Docker Hub
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Set the environment
ENV NODE_ENV=production

# Command to run the app
CMD ["node", "src/index.js"]
