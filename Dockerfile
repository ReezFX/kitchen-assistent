# Dockerfile for Kitchen Assistant Application
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies for PortAudio
RUN apt-get update && \
    apt-get install -y libportaudio2 portaudio19-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=backend/app.py
ENV PYTHONUNBUFFERED=1

# Command to run the application
ENTRYPOINT ["python", "backend/app.py"]

