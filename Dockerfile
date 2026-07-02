# Use a lightweight Node.js base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files first to leverage Docker's build cache
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app uses (e.g., 3000)
EXPOSE 3000

# Command to start your app
CMD ["npm", "start"]