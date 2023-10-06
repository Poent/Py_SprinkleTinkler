# Use an official Python runtime as the base image
FROM python:latest

# Set the working directory in the docker image
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install necessary packages and libraries
RUN pip install --no-cache-dir flask flask_sqlalchemy flask_migrate

# Set the environment variable for Flask to run in production
ENV FLASK_ENV=production

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define the command to run your app using CMD which keeps the container running
CMD ["python", "./app.py"]
