from flask import Blueprint, jsonify, request, render_template
from datetime import datetime
from models import db, Schedule, Sprinkler, WateringTask

schedule_bp = Blueprint('schedule', __name__)

# Error handler
@schedule_bp.app_errorhandler(Exception)
def handle_exception(e):
    print(e)
    return jsonify({'error': str(e), 'type': type(e).__name__}), 500



# Route functions
@schedule_bp.route('/schedule')
def schedule():
    schedules = get_all_schedules()
    watering_tasks = get_all_watering_tasks()
    return render_template('schedule.html', schedules=schedules, watering_tasks=watering_tasks)

@schedule_bp.route('/schedules', methods=['POST'])
def create_schedule():
    data = request.get_json(force=True)
    new_schedule = create_new_schedule(data)
    return jsonify(new_schedule.to_dict()), 201

@schedule_bp.route('/schedules/<int:schedule_id>', methods=['GET'])
def get_schedule(schedule_id):
    schedule = get_schedule_by_id(schedule_id)
    if schedule is None:
        return jsonify({'error': 'Schedule not found'}), 404
    return jsonify(schedule.to_dict())

@schedule_bp.route('/schedules', methods=['GET'])
def get_schedules():
    schedules = get_all_schedules()
    return jsonify([schedule.to_dict() for schedule in schedules])

@schedule_bp.route('/schedules/<int:schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    data = request.get_json(force=True)
    updated_schedule = update_schedule_details(schedule_id, data)
    if not updated_schedule:
        return jsonify({'error': 'Schedule not found or ID conflict'}), 404
    return jsonify(updated_schedule.to_dict())

@schedule_bp.route('/schedules/<int:schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    delete_schedule_by_id(schedule_id)
    return jsonify({'message': f'Schedule {schedule_id} deleted successfully'}), 200



# Business logic functions
def get_all_schedules():
    return Schedule.query.all()

def get_all_watering_tasks():
    return WateringTask.query.all()

def create_new_schedule(data):
    new_schedule = Schedule(name=data['name'])
    db.session.add(new_schedule)
    db.session.commit()
    return new_schedule

def get_schedule_by_id(schedule_id):
    return Schedule.query.get(schedule_id)

def update_schedule_details(schedule_id, data):
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return None

    schedule.name = data.get('name', schedule.name)
    schedule.description = data.get('description', schedule.description)
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
                watering_task.sprinklers.clear()
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
    return schedule

def delete_schedule_by_id(schedule_id):
    Schedule.query.filter_by(id=schedule_id).delete()
    db.session.commit()
