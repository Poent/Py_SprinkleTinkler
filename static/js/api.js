// trying to consolidate all the api calls into one file
// these are used in multiple places so it makes sense to have them in one place

// TODO: convert all the ajax calls to use fetch instead

// get all the schedules from the database
function fetchSchedules() {
    return $.ajax({
        url: '/schedules',
        type: 'GET'
    });
}

// function to fetch the schedule by id
function fetchScheduleById(scheduleId) {
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

async function saveWateringTasks(tasks, scheduleId) {
    try {
        console.log("Saving tasks: " + JSON.stringify(tasks));
        console.log("scheduleId: " + scheduleId);

        const response = await fetch("/watering_tasks/" + scheduleId, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tasks)
        });
        
        const data = await response.json();
        console.log(data);
        alert('Tasks saved successfully!');
    } catch (error) {
        console.error('Error saving watering tasks:', error);
        alert('Failed to save tasks. Please try again.');
    }
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


// function to toggle the state of a sprinkler. Called when a sprinkler button is clicked
async function toggleSprinklerState(sprinklerId, newState) {
    try {
        const response = await fetch('/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: sprinklerId, state: newState ? 'on' : 'off' }),
        });
        
        const data = await response.json();
        if (data.status !== 'success') {
            throw new Error('Failed to toggle sprinkler state');
        }
    } catch (error) {
        console.error('Error toggling sprinkler state:', error);
    }
}



// Function to load all sprinklers from the database
async function fetchSprinklers() {
    try {
        const response = await fetch('/api/sprinklers', { method: 'GET' });
        return await response.json();
    } catch (error) {
        console.error('Error loading sprinklers:', error);
    }
}

// Function to fetch a sprinkler by ID
async function fetchSprinklerById(sprinklerId) {
    try {
        const response = await fetch('/api/sprinklers/' + sprinklerId, { method: 'GET' });
        return await response.json();
    } catch (error) {
        console.error('Error loading sprinkler:', error);
    }
}


// function to fetch the state of all sprinklers
async function fetchSprinklerStates() {
    try {
        const response = await fetch('/get-relay-states');
        const data = await response.json();
        return data.states;
    } catch (error) {
        console.error('Error getting relay states:', error);
        return null;
    }
}

// function to fetch the state of a sprinkler by id
async function fetchSprinklerState(id) {
    try {
        const response = await fetch(`/get-relay-state/${id}`);
        const data = await response.json();
        return data.state;
    } catch (error) {
        console.error(`Error getting relay state for ID ${id}:`, error);
        return null;
    }
}



// Function to add a new sprinkler
async function addSprinklerApi(newSprinkler) {
    try {
        const response = await fetch('/api/sprinklers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSprinkler)
        });
        return await response.json();
    } catch (error) {
        console.error('Error adding sprinkler:', error);
    }
}


// Function to delete a sprinkler by ID
async function deleteSprinklerApi(sprinklerId) {
    try {
        const response = await fetch('/api/sprinklers/' + sprinklerId, { method: 'DELETE' });
        return await response.ok;
    } catch (error) {
        console.error('Error deleting sprinkler:', error);
    }
}

// Function to toggle the state of a sprinkler
async function toggleSprinklerStateApi(sprinklerId, newState) {
    try {
        const response = await fetch('/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: sprinklerId, state: newState })
        });
        return await response.json();
    } catch (error) {
        console.error('Error toggling sprinkler state:', error);
    }
}

// Function to edit a sprinkler's details
async function editSprinkler(sprinklerId, newDetails) {
    try {
        const response = await fetch('/api/sprinklers/' + sprinklerId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newDetails)
        });
        return await response.json();
    } catch (error) {
        console.error('Error editing sprinkler:', error);
    }
}

// Function to fetch calendar events
async function fetchCalendarEvents() {
    try {
        const response = await fetch('/get-events', { method: 'GET' });
        return await response.json();
    } catch (error) {
        console.error('Error fetching calendar events:', error);
    }
}
