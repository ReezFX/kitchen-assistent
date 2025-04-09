#!/bin/bash

# Build and start the Docker Compose development environment
echo "Starting Kitchen Assistant development environment..."
docker-compose down
docker-compose up --build -d

# Show logs
echo "Services are starting up. Use Ctrl+C to stop viewing logs, but services will continue running."
echo "To shut down all services, run: docker-compose down"
docker-compose logs -f 