from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime

import relay

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///schedules.db'

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    frequency = db.Column(db.String(50), nullable=True)
    description = db.Column(db.String(255), nullable=True)
    start_time = db.Column(db.Time, nullable=True)
    watering_tasks = db.relationship('WateringTask', backref='schedule', lazy=True, cascade='all,delete')


    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'frequency': self.frequency,
            'description': self.description,
            'start_time': str(self.start_time),
            'watering_tasks': [watering_task.to_dict() for watering_task in self.watering_tasks]
        }


class Sprinkler(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False)
    watering_tasks = db.relationship('WateringTask', backref='sprinkler', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'watering_tasks': [watering_task.to_dict() for watering_task in self.watering_tasks]
        }


class WateringTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    duration = db.Column(db.Integer, nullable=False)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.id'), nullable=False)
    sprinkler_id = db.Column(db.Integer, db.ForeignKey('sprinkler.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'duration': self.duration,
            'schedule_id': self.schedule_id,
            'sprinkler_id': self.sprinkler_id
        }


#===================================================================================================
# Scheudule routes

@app.route('/schedules', methods=['POST'])
def create_schedule():
    data = request.get_json(force=True)
    schedule = Schedule(name=data.get('name'))
    db.session.add(schedule)
    db.session.commit()
    return jsonify(schedule.to_dict()), 201  # return created schedule

# Post sprinkler
@app.route('/sprinklers', methods=['POST'])
def add_sprinkler():
    # create a new sprinkler with a default description
    sprinkler = Sprinkler(description="New Sprinkler")
    db.session.add(sprinkler)
    db.session.commit()

    # return the new sprinkler's id and description
    return jsonify(sprinkler.to_dict()), 201  # return created sprinkler




# GET schedule by id
@app.route('/schedules/<int:schedule_id>', methods=['GET'])
def get_schedule(schedule_id):
    schedule = Schedule.query.get(schedule_id)
    if schedule is None:
        return jsonify({'error': 'Schedule not found'}), 404
    return jsonify(schedule.to_dict())


# GET all schedules
@app.route('/schedules', methods=['GET'])
def get_schedules():
    schedules = Schedule.query.all()
    return jsonify([schedule.to_dict() for schedule in schedules])

# PUT schedule by id
@app.route('/schedules/<int:schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    data = request.get_json(force=True)
    schedule = Schedule.query.get(schedule_id)

    if not schedule:
        return jsonify({'error': 'Schedule not found'}), 404

    # Update the schedule with the new data
    schedule.name = data.get('name', schedule.name)
    schedule.description = data.get('description', schedule.description)
    
    # Convert the start_time string to a datetime.time object
    start_time_str = data.get('start_time', None)
    if start_time_str:
        schedule.start_time = datetime.strptime(start_time_str, "%H:%M:%S").time()
    
    schedule.frequency = data.get('frequency', schedule.frequency)

    watering_tasks_data = data.get('watering_tasks', [])
    if watering_tasks_data:
        for wt_data in watering_tasks_data:
            watering_task = WateringTask.query.get(wt_data['id'])
            if watering_task:
                watering_task.duration = wt_data.get('duration', watering_task.duration)
                watering_task.sprinkler_id = wt_data.get('sprinkler_id', watering_task.sprinkler_id)
            else:
                new_watering_task = WateringTask(duration=wt_data['duration'], sprinkler_id=wt_data['sprinkler_id'], schedule_id=schedule.id)
                db.session.add(new_watering_task)
    db.session.commit()

    return jsonify(schedule.to_dict())


@app.route('/schedules/<int:schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    Schedule.query.filter_by(id=schedule_id).delete()
    db.session.commit()
    return jsonify({'message': f'Schedule {schedule_id} deleted successfully'}), 200

# GET watering tasks by schedule id
@app.route('/schedules/<int:schedule_id>/watering_tasks', methods=['GET'])
def get_watering_tasks(schedule_id):
    watering_tasks = WateringTask.query.filter_by(schedule_id=schedule_id).all()
    return jsonify([watering_task.to_dict() for watering_task in watering_tasks])

# GET all watering tasks
@app.route('/watering_tasks', methods=['GET'])
def get_all_watering_tasks():
    watering_tasks = WateringTask.query.all()
    return jsonify([watering_task.to_dict() for watering_task in watering_tasks])


# GET all sprinklers
@app.route('/sprinklers', methods=['GET'])
def get_sprinklers():
    sprinklers = Sprinkler.query.all()
    return jsonify([sprinkler.to_dict() for sprinkler in sprinklers])

#DELETE sprinkler by id
@app.route('/sprinklers/<int:sprinkler_id>', methods=['DELETE'])
def delete_sprinkler(sprinkler_id):
    Sprinkler.query.filter_by(id=sprinkler_id).delete()
    db.session.commit()
    return jsonify({'message': f'Sprinkler {sprinkler_id} deleted successfully'}), 200


#===================================================================================================



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/schedule')
def schedule():
    return render_template('schedule.html')

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

if __name__ == '__main__':

    # turn off all relays
    relay.turn_off_all_relays()

    #set the state of the relays in the database to off
    for i in range(1, 17):
        relay.control_channel(i, False)

    # run the app    
    app.run(host='0.0.0.0', port=8080)


