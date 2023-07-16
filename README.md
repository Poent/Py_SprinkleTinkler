# Python Sprinkler Controller
# The Sprinkler Tinkler

This repo contains a python app that interreacts with the relay.py script to control a USB serial bank of relays. The python app(.py) presents API endpoints to control the database status and relay states, and uses flask to host a website with controls. 

The overall application will eventually provide common sprinkler controls and schedules - with the idea that this is a far more affordable system than over the shelf models.


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
