from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import DateTime
from datetime import datetime

db = SQLAlchemy()


class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    frequency = db.Column(db.String(50), nullable=True)
    description = db.Column(db.String(255), nullable=True)
    start_time = db.Column(db.Time, nullable=True)
    last_run = db.Column(DateTime, nullable=True)  # New field
    next_run = db.Column(DateTime, nullable=True)  # New field
    custom_days = db.Column(db.String(13), nullable=True) # Example value: 'MTWTFSS', 'M-W-F--'
    watering_tasks = db.relationship('WateringTask', backref='schedule', lazy=True, cascade='all,delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'frequency': self.frequency,
            'description': self.description,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'last_run': self.last_run.isoformat() if self.last_run else None,  # Convert to ISO format
            'next_run': self.next_run.isoformat() if self.next_run else None,  # Convert to ISO format
            'custom_days': self.custom_days,
            'watering_tasks': [watering_task.to_dict() for watering_task in self.watering_tasks]
        }


class Sprinkler(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    watering_tasks = db.relationship('WateringTask', backref='sprinkler', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'watering_tasks': [watering_task.to_dict() for watering_task in self.watering_tasks]
        }

class WateringTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    duration = db.Column(db.Integer, nullable=False)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.id', ondelete='CASCADE'), nullable=False)
    sprinkler_id = db.Column(db.Integer, db.ForeignKey('sprinkler.id'), nullable=False)  # New field
    task_order = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'duration': self.duration,
            'schedule_id': self.schedule_id,
            'sprinkler_id': self.sprinkler_id,  # New field
            'task_order': self.task_order  
        }
    

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.id'), nullable=False)  # Reference to the Schedule model
    run_datetime = db.Column(DateTime, default=datetime.utcnow)  # When the job is set to run
    duration = db.Column(db.Integer, nullable=False)  # Duration for which each sprinkler will run (in seconds/minutes)
    sprinkler_id = db.Column(db.Integer, db.ForeignKey('sprinkler.id'), nullable=False)  # Reference to the Sprinkler model
    status = db.Column(db.String(50), nullable=True)  # Status of the job (e.g., pending, running, skipped, completed)

    def to_dict(self):
        return {
            'id': self.id,
            'schedule_id': self.schedule_id,
            'run_datetime': self.run_date.isoformat(),
            'duration': self.run_time,
            'sprinkler_id': self.sprinkler_id,
            'status': self.status
        }

class JobLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.id'), nullable=False)
    run_datetime = db.Column(DateTime, default=datetime.utcnow)
    duration = db.Column(db.Integer, nullable=False)
    completed_time = db.Column(DateTime, nullable=True)  # Time the job actually completed
    sprinkler_id = db.Column(db.Integer, db.ForeignKey('sprinkler.id'), nullable=False)
    status = db.Column(db.String(50), nullable=True)  # Status (e.g., completed, interrupted, error)
    error_message = db.Column(db.String(255), nullable=True)  # Any error messages or notes related to execution

    def to_dict(self):
        return {
            'id': self.id,
            'schedule_id': self.schedule_id,
            'run_datetime': self.run_date.isoformat(),
            'duration': self.run_time,
            'completed_time': self.completed_time.isoformat() if self.completed_time else None,
            'sprinkler_id': self.sprinkler_id,
            'status': self.status,
            'error_message': self.error_message
        }
