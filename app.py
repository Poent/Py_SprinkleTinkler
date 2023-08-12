from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
from sqlalchemy import DateTime

import relay
from models import db, Schedule, Sprinkler, WateringTask

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///schedules.db'

migrate = Migrate(app, db)
db.init_app(app)

from routes.sprinkler_routes import sprinkler_bp
from routes.schedule_routes import schedule_bp
from routes.watering_task_routes import watering_task_bp

app.register_blueprint(sprinkler_bp) # Register the sprinkler blueprint with the Flask app
app.register_blueprint(schedule_bp) # Register the schedule blueprint with the Flask app
app.register_blueprint(watering_task_bp) # Register the watering task blueprint with the Flask app


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/toggle', methods=['POST'])
def toggle_relay():
    data = request.get_json(force=True)
    id = int(data.get('id'))
    state = data.get('state') == 'on'
    relay.control_channel(id, state)
    return jsonify({'status': 'success'})

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


# test route
@app.route('/test')
def test():
    return render_template('test.html')

# test route 2
@app.route('/test2')
def test2():
    return render_template('test2.html')

if __name__ == '__main__':

    # turn off all relays
    relay.turn_off_all_relays()

    #set the state of the relays in the database to off
    for i in range(1, 17):
        relay.control_channel(i, False)

    # run the app    
    app.run(host='0.0.0.0', port=8080)

