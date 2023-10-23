from flask import Flask
from models import db, Job, JobLog, WateringTask, Sprinkler, Schedule
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///schedules.db'
db.init_app(app)

# We'll omit the Sprinkler, WateringTask, and Schedule classes here as they're already defined in `models`

class DatabaseManager:
    def __init__(self):
        pass

    def load_sprinklers(self):
        return Sprinkler.query.all()

    def load_watering_tasks(self):
        return WateringTask.query.all()

    def load_schedules(self):
        return Schedule.query.all()
    
    def load_all_data(self):
        Sprinklers = self.load_sprinklers()
        watering_tasks = self.load_watering_tasks()
        schedules = self.load_schedules()
        return Sprinklers, watering_tasks, schedules

    def load_jobs(self):
        return Job.query.all()
    

def calculate_run_date(schedule, today):
    # Implement logic to determine next run date based on schedule configuration
    # calculate the next even day:
    if schedule.frequency == 'even':
        next_day = today + timedelta(days=1)
        while next_day.day % 2 != 0:
            next_day += timedelta(days=1)
        return next_day
    # calculate the next odd day:
    elif schedule.frequency == 'odd':
        next_day = today + timedelta(days=1)
        while next_day.day % 2 == 0:
            next_day += timedelta(days=1)
        return next_day
    
    # TODO: Make this work...
    # calculate the next day of the week if custom days are selected. Load the days from the schedule.custom_days field
    elif schedule.frequency == 'custom':
        # Get the days from the schedule.custom_days field
        custom_days = schedule.custom_days
        return today
        # placeholder... will fix later
        print(f'custom_days: {custom_days}')



    return None  # Default

def populate_jobs(db_manager):
    Sprinklers, watering_tasks, schedules = db_manager.load_all_data()
    today = datetime.today().date()

    for schedule in schedules:

        print(f'processing schedule: {schedule.id}' + f' {schedule.name}')

        # setup an array to hold the tasks for this schedule
        tasks_for_schedule = []

        # get the tasks for this schedule
        for task in watering_tasks:
            if task.schedule_id == schedule.id:
                tasks_for_schedule.append(task)
                
        tasks_for_schedule.sort(key=lambda x: x.task_order)

    
        # Calculate the run date. This will be based off the schedule's frequency and today's date
        # it will return the next date that the schedule should run
        run_date = calculate_run_date(schedule, today)
        print(f'next run_date: {run_date}')
        
        # If the schedule has already run today, then we need to increment the start time
        # by the duration of the tasks that have already run today.
        accumulated_duration = timedelta()  # For subsequent tasks' start times

        # Loop through the tasks for this schedule
        for task in tasks_for_schedule:
            # Check if the job already exists in the database
            existing_job = db.session.get(Job, task.id)

            # Calculate combined run datetime
            run_datetime = datetime.combine(run_date, schedule.start_time) + accumulated_duration


            # If the job doesn't exist, create a new one
            if not existing_job:  
                job = Job() # Create a new job
                job.id = task.id # Use the task id as the job id
                job.schedule_id = schedule.id # Set the schedule_id
                job.sprinkler_id = task.sprinkler_id # Set the sprinkler_id
                job.run_datetime = run_datetime # Set the run_date
                job.duration = task.duration # Set the duration of the job
                job.status = 'scheduled' # Set the status of the job (e.g., pending, running, skipped, completed)
                db.session.add(job) # Add the job to the database
            else:
                # You can update fields if needed. Decide based on your requirements.
                # For now, we only update the run_date and start_time
                existing_job.run_date = run_datetime
            
            # Accumulate duration for the next task's start time
            accumulated_duration += timedelta(minutes=task.duration)

    db.session.commit()


with app.app_context():
    db_manager = DatabaseManager()
    
    populate_jobs(db_manager)
 