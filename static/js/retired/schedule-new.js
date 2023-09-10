// When the page loads, get the schedules from the database and populate the table
$(document).ready(function() {
    loadSchedules();
    loadSprinklers();
});

function goBack() {
    // back to the previous page
    window.history.back();
}

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

// function to create a row for the schedules table using DOM manipulation
// used by the populateSchedulesTable function
function createScheduleRow(schedule) {

    // Row
    const row = document.createElement('tr');
    row.setAttribute('data-id', schedule.id);

    console.log("loading schedule id: " + schedule.id);

    const idCell = document.createElement('td');
    idCell.textContent = schedule.id;

    // Cells
    const nameCell = document.createElement('td');
    nameCell.textContent = schedule.name;

    // Create task list button
    const editBtn = document.createElement('button');
    editBtn.classList.add('btn', 'btn-sm', 'btn-info', 'task-list-btn');
    editBtn.setAttribute('data-id', schedule.id);
    editBtn.textContent = 'Edit';
    editBtn.onclick = function() {
        editSchedule();
    };


    //debug button info to console
    console.log("editBtn: " + editBtn);
    console.log("editBtn data-id: " + editBtn.getAttribute('data-id'));

    // Create the frequency cell
    const frequencyCell = document.createElement('td');
    frequencyCell.textContent = schedule.frequency;
    
    // Create the start time cell
    const startTimeCell = document.createElement('td');
    startTimeCell.textContent = schedule.start_time;
    
    const nextTimeCell = document.createElement('td');
    nextTimeCell.textContent = schedule.next_run;

    // Create delete schedule button
    const actionCell = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'btn-sm', 'btn-danger', 'btn-delete-schedule');
    deleteBtn.setAttribute('data-id', schedule.id);
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = function() {
        deleteScheduleAjax(schedule.id);
    };

    actionCell.appendChild(editBtn);
    actionCell.appendChild(deleteBtn);

    // Append cells to row
    row.appendChild(idCell);
    row.appendChild(nameCell);
    row.appendChild(frequencyCell);
    row.appendChild(startTimeCell);
    row.appendChild(nextTimeCell);
    row.appendChild(actionCell);

    return row;

}

function populateSchedulesTable(schedules) {
    // Clear table
    $("#schedules-table tbody").empty();

    schedules.forEach(schedule => {
        const row = createScheduleRow(schedule);
        $('#schedules-table tbody').append(row);
    });
}

// function to get the schedules from the database and populate the table
function loadSchedules() {

    console.log("Getting schedules");

    // Fetch schedules from the database
    fetchSchedules()
    .then(schedules => {
        // Debug to see what is being returned
        console.log('Schedule data received from FETCH:', schedules);

        populateSchedulesTable(schedules);
    });
}

function editSchedule() {
    // Get the schedule-id from event.target
    let scheduleId = event.target.getAttribute("data-id");

    console.log("Editing scheduleId: " + scheduleId);

    // Update the header of the modal with the scheduleId
    document.querySelector('.schedule-modal-header').innerText = "Edit Schedule " + scheduleId;

    // if scheduleId is 0, then this is a new schedule and we need to clear the form
    if (scheduleId == 0) {
        // Clear the form
        document.getElementById("name").value = "";
        document.getElementById("frequency").value = "daily";
        document.getElementById("startTime").value = "00:00";
        document.getElementById("customDays").style.display = 'none';
        document.getElementById("wateringTasksList").innerHTML = '';
        document.getElementById("edit-schedule-btn").setAttribute("data-schedule-id", 0);
        
    } 
    else {
        
        // if the scheduleId is not 0, then we need to get the schedule from the database and populate the form
        fetchScheduleById(scheduleId)
        .then(schedule => {
            populateModalForm(schedule);
        });
    }
    
    // Set the schedule-id on the save button
    document.getElementById("save-schedule-button").setAttribute("data-id", scheduleId);
    loadTasks(scheduleId);

    // Display the modal
    $('#editScheduleModal').modal('show');
}

// function to populate the modal form with the schedule data
function populateModalForm(data) {

    // Debug to see what is being returned
    console.log('Schedule data received from FETCH:', data);

    // Update the input fields with existing data
    document.getElementById("name").value = data.name || '';
    document.getElementById("frequency").value = data.frequency || 'daily';
    document.getElementById("startTime").value = data.start_time || '00:00';

    // Show or hide the customDays section based on the frequency
    if (data.frequency === 'custom') {
        document.getElementById("customDays").style.display = 'block';
    } else {
        document.getElementById("customDays").style.display = 'none';
    }

    // Reset all checkboxes to unchecked before setting them based on the database values
    let days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    days.forEach(day => {
        document.getElementById(day).checked = false;
    });

    // Check the appropriate checkboxes for customDays based on the database
    if (data.custom_days) {
        let customDaysArray = data.custom_days.split(",");
        customDaysArray.forEach(day => {
            document.getElementById(day).checked = true;
        });
    }
}

function saveSchedule() {
    // Get the schedule-id from the button using event.target
    let scheduleId = event.target.getAttribute("data-id");

    // Get the input fields from the form
    let name = document.getElementById("name");

    // Debug to see what is being sent
    console.log("Saving scheduleId: " + scheduleId);
    console.log("name: " + name.value);
    console.log("frequency: " + frequency.value);
    console.log("startTime: " + startTime.value);
    console.log("scheduleId: " + scheduleId);

    // Get the custom days selected when frequency is 'custom'
    let customDays = "";
    if (frequency.value === 'custom') {
        let days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        days.forEach(day => {
            let checkbox = document.getElementById(day);
            if (checkbox.checked) {
                customDays += day + ",";
            }
        });
        if (customDays) {
            customDays = customDays.slice(0, -1);  // Remove trailing comma
        }
    }
    console.log("customDays: " + customDays);

    //get the task list fro the wateringTasksList sortable list (in the modal)
    let tasks = [];
    let taskList = document.getElementById("wateringTasksList");
    let taskItems = taskList.getElementsByClassName("sortable-item");
    for (let i = 0; i < taskItems.length; ++i) {
        let taskItem = taskItems[i];
        let sprinklerId = taskItem.getAttribute("data-id");
        let duration = taskItem.getElementsByClassName("time-input")[0].value;
        let task_order = i + 1;

        tasks.push({sprinkler_id: sprinklerId, duration: duration, schedule_id: scheduleId, task_order: task_order});
    }


    // Create request data to save the schedule
    let requestData = {
        name: name.value,
        frequency: frequency.value,
        start_time: startTime.value,
        custom_days: customDays // Include custom days string here

        // you can add other parameters here if needed
    };

    // Convert to JSON
    let jsonData = JSON.stringify(requestData);

    // if scheduleId is 0, then this is a new schedule and we need to POST to the database
    if (scheduleId == 0) {
        // Make POST request
        fetch('/schedules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData
        })
        .then(response => response.json())
        .then(data => {
            // Handle successful response here
            console.log('Created schedule:', data);

            // Save the watering tasks
            saveWateringTasks(tasks, data.id);

            loadSchedules();
        })
        .catch(error => {
            // Handle error here
            console.error('Error creating schedule:', error);
        });
    } 
    else {
        // Make PUT request
        fetch('/schedules/' + scheduleId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData
        })
        .then(response => response.json())
        .then(data => {
            // Handle successful response here
            console.log('Updated schedule:', data);
            loadSchedules();
        })
        .catch(error => {
            // Handle error here
            console.error('Error updating schedule:', error);
        });

        // Delete any existing tasks for this schedule using ajax and call the saveWateringTasks function to save the new tasks
        $.ajax({
            url: "/watering_tasks/" + scheduleId,
            method: "DELETE",
            success: function(response) {
                console.log(response);
                saveWateringTasks(tasks, scheduleId);
            },
            error: function(xhr, status, error) {
                console.error(error);
                alert('Failed to save tasks. Please try again.');
            }
        });

    }

    $('#editScheduleModal').modal('hide');
}


document.getElementById("frequency").addEventListener('change', function () {
    if (this.value === 'custom') {
        document.getElementById("customDays").style.display = 'block';
    } else {
        document.getElementById("customDays").style.display = 'none';
    }
});

// function to create a sortable.js list and load the sprinklers from the database
function loadSprinklers() {

    // clear the list
    document.getElementById('sprinklerList').innerHTML = '';

    // Fetch sprinklers from the database
    fetch('/sprinklers')
    .then(response => response.json())
    .then(data => {
        // Debug to see what is being returned
        console.log('Sprinkler data received from FETCH:', data);

        // Create a list item for each sprinkler
        data.forEach(sprinkler => {
            let sprinklerItem = document.createElement('li');
            sprinklerItem.className = 'list-group-item';
            sprinklerItem.classList.add('sortable-item');
            sprinklerItem.innerText = sprinkler.name;
            sprinklerItem.setAttribute('data-id', sprinkler.id);
            document.getElementById('sprinklerList').appendChild(sprinklerItem);
        });

        // Create a sortable list
        Sortable.create(sprinklerList, {
            animation: 150,
            group: {
                name: 'sprinklerList',
                pull: 'clone',
                put: false,
                revertClone: true
            }
        });
    })
    .catch(error => {
        // Handle error here
        console.error('Error fetching sprinklers:', error);
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

// Function to clear the existing list of tasks in the DOM
function clearTaskList() {
    document.getElementById('wateringTasksList').innerHTML = '';
}

// Function to create a list item for a task
function createTaskListItem(task, sprinklerName) {
    const li = document.createElement('li');
    const content = document.createElement('div');
    const timeInput = document.createElement('input');
    const label = document.createElement('span');
    const helpText = document.createElement('small');
    const timeContainer = document.createElement('div');
    const removeBtn = document.createElement('button');
    
    li.classList.add('sortable-item', 'time-label');
    content.classList.add('task-content', 'm-2');
    timeInput.classList.add('time-input', 'm-2');
    label.classList.add('time-label');
    helpText.classList.add('form-text', 'text-muted');

    content.textContent = `${sprinklerName}`;
    timeInput.type = 'number';
    timeInput.min = 1;
    timeInput.max = 60;
    timeInput.value = task.duration;
    label.textContent = 'Runtime: ';
    helpText.textContent = 'Enter time in minutes';
    removeBtn.textContent = 'Remove';
    removeBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'remove-btn', 'm-2', 'p-1');

    removeBtn.addEventListener('click', () => {
        li.remove();
    });

    li.appendChild(content);
    timeContainer.appendChild(label);
    timeContainer.appendChild(timeInput);
    timeContainer.appendChild(helpText);
    li.appendChild(timeContainer);
    li.appendChild(removeBtn);
    li.dataset.id = task.sprinkler_id;

    return li;
}

function getSprinklerName(sprinklerId) {
    return document.querySelector(`#sprinklerList li[data-id="${sprinklerId}"]`).textContent;
}

function initializeSortableList() {
    Sortable.create(wateringTasksList, {
        group: {
            name: 'wateringTasksList',
            pull: 'clone',
            put: true
        },
        sort: false,
        animation: 150,
        onAdd: function (evt) {
            let itemEl = evt.item;

            let itemContent = document.createElement('div');
            itemContent.innerHTML = itemEl.innerHTML;
            itemEl.innerHTML = '';
            itemEl.appendChild(itemContent);

            let timeContainer = document.createElement('div');
            timeContainer.classList.add('m-2');

            let timeLabel = document.createElement('span');
            timeLabel.innerHTML = 'Runtime: ';
            timeLabel.classList.add('time-label');
            timeContainer.appendChild(timeLabel);

            let timeInput = document.createElement('input');
            timeInput.type = "number";
            timeInput.min = "1";
            timeInput.value = "5";
            timeInput.max = "60";
            timeInput.placeholder = "Enter time in mins";
            timeInput.classList.add('time-input');
            timeContainer.appendChild(timeInput);

            let helpText = document.createElement('small');
            helpText.innerHTML = "Enter time in minutes";
            helpText.classList.add('form-text', 'text-muted');
            timeContainer.appendChild(helpText);

            let removeBtn = document.createElement('button');
            removeBtn.innerHTML = 'X';
            removeBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'remove-btn', 'm-2', 'p-1');
            removeBtn.addEventListener('click', function(e) {
                itemEl.remove();
            });

            itemEl.appendChild(timeContainer);
            itemEl.appendChild(removeBtn);
        }
    });
}

async function loadTasks(scheduleId) {
    clearTaskList();

    try {
        const taskData = await fetchTaskData(scheduleId);

        taskData.forEach(task => {
            const sprinklerName = getSprinklerName(task.sprinkler_id);
            const taskListItem = createTaskListItem(task, sprinklerName);
            document.getElementById('wateringTasksList').appendChild(taskListItem);
        });

        initializeSortableList();
    } catch (error) {
        console.error('Error in loadTasks:', error);
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

