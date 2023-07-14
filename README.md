# Sprinkler Scheduler API

The Sprinkler Scheduler API is a Flask-based RESTful API for managing irrigation schedules for an automated sprinkler system. It provides endpoints for managing schedules, watering tasks, and sprinklers. In addition, it provides functionality for controlling a relay (that presumably controls an actual watering system) and a basic interface for visualizing schedules.

## Features

- CRUD operations for schedules, watering tasks, and sprinklers
- Direct relay control through a POST endpoint
- Access to event data for visualization

## Requirements

- Python 3.8 or later
- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- SQLite

## Installation

1. Clone the repository:
    ```
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```
    cd <project-directory>
    ```
3. Install the requirements:
    ```
    pip install -r requirements.txt
    ```
4. Initialize and upgrade the database:
    ```
    flask db init
    flask db upgrade
    ```
5. Run the application:
    ```
    python app.py
    ```

## API Endpoints

- `POST /schedules`: Create a new schedule
- `GET /schedules/<schedule_id>`: Retrieve a specific schedule by ID
- `GET /schedules`: Retrieve all schedules
- `PUT /schedules/<schedule_id>`: Update a specific schedule by ID
- `DELETE /schedules/<schedule_id>`: Delete a specific schedule by ID
- `GET /schedules/<schedule_id>/watering_tasks`: Retrieve all watering tasks for a specific schedule
- `GET /watering_tasks`: Retrieve all watering tasks
- `GET /sprinklers`: Retrieve all sprinklers
- `POST /toggle`: Control the relay
- `GET /get-events`: Get all events for visualization

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

*Note: The `relay.control_channel` function is not implemented in this code snippet. You must implement it yourself, according to the specific hardware you're using.*

*Also, the templates 'index.html' and 'schedule.html' are not provided. You need to implement them according to your needs.*
