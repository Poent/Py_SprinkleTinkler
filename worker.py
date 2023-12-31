# This is a worker process that will run in the background and perform tasks
# such as populating the jobs table in the database. This will also execute
# the jobs when they are due to run.

import time # For sleeping
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
    
# Helper function to calculate the next run date based on the schedule's frequency
def calculate_run_date(schedule, now):
    # Helper function to determine if today is one of the custom days
    def is_today_custom(custom_days_str, day):
        custom_days_list = [day.strip().lower() for day in custom_days_str.split(',')]
        return day.strftime('%A').lower() in custom_days_list

    # Helper function to determine the next custom day
    def next_custom_day(custom_days_str, start):
        custom_days_list = [day.strip().lower() for day in custom_days_str.split(',')]
        day_mapping = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        current_day_index = start.weekday()

        for i in range(1, 8):  # Max 7 days in a week
            next_day_index = (current_day_index + i) % 7
            next_day_name = day_mapping[next_day_index]

            if next_day_name.lower() in custom_days_list:
                return start + timedelta(days=i)
        
        return None  # Ideally, should never reach this

    # Condition 1: Check start time
    if now.time() >= schedule.start_time:
        start_date = now.date() + timedelta(days=1)  # Begin checking from tomorrow
    else:
        start_date = now.date()  # Consider today

    # Condition 2: Determine the next run day based on the "frequency"
    if schedule.frequency == 'even':
        while start_date.day % 2 != 0:  # Even day
            start_date += timedelta(days=1)
        return start_date

    #condition 3: Determine the next run day based on the "frequency" when it's daily
    elif schedule.frequency == 'daily':
        return start_date

    elif schedule.frequency == 'odd':
        while start_date.day % 2 == 0:  # Odd day
            start_date += timedelta(days=1)
        return start_date

    elif schedule.frequency == 'custom':
        if is_today_custom(schedule.custom_days, start_date):
            return start_date
        return next_custom_day(schedule.custom_days, start_date)

    return None  # Default return, should not reach here for valid schedules


def update_jobs(db_manager):
    Sprinklers, watering_tasks, schedules = db_manager.load_all_data()
    now = datetime.today()

    print(f'Today is {now.date()}')
    print(f'Current time is {now.time()}')
    print(f'Populating jobs...')
    print('\n')
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
        run_date = calculate_run_date(schedule, now)
        if run_date is None:
            print(f"No valid run_date for schedule {schedule.id}. Skipping...")
            continue

        print(f'next run_date: {run_date} at {schedule.start_time}')
        
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
                print(f'job {task.id} does not exist. Creating a new job')
                job = Job() # Create a new job
                job.id = task.id # Use the task id as the job id
                job.schedule_id = schedule.id # Set the schedule_id
                job.sprinkler_id = task.sprinkler_id # Set the sprinkler_id
                job.run_datetime = run_datetime # Set the run_date
                job.duration = task.duration # Set the duration of the job
                job.status = 'scheduled' # Set the status of the job (e.g., pending, running, skipped, completed)
                db.session.add(job) # Add the job to the database

            # if the job exists and is scheduled to run in the future, then we need to update the job with the new run_datetime
            # this is a catch all for any other scenarios that may have been missed and simply assumes that the job needs to be updated
            else:
                print(f'job {existing_job.id} exists. Updating the job')
                existing_job.run_datetime = run_datetime
                existing_job.duration = task.duration
                existing_job.sprinkler_id = task.sprinkler_id
                existing_job.schedule_id = schedule.id
                existing_job.status = 'scheduled'

            # Accumulate duration for the next task's start time
            accumulated_duration += timedelta(minutes=task.duration)

    db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db_manager = DatabaseManager()
        
        update_jobs(db_manager)

        while True:
            print('\n')
            print(f'current time: {datetime.now()}')
            print(f'Checking for jobs to run...')
            # Get all jobs that are scheduled to run in the next 5 seconds
            jobs = Job.query.filter(Job.run_datetime <= datetime.now() + timedelta(seconds=5), Job.status == 'scheduled').all()
            print(f'Found {len(jobs)} jobs to run')

            # get all the jobs that are running
            running_jobs = Job.query.filter(Job.status == 'running').all()
            print(f'Found {len(running_jobs)} jobs running')

            # Loop through the jobs and execute them
            for job in jobs:
                # Update the job status to "running"
                job.status = 'running'
                db.session.commit()

                # Execute the job
                sprinkler = Sprinkler.query.get(job.sprinkler_id)
                print(f'Running job {job.id} on sprinkler {sprinkler.name} for {job.duration} minutes...')
                print('\n')

            # check for running jobs that have completed
            for running_job in running_jobs:

                #debug values
                print(f'running_job.run_datetime: {running_job.run_datetime}')
                print(f'running_job.duration: {running_job.duration}')
                print(f'completion time: {running_job.run_datetime + timedelta(minutes=running_job.duration)}')
                print(f'datetime.now(): {datetime.now()}')

                # Update the job status to "completed" once the run time has elapsed. Measured based off the delta between the run_datetime and the current time, and the duration of the job
                if datetime.now() >= running_job.run_datetime + timedelta(minutes=running_job.duration):
                    print(f'Job {running_job.id} has completed')
                    running_job.status = 'completed'
                    db.session.commit()

                    # Log the job
                    job_log = JobLog()
                    job_log.job_id = running_job.id
                    job_log.sprinkler_id = running_job.sprinkler_id
                    job_log.schedule_id = running_job.schedule_id
                    job_log.start_datetime = running_job.run_datetime
                    job_log.end_datetime = datetime.now()
                    job_log.duration = running_job.duration
                    job_log.status = 'completed'
                    db.session.add(job_log)
                    db.session.commit()

                    # remove the job from the database
                    db.session.delete(running_job)
                    db.session.commit()
            

            # Sleep for 5 seconds
            print(f'Sleeping for 5 seconds...')

            time.sleep(5)
            

    
 