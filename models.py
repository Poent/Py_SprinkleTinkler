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
