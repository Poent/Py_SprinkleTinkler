from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
from sqlalchemy import DateTime

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
    last_run = db.Column(DateTime, nullable=True)  # New field
    next_run = db.Column(DateTime, nullable=True)  # New field
    watering_tasks = db.relationship('WateringTask', backref='schedule', lazy=True, cascade='all,delete')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'frequency': self.frequency,
            'description': self.description,
            'start_time': str(self.start_time),
            'last_run': self.last_run.isoformat() if self.last_run else None,  # Convert to ISO format
            'next_run': self.next_run.isoformat() if self.next_run else None,  # Convert to ISO format
            'watering_tasks': [watering_task.to_dict() for watering_task in self.watering_tasks]
        }



class Sprinkler(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
        }


# WateringTask class
class WateringTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    duration = db.Column(db.Integer, nullable=False)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.id'), nullable=False)
    task_order = db.Column(db.Integer, nullable=False)
    sprinklers = db.relationship('Sprinkler', secondary='watering_task_sprinkler', backref=db.backref('watering_tasks', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'duration': self.duration,
            'schedule_id': self.schedule_id,
            'sprinklers': [sprinkler.to_dict() for sprinkler in self.sprinklers],
            'task_order': self.task_order  
        }
    
# association table
watering_task_sprinkler = db.Table('watering_task_sprinkler',
    db.Column('watering_task_id', db.Integer, db.ForeignKey('watering_task.id'), primary_key=True),
    db.Column('sprinkler_id', db.Integer, db.ForeignKey('sprinkler.id'), primary_key=True)
)


#===================================================================================================
# sprinkler routes
#===================================================================================================


@app.route('/sprinklers', methods=['GET'])
def get_sprinklers():
    try:
        sprinklers = Sprinkler.query.all()
        return jsonify([sprinkler.to_dict() for sprinkler in sprinklers])
    except Exception as e:
        print(e)  # Log the exception to the console for debugging
        return jsonify({'error': 'Internal Server Error'}), 500


#DELETE sprinkler by id
@app.route('/sprinklers/<int:sprinkler_id>', methods=['DELETE'])
def delete_sprinkler(sprinkler_id):
    Sprinkler.query.filter_by(id=sprinkler_id).delete()
    db.session.commit()
    return jsonify({'message': f'Sprinkler {sprinkler_id} deleted successfully'}), 200

@app.route('/sprinklers', methods=['POST'])
def add_sprinkler():
    # create a new sprinkler with a default name
    all_ids = set(x[0] for x in db.session.query(Sprinkler.id).all())
    new_id = next(i for i in range(1, len(all_ids) + 2) if i not in all_ids)
    sprinkler = Sprinkler(id=new_id, name="New Sprinkler")  # Change 'description' to 'name'
    db.session.add(sprinkler)
    db.session.commit()
    return jsonify(sprinkler.to_dict()), 201

@app.route('/sprinklers/<int:sprinkler_id>', methods=['PUT'])
def update_sprinkler(sprinkler_id):
    data = request.get_json(force=True)

    # Get the existing sprinkler
    existing_sprinkler = Sprinkler.query.get(sprinkler_id)

    if not existing_sprinkler:
        return jsonify({'error': 'Sprinkler not found'}), 404  # HTTP status code 404 means "Not Found"

    # Check if a sprinkler with the new ID already exists
    conflict_sprinkler = Sprinkler.query.filter_by(id=data['id']).first()
    if conflict_sprinkler and conflict_sprinkler.id != existing_sprinkler.id:
        return jsonify({'error': 'A sprinkler with this ID already exists'}), 409  # HTTP status code 409 means "Conflict"

    # Update the id and name
    existing_sprinkler.id = data['id']
    existing_sprinkler.name = data['name']

    db.session.commit()

    return jsonify(existing_sprinkler.to_dict())


#===================================================================================================
# Scheudule routes
#===================================================================================================

@app.route('/schedule')
def schedule():
    schedules = Schedule.query.all()
    watering_tasks = WateringTask.query.all()
    return render_template('schedule.html', schedules=schedules, watering_tasks=watering_tasks)

@app.route('/schedules', methods=['POST'])
def create_schedule():
    data = request.get_json(force=True)
    print('/schedules POST called')
    print(data)
    new_schedule = Schedule(name=data['name'])
    db.session.add(new_schedule)
    db.session.commit()
    return jsonify(new_schedule.to_dict()), 201



# GET schedule by id
@app.route('/schedules/<int:schedule_id>', methods=['GET'])
def get_schedule(schedule_id):
    print('/schedules/<int:schedule_id> GET called')
    schedule = Schedule.query.get(schedule_id)
    if schedule is None:
        return jsonify({'error': 'Schedule not found'}), 404
    return jsonify(schedule.to_dict())

# GET all schedules
@app.route('/schedules', methods=['GET'])
def get_schedules():
    schedules = Schedule.query.all()
    print('/schedules GET called')
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
                sprinkler_ids = wt_data.get('sprinkler_ids', [])
                watering_task.sprinklers.clear()  # Clear existing sprinkler associations
                for id in sprinkler_ids:
                    sprinkler = Sprinkler.query.get(id)
                    if sprinkler:
                        watering_task.sprinklers.append(sprinkler)
            else:
                sprinkler_ids = wt_data.get('sprinkler_ids', [])
                new_watering_task = WateringTask(duration=wt_data['duration'], schedule_id=schedule.id)
                for id in sprinkler_ids:
                    sprinkler = Sprinkler.query.get(id)
                    if sprinkler:
                        new_watering_task.sprinklers.append(sprinkler)
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


# ===================================================================================================





# GET all watering tasks
@app.route('/watering_tasks', methods=['GET'])
def get_all_watering_tasks():
    watering_tasks = WateringTask.query.all()
    return jsonify([watering_task.to_dict() for watering_task in watering_tasks])


@app.route('/api/wateringTasks', methods=['POST'])
def create_watering_tasks():
    tasks = request.get_json()
    for task in tasks:
        new_task = WateringTask(
            duration=task['duration'],
            schedule_id=task['schedule_id'],
            task_order=task['task_order']
        )
        for sprinkler in task['sprinklers']:
            new_task.sprinklers.append(Sprinkler.query.get(sprinkler['id']))
        db.session.add(new_task)
    db.session.commit()
    return jsonify({'message': 'Tasks created successfully'}), 201




#===================================================================================================



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


@app.route('/test')
def test():
    return render_template('test.html')

if __name__ == '__main__':

    # turn off all relays
    relay.turn_off_all_relays()

    #set the state of the relays in the database to off
    for i in range(1, 17):
        relay.control_channel(i, False)

    # run the app    
    app.run(host='0.0.0.0', port=8080)


