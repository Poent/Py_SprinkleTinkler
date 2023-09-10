// When the page loads, get the schedules from the database and populate the table
$(document).ready(function() {
    loadSchedules();
    loadSprinklers();
});



// ========================================================
// Schedules
// ========================================================


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


function populateSchedulesTable(schedules) {
    // Clear table
    $("#schedules-table tbody").empty();

    schedules.forEach(schedule => {
        const row = createScheduleRow(schedule);
        $('#schedules-table tbody').append(row);
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


// editschedule function to get the schedule from the database and populate the modal form
// called when the edit button is clicked on the schedules table
// load the tasks for the schedule and then shows the modal
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
// uses DOM manipulation to set the values of the input fields
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


// function to save the schedule to the database
// called when the save button is clicked on the modal
async function saveSchedule() {
    let scheduleId = event.target.getAttribute("data-id");

    // Get form data and tasks
    let requestData = getScheduleFormData();
    let tasks = getWateringTasks(scheduleId);

    try {
        if (scheduleId == 0) {
            let data = await createSchedule(requestData);
            console.log('Created schedule:', data);
            await saveWateringTasks(tasks, data.id);
        } else {
            let data = await updateSchedule(scheduleId, requestData);
            console.log('Updated schedule:', data);
            await deleteWateringTasks(scheduleId);
            await saveWateringTasks(tasks, scheduleId);
        }
        loadSchedules();
        $('#editScheduleModal').modal('hide');
    } catch (error) {
        console.error('Error saving schedule:', error);
    }
}

// function to monitor the frequency dropdown and show or hide the customDays section
document.getElementById("frequency").addEventListener('change', function () {
    if (this.value === 'custom') {
        document.getElementById("customDays").style.display = 'block';
    } else {
        document.getElementById("customDays").style.display = 'none';
    }
});