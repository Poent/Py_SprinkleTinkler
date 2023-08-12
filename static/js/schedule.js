
var sprinklerList = document.getElementById('sprinklerList');
var wateringTasksList = document.getElementById('wateringTasksList');
var save = document.getElementById('save');
var back = document.getElementById('back');


$(document).ready(function() {
    // Get schedules when document is ready
    getSchedules();

    // Add Schedule button click event
    $("#add-schedule-btn").click(function() {
        // log to the console
        console.log("Add Schedule button clicked");

        // Show the modal
        $("#scheduleModal").modal("show");
    });

    // add schedule form submit event
    $("#schedule-form").submit(function(e) {
        e.preventDefault(); // Prevent form from submitting normally
        // Call the addSchedule function
        // log to the console
        console.log("Add Schedule form submitted");
        addSchedule();
    });


    // Edit Schedule button click event
    $("#edit-schedule-form").submit(function(e) {
        e.preventDefault(); // Prevent form from submitting normally
        // Get the scheduleId from the hidden input
        let scheduleId = $("#edit-schedule-id").val();
        // Call the editSchedule function with scheduleId
        editSchedule(scheduleId);
    });
    
    // Event handlers for "Edit Schedule" buttons
    $("#schedules-table").on("click", ".edit-schedule-btn", function(e) {
        e.stopPropagation();  // Prevent triggering the row click event
        let scheduleId = $(this).closest("tr").data("id");
        // Show the modal
        $("#editScheduleModal").modal("show");
    });

    // Event handler for "Delete-Schedule" button. 
    $("#schedules-table").on("click", ".btn-delete-schedule", function(e) {
        e.stopPropagation();  // Prevent triggering the row click event
        let scheduleId = $(this).closest("tr").data("id");

        // confirm delete
        if (confirm("Are you sure you want to delete schedule ID " + scheduleId + "?")) {
            // Call the deleteSchedule function with scheduleId
            deleteSchedule(scheduleId);
        } else {
            // do nothing
        }
    });

    // go back to the index page
    $("#back").click(function() {
        window.location.href = "/";
    });

});

function getSchedules() {

    console.log("Getting schedules");

    //clear the table
    $("#schedules-table tbody").empty();

    $.ajax({
      url: '/schedules',
      type: 'GET',
      success: function(schedules) {
  
        // Clear table
        $("#schedules-table tbody").empty(); 
  
        schedules.forEach(function(schedule) {
  
            // Row
            const row = document.createElement('tr');
            row.setAttribute('data-id', schedule.id);

            console.log("loading schedule id: " + schedule.id);
    
            // Cells
            const nameCell = document.createElement('td');
            nameCell.textContent = schedule.name;
    
            // Create task list button
            const taskListCell = document.createElement('td');
            const taskListBtn = document.createElement('button');
            taskListBtn.classList.add('btn', 'btn-sm', 'btn-info', 'task-list-btn');
            taskListBtn.setAttribute('data-id', schedule.id);
            taskListBtn.textContent = 'Task List';
            taskListCell.appendChild(taskListBtn);

            //debug button info to console
            console.log("taskListBtn: " + taskListBtn);
            console.log("taskListBtn data-id: " + taskListBtn.getAttribute('data-id'));

            // Create edit schedule button
            const editCell = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.classList.add('btn', 'btn-sm', 'btn-warning', 'edit-schedule-btn');
            editBtn.setAttribute('data-id', schedule.id);
            editBtn.textContent = 'Edit';
            editCell.appendChild(editBtn);
            
    
            const timeCell = document.createElement('td');
            timeCell.textContent = schedule.nextRunTime;
    
            // Create delete schedule button
            const actionCell = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn', 'btn-sm', 'btn-danger', 'btn-delete-schedule');
            deleteBtn.setAttribute('data-id', schedule.id);
            deleteBtn.textContent = 'Delete';
            actionCell.appendChild(deleteBtn);
    
            // Append cells to row
            row.appendChild(nameCell);
            row.appendChild(taskListCell);
            row.appendChild(editCell);
            row.appendChild(timeCell);
            row.appendChild(actionCell);
    
            // Append row to table
            $('#schedules-table tbody').append(row);
  
        });
  
      }
  
    });
  
  }

// Function to get schedule details
function getScheduleDetails(scheduleId) {
    $.ajax({
        url: '/schedules/' + scheduleId, // your endpoint to get a single schedule
        type: 'GET',
        success: function(schedule) {
            // Populate the modal with the schedule data
            $("#scheduleModal .modal-body").html(`
                <p>Name: ${schedule.name}</p>
                <p>Watering Task: ${schedule.wateringTask}</p>
                <p>Schedule: ${schedule.schedule}</p>
                <p>Next Run Time: ${schedule.nextRunTime}</p>
            `);

            // Show the modal
            $("#scheduleModal").modal("show");
        },
        error: function(error) {
            console.log(error);
        }
    });
}

// Function to add a schedule
function addSchedule() {
    // Get the schedule data from the form
    let scheduleData = {
        name: $("#schedule-name").val()
    };

    // output debug info to the console
    console.log(scheduleData);

    $.ajax({
        url: '/schedules', // your endpoint to add a schedule
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(scheduleData),
        success: function(schedule) {
            console.log("Schedule added successfully");
            $("#scheduleModal").modal("hide");

            // Clear the form
            $("#schedule-name").val("");
            $("#watering-task").val("");
            $("#schedule").val("");

            // Refresh the schedules table
            getSchedules();
        },
        error: function(error) {
            console.log(error);
        }
    });
}

// Function to edit a schedule
function editSchedule() {
    // Get the schedule data from the form
    let scheduleData = {
        name: $("#edit-schedule-name").val()
    };

    // output debug info to the console
    console.log(scheduleData);

    $.ajax({
        url: '/schedules/' + scheduleId, // your endpoint to edit a schedule
        type: 'PUT',
        data: scheduleData,
        success: function(schedule) {
            // Hide the modal
            $("#editScheduleModal").modal("hide");

            // Clear the form
            $("#edit-schedule-name").val("");

            // Refresh the schedules table
            getSchedules();
        },
        error: function(error) {
            console.log(error);
        }
    });
}

// Function to delete a schedule
function deleteSchedule(scheduleId) {
    $.ajax({
        url: '/schedules/' + scheduleId, // your endpoint to delete a schedule
        type: 'DELETE',
        success: function(schedule) {
            // Refresh the schedules table
            getSchedules();
        },
        error: function(error) {
            console.log(error);
        }
    });
}

