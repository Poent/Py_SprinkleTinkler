# Py_SprinkleTinkler

Py_SprinkleTinkler is a work-in-progress sprinkler controller application. It is designed to control a large number of sprinkler channels, providing an affordable alternative to commercial controllers. 

This project is primarily a learning experience and a fun endeavor, and it's worth noting that there are other, more advanced open-source sprinkler controller systems available.

## Project Structure

The project consists of several Python and HTML files:

- `relay.py`: This file contains the `Relay` class, which is used to control the GPIO pins on the Raspberry Pi. Each instance of the class represents a single relay, which can be turned on or off.

- `app.py`: This is the main application file. It sets up the Flask web server and defines the routes for the application.

- `templates/index.html`: This is the main page of the web application. It provides a user interface for controlling the sprinklers and viewing the schedule.

- `templates/schedule.html`: This page provides a user interface for creating and managing watering schedules.

## Usage

To use this application, you will need to have Python and Flask installed. You can then run the application by executing the `app.py` script.

Please note that this application is designed to eventually be used with a Raspberry Pi and a relay module. Currently, it uses a SainSmart 16-channel USB Relay bank and is controlled via USB serial commands. If you use this code before I have updated it for the Raspberry Pi, you will need to update the "relay.py" functions yourself to handle the appropriate relay controls. 

## Contributing

As this is a work-in-progress project, contributions are welcome. Feel free to fork the repository and submit pull requests.

## Disclaimer

This project is intended for educational purposes and personal use. The author is not responsible for any damage caused by the misuse of the software.

## License

This project is open source under the MIT license.
