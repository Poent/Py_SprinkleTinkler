$(document).ready(function() {
    // Get schedules when document is ready
    getSchedules();

    // Add event listener to the table rows
    $("#schedules-table").on("click", "tr", function() {
        let scheduleId = $(this).data("id");
        getScheduleDetails(scheduleId);
    });
    
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
    
    // Event handlers for "Edit Watering Task"
    $("#schedules-table").on("click", ".task-list-btn", function(e) {
        e.stopPropagation();  // Prevent triggering the row click event
        let scheduleId = $(this).closest("tr").data("id");

        

        // Open the modal to edit the watering task with this ID
        $("#taskListModal").modal("show");
    });

    // Event handlers for "Edit Schedule" buttons
    $("#schedules-table").on("click", ".edit-schedule-btn", function(e) {
        e.stopPropagation();  // Prevent triggering the row click event
        let scheduleId = $(this).closest("tr").data("id");
        // Show the modal
        $("#editScheduleModal").modal("show");
    });

    // Event handler for "Delete" button
    $("#schedules-table").on("click", ".btn-delete-schedule", function(e) {
        e.stopPropagation();  // Prevent triggering the row click event
        let scheduleId = $(this).closest("tr").data("id");

        // Call the deleteSchedule function with scheduleId
        deleteSchedule(scheduleId);
    });


    // go back to the index page
    $("#back").click(function() {
        window.location.href = "/";
    });
});



// Function to get schedules
function getSchedules() {
    $.ajax({
        url: '/schedules', // your endpoint to get schedules
        type: 'GET',
        success: function(schedules) {
            // Clear the table
            $("#schedules-table").empty();

            // Add each schedule to the table
            schedules.forEach(schedule => {
                $("#schedules-table").append(`
                    <tr data-id="${schedule.id}">
                        <td>${schedule.name}</td>
                        <td>
                            <button class="btn btn-sm btn-info task-list-btn">Task List</button>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-info edit-schedule-btn">Edit Schedule</button>
                        </td>
                        <td>${schedule.nextRunTime}</td>
                        <td>
                            <button class="btn btn-sm btn-primary">Edit</button>
                            <button class="btn btn-sm btn-danger btn-delete-schedule">Delete</button>
                        </td>
                    </tr>
                `);
            });
        },
        error: function(error) {
            console.log(error);
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