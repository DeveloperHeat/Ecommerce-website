# Ecommerce Web Application

A full-stack e-commerce application featuring product browsing, shopping cart functionality, and user authentication.

## Getting Started

This project is fully containerized with Docker, ensuring a consistent environment across development and production.

### Prerequisites
- Docker Desktop installed and running.

### Installation & Running
1. Clone this repository:
   ```bash
   git clone https://github.com/DeveloperHeat/Ecommerce-website.git
   cd Ecommerce-website

3. Build the Docker image:
   ```bash
   docker build -t ecommerce-app .

5. Run the container:
   ```bash
   docker run -p 3000:3000 ecommerce-app

7. Open your browser and visit: http://localhost:3000

## Tech Stack
- Backend: Node.js, Express
- Frontend: EJS (Embedded JavaScript templates)
- Containerization: Docker
- Database/Auth: Firebase

## Setup Tips
* This project keeps sensitive data secure by using a .env file (which is ignored by Git). To run this locally, simply create your own .env file with your specific API keys, and you're good to go!
* **Payment Integration:** Currently running in demo mode. The purchase button is set up to trigger a notification to demonstrate the checkout flow.
