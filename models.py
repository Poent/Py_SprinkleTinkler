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
    watering_tasks = db.relationship('WateringTask', backref='schedule', lazy=True, cascade='all,delete-orphan')

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
