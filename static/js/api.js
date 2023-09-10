function fetchSchedules() {
    // Fetch schedules from the database
    return $.ajax({
        url: '/schedules',
        type: 'GET'
    });
}

// function to fetch the schedule by id
function fetchScheduleById(scheduleId) {
    // Fetch schedule from the database
    return $.ajax({
        url: '/schedules/' + scheduleId,
        type: 'GET'
    });
}


// function to create a new schedule
async function createSchedule(requestData) {
    try {
        const response = await fetch('/schedules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating schedule:', error);
    }
}

// function to update the schedule by id
async function updateSchedule(scheduleId, requestData) {
    try {
        const response = await fetch('/schedules/' + scheduleId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating schedule:', error);
    }
}


// function to delete the schedule by id using ajax and reload the schedules table
function deleteScheduleAjax(scheduleId) {

    // Make DELETE request
    $.ajax({
        url: "/schedules/" + scheduleId,
        method: "DELETE",
        success: function(response) {
            console.log(response);
            loadSchedules();
        },
        error: function(xhr, status, error) {
            console.error(error);
            alert('Failed to delete schedule. Please try again.');
        }
    });
}


// Function to fetch task data from the server
async function fetchTaskData(scheduleId) {
    try {
        const response = await fetch('/watering_tasks/' + scheduleId);
        return await response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Save watering tasks to the database for the specified scheduleId
function saveWateringTasks(tasks, scheduleId) {

    //debug
    console.log("Saving tasks: " + JSON.stringify(tasks));
    console.log("scheduleId: " + scheduleId);

    $.ajax({
        url: "/watering_tasks/" + scheduleId,
        method: "POST",
        data: JSON.stringify(tasks),
        contentType: "application/json",
        success: function(response) {
            console.log(response);
            alert('Tasks saved successfully!');
        },
        error: function(xhr, status, error) {
            console.error(error);
            alert('Failed to save tasks. Please try again.');
        }
    });
}



// function to delete the watering tasks by scheduleId
async function deleteWateringTasks(scheduleId) {
    try {
        const response = await fetch("/watering_tasks/" + scheduleId, {
            method: "DELETE"
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting watering tasks:', error);
    }
}


// function to fetch the sprinklers from the database
async function fetchSprinklers() {
    try {
        const response = await fetch('/sprinklers');
        return await response.json();
    } catch (error) {
        console.error('Error fetching sprinklers:', error);
    }
}







