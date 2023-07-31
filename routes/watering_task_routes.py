from flask import Blueprint, jsonify, request
from models import db, Schedule, Sprinkler, WateringTask

watering_task_bp = Blueprint('watering_task', __name__)

# Error handler
@watering_task_bp.app_errorhandler(Exception)
def handle_exception(e):
    print(e)
    return jsonify({'error': str(e), 'type': type(e).__name__}), 500

# Route functions
@watering_task_bp.route('/watering_tasks', methods=['GET'])
def get_all_watering_tasks():
    watering_tasks = fetch_all_watering_tasks()
    return jsonify([watering_task.to_dict() for watering_task in watering_tasks])

@watering_task_bp.route('/watering_tasks/<int:schedule_id>', methods=['GET'])
def get_watering_task(schedule_id):
    watering_tasks = fetch_watering_task_by_schedule_id(schedule_id)
    return jsonify([watering_task.to_dict() for watering_task in watering_tasks])

@watering_task_bp.route('/watering_tasks/<int:schedule_id>', methods=['DELETE'])
def delete_watering_tasks(schedule_id):
    task_order = request.args.get('task_order', type=int)
    if task_order is not None:
        deleted_task = delete_specific_watering_task(schedule_id, task_order)
        if deleted_task is None:
            return jsonify({'error': 'Watering task not found'}), 404
        return jsonify({'message': f'Watering Task {schedule_id}-{task_order} deleted successfully'}), 200
    else:
        delete_all_watering_tasks_for_schedule(schedule_id)
        return jsonify({'message': f'All Watering Tasks for schedule_id {schedule_id} deleted successfully'}), 200

@watering_task_bp.route('/watering_tasks/<int:schedule_id>', methods=['POST'])
def save_watering_tasks(schedule_id):
    tasks = request.get_json()
    save_new_watering_tasks(schedule_id, tasks)
    return jsonify({'message': 'Watering tasks saved successfully'}), 200

# Business logic functions
def fetch_all_watering_tasks():
    return WateringTask.query.all()

def fetch_watering_task_by_schedule_id(schedule_id):
    return WateringTask.query.filter_by(schedule_id=schedule_id).all()

def delete_specific_watering_task(schedule_id, task_order):
    watering_task = WateringTask.query.filter_by(schedule_id=schedule_id, task_order=task_order).first()
    if watering_task:
        db.session.delete(watering_task)
        db.session.commit()
        return watering_task
    return None

def delete_all_watering_tasks_for_schedule(schedule_id):
    watering_tasks = WateringTask.query.filter_by(schedule_id=schedule_id).all()
    for watering_task in watering_tasks:
        db.session.delete(watering_task)
    db.session.commit()

def save_new_watering_tasks(schedule_id, tasks):
    for task in tasks:
        new_task = WateringTask(
            duration=task['duration'],
            schedule_id=schedule_id,
            sprinkler_id=task['sprinkler_id'],  # New field
            task_order=task['task_order']
        )
        db.session.add(new_task)
    db.session.commit()
