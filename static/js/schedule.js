
var sprinklerList = document.getElementById('sprinklerList');
var wateringTasksList = document.getElementById('wateringTasksList');
var save = document.getElementById('save');
var back = document.getElementById('back');


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
    
    // Event handlers for "Edit Task"
    $("#schedules-table").on("click", ".task-list-btn", function(e) {
        e.stopPropagation();  // Prevent triggering the row click event

        let scheduleId = $(this).closest("tr").data("id");

        console.log("Edit Task button clicked for schedule " + scheduleId);
        
        // Open the modal to edit the watering task with this ID
        $("#taskListModal").modal("show");


        // update the modal header to include the schedule id
        console.log('updating task list header');
        const taskModalHeader = document.getElementById('task-modal-header');
        taskModalHeader.textContent = 'Schedule ' + scheduleId + ' task editor';

        // update the save button to include the schedule id
        console.log('updating save button');
        const saveBtn = document.getElementById('save');
        saveBtn.setAttribute('data-schedule-id', scheduleId);

        // Get the schedule id from the button's data attribute
        $.getJSON("/sprinklers", function(data){
            // Empty the list first
            $("#sprinklerList").empty();
            
            console.log("creating sortable list");

            // Populate the list with data from the server
            $.each(data, function(index, sprinkler){
                var li = $("<li>").text(sprinkler.name).addClass("sortable-item list-group-item").attr("data-id", sprinkler.id);
                $("#sprinklerList").append(li);
            });

            // Create Sortable.js instance for the sprinkler list after the list is populated
            Sortable.create(sprinklerList, {
                animation: 150,
                group: {
                    name: 'shared',
                    pull: 'clone',
                    put: false,
                    revertClone: true
                }
            });
        });

        // Create Sortable.js instance for the watering tasks list
        Sortable.create(wateringTasksList, {
            group: 'shared',
            animation: 150,
            onAdd: function (evt) {
                var itemEl = evt.item;  // dragged HTMLElement

                // create a div to hold item's content
                var itemContent = document.createElement('div');
                itemContent.innerHTML = itemEl.innerHTML;
                itemEl.innerHTML = '';
                itemEl.appendChild(itemContent);

                // time input container
                var timeContainer = document.createElement('div');
                timeContainer.classList.add('m-2');

                // time label
                var timeLabel = document.createElement('span');
                timeLabel.innerHTML = 'Runtime: ';
                timeLabel.classList.add('time-label');
                timeContainer.appendChild(timeLabel);

                // time input field
                var timeInput = document.createElement('input');
                timeInput.type = "number";
                timeInput.min = "1";
                timeInput.value = "5";
                timeInput.max = "60";
                timeInput.placeholder = "Enter time in mins";
                timeInput.classList.add('time-input');
                timeContainer.appendChild(timeInput);

                // help text
                var helpText = document.createElement('small');
                helpText.innerHTML = "Enter time in minutes";
                helpText.classList.add('form-text', 'text-muted');
                timeContainer.appendChild(helpText);


                // add time container to item
                itemEl.appendChild(timeContainer);

                // remove button
                var removeBtn = document.createElement('button');
                removeBtn.innerHTML = 'X';
                removeBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'remove-btn');
                removeBtn.addEventListener('click', function(e) {
                    itemEl.remove();
                });

                // add remove button to item
                itemEl.appendChild(removeBtn);
            }
        });

        // Load the tasks from the server
        if(typeof loadTasks === 'function'){
            console.log('loadTasks is a function');
            loadTasks(scheduleId);
        } else {
            console.log('loadTasks is not a function!');
        }
        


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
                            <button class="btn btn-sm btn-info edit-schedule-btn" data-schedule-id="${schedule.id}">
                                Edit Schedule
                            </button>
                        </td>
                        <td>${schedule.nextRunTime}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" data-schedule-id="${schedule.id}">
                                Edit
                            </button>
                            <button class="btn btn-sm btn-danger btn-delete-schedule" data-schedule-id="${schedule.id}">
                                Delete
                            </button>
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

async function loadTasks(scheduleId) {

    const response = await fetch(`/watering_tasks/${scheduleId}`);
    const tasks = await response.json();

    // Clear the list first
    $('#wateringTasksList').empty();

    tasks.forEach(task => {

        // Get sprinkler name
        const sprinklerName = $(`#sprinklerList li[data-id=${task.sprinkler_id}]`).text();

        // Create elements
        const li = document.createElement('li');
        const content = document.createElement('div');
        const timeInput = document.createElement('input');
        const label = document.createElement('span');
        const helpText = document.createElement('small');
        const timeContainer = document.createElement('div');


        const removeBtn = document.createElement('button');
        removeBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'remove-btn');

        // Add classes  
        li.classList.add('sortable-item', 'time-label');
        content.classList.add('task-content', 'm-2');
        timeInput.classList.add('time-input', 'm-2');
        label.classList.add('time-label');
        helpText.classList.add('form-text', 'text-muted');


        // Set content
        content.textContent = `${sprinklerName}`;
        timeInput.type = 'number';
        timeInput.min = 1;
        timeInput.max = 60;
        timeInput.value = task.duration;
        label.textContent = 'Runtime: ';
        helpText.textContent = 'Enter time in minutes';
        removeBtn.textContent = 'Remove';

        // Append elements  
        li.appendChild(content);
        timeContainer.appendChild(label);
        timeContainer.appendChild(timeInput);
        timeContainer.appendChild(helpText);
        li.appendChild(timeContainer);
        li.appendChild(removeBtn);

        // Set attributes
        li.dataset.id = task.sprinkler_id;

        // Event listeners
        removeBtn.addEventListener('click', () => {
            li.remove();
        });

        $('#wateringTasksList').append(li);

    });

}


save.addEventListener('click', function(e) {

    var items = document.querySelectorAll('#wateringTasksList li');
    var tasks = [];
    for (var i = 0; i < items.length; i++) {
        tasks.push({
            duration: items[i].querySelector('.time-input').value,
            schedule_id: 1,
            task_order: i,
            sprinkler_id: items[i].getAttribute('data-id')  // Changed from 'sprinklers' to 'sprinkler_id'
        });
    }

    let scheduleId = $(this).data("schedule-id");

    console.log("Delete scheduleId: " + scheduleId);

    // Delete existing tasks for the associated scheduleId
    $.ajax({
        url: "/watering_tasks/" + scheduleId,
        method: "DELETE",
        contentType: "application/json",
        success: function(response) {
            console.log(response);

            // After successful deletion, proceed with saving the updated tasks
            saveWateringTasks(tasks,scheduleId);
        },
        error: function(xhr, status, error) {
            console.error(error);
            alert('Failed to delete existing tasks. Please try again.');
        }
    });
    
    // close the taskListModal
    $("#taskListModal").modal("hide");

    // clear the wateringTasksList
    $('#wateringTasksList').empty();

});


function saveWateringTasks(tasks, scheduleId) {
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