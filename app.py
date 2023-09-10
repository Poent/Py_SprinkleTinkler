from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
from sqlalchemy import DateTime


#import relay module
# note that there are two versions of this module
# one for the actual relay board and one for testing.
# The testing version does not require the serial port
# and will not actually turn on the relays.

#import relay
import relay_dummy as relay


from models import db, Schedule, Sprinkler, WateringTask

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///schedules.db'
app.config['SQLALCHEMY_ECHO'] = False

# set up the database
migrate = Migrate(app, db)
db.init_app(app)

# import the blueprints
from routes.sprinkler_routes import sprinkler_bp
from routes.schedule_routes import schedule_bp
from routes.watering_task_routes import watering_task_bp

# register the blueprints
app.register_blueprint(sprinkler_bp) # Register the sprinkler blueprint with the Flask app
app.register_blueprint(schedule_bp) # Register the schedule blueprint with the Flask app
app.register_blueprint(watering_task_bp) # Register the watering task blueprint with the Flask app

# set up the routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/toggle', methods=['POST'])
def toggle_relay():
    print("toggle relay" + str(request.get_json()))
    print("evaluation: " + str(request.get_json()['state'] == 'True'))
    data = request.get_json(force=True)
    id = int(data.get('id'))
    state = data.get('state') == True
    relay.control_channel(id, state)
    return jsonify({'status': 'success'})

# route to get the state of all the relays from the array
@app.route('/get-relay-states', methods=['GET'])
def get_relay_states():
    states = relay.get_status()
    return jsonify({'states': states})

# route to get the state of a single relay from the array
@app.route('/get-relay-state/<int:id>', methods=['GET'])
def get_relay_state(id):
    state = relay.get_channel_status(id)
    return jsonify({'state': state})

@app.route('/get-events', methods=['GET'])
def get_events():
    # Fetch your events from your database or wherever they're stored
    events = [
        {
            'title': 'All Day Event',
            'start': '2023-07-01'
        }
    ]
    return jsonify({'events': events})


# main function to run the app
if __name__ == '__main__':

    # turn off all relays
    relay.turn_off_all_relays()

    #set the state of the relays in the database to off
    for i in range(1, 17):
        relay.control_channel(i, False)

    # run the flask app    
    app.run(host='0.0.0.0', port=8080)

