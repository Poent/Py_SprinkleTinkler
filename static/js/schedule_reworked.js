
var sprinklerList = document.getElementById('sprinklerList');
var wateringTasksList = document.getElementById('wateringTasksList');


$(document).ready(function() {
    // Get schedules when document is ready
    loadSchedulesTable();

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

    
    // Event handlers for "Edit Schedule" buttons
    $("#schedules-table").on("click", ".edit-schedule-btn", function(e) {
        e.stopPropagation();  // Prevent triggering the row click event
        
        // Get the scheduleId from the button
        var scheduleId = $(this).data("id");
        
        // debug to console
        console.log("Edit Schedule button clicked for scheduleId: " + scheduleId);

        // update the modal content
        editSchedule(scheduleId);

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

    // Event handler for frequency change
    document.getElementById("frequency").addEventListener('change', function () {
        if (this.value === 'custom') {
            document.getElementById("customDays").style.display = 'block';
        } else {
            document.getElementById("customDays").style.display = 'none';
        }
    });

});

// Function to load schedules table from API
// we will call this function whenever we need to refresh the schedules table
function loadSchedulesTable() {

    console.log("Loading  schedules");
    // Get schedules from API
    $.ajax({
      url: '/schedules',
      type: 'GET',
      success: function(schedules) {
  
        // Clear table
        $("#schedules-table tbody").empty(); 
        
        // for each schedule
        schedules.forEach(function(schedule) {

            console.log("loading schedule id: " + schedule.id);
  
            // Create a Row
            const row = document.createElement('tr');

            // Add data-id attribute
            row.setAttribute('data-id', schedule.id);

            // Create the id cell
            const idCell = document.createElement('td');
            idCell.textContent = schedule.id;
    
            // Create the name cell
            const nameCell = document.createElement('td');
            nameCell.textContent = schedule.name;
    
            // Create the edit button (with schedule id in data-id attribute)
            const editBtn = document.createElement('button');
            editBtn.classList.add('btn', 'btn-sm', 'btn-info', 'edit-schedule-btn');
            editBtn.setAttribute('data-id', schedule.id);
            editBtn.textContent = 'Edit';


            //debug button info to console
            console.log("editBtn: " + editBtn);
            console.log("editBtn data-id: " + editBtn.getAttribute('data-id'));

            // Create the frequency cell
            const frequencyCell = document.createElement('td');
            frequencyCell.textContent = schedule.frequency;
            
            // Create the start time cell
            const startTimeCell = document.createElement('td');
            startTimeCell.textContent = schedule.start_time;
            
            // Create the next time cell
            const nextTimeCell = document.createElement('td');
            nextTimeCell.textContent = schedule.next_run;
    
            // Create delete schedule button
            const actionCell = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn', 'btn-sm', 'btn-danger', 'btn-delete-schedule');
            deleteBtn.setAttribute('data-id', schedule.id);
            deleteBtn.textContent = 'Delete';

            actionCell.appendChild(editBtn);
            actionCell.appendChild(deleteBtn);
    
            // Append cells to row
            row.appendChild(idCell);
            row.appendChild(nameCell);
            row.appendChild(frequencyCell);
            row.appendChild(startTimeCell);
            row.appendChild(nextTimeCell);
            row.appendChild(actionCell);
    
            // Append row to table
            $('#schedules-table tbody').append(row);
  
        });
      }
    });
  }

  function editSchedule(scheduleId) {
    
    // Debug to see what is being passed in
    console.log("Editing scheduleId: " + scheduleId);

    // Update the header of the modal with the scheduleId
    document.querySelector('.schedule-modal-header').innerText = "Edit Schedule " + scheduleId;

    // Fetch existing data for the schedule by ID (assuming your API endpoint follows this format)
    fetch('/schedules/' + scheduleId)
    .then(response => response.json())
    .then(data => {

        // Debug to see what is being returned
        console.log('Schedule data received from FETCH:', data);

        // Update the input fields with existing data
        document.getElementById("frequency").value = data.frequency || 'daily';
        document.getElementById("startTime").value = data.start_time || '00:00';

        // Show or hide the customDays section based on the frequency
        if (data.frequency === 'custom') {
            document.getElementById("customDays").style.display = 'block';
        } else {
            document.getElementById("customDays").style.display = 'none';
        }

        // Reset all checkboxes to unchecked before setting them based on the database values
        var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        days.forEach(function(day) {
            document.getElementById(day).checked = false;
        });

        // Check the appropriate checkboxes for customDays based on the database
        if (data.custom_days) {
            var customDaysArray = data.custom_days.split(",");
            customDaysArray.forEach(function(day) {
                document.getElementById(day).checked = true;
            });
        }
    })
    .catch(error => {
        // Handle error here
        console.error('Error fetching schedule:', error);
    });

    loadSprinklers(scheduleId);
    loadTasks(scheduleId);

    // Display the modal
    $('#editScheduleModal').modal('show');
}

// function to create a sortable.js list and load the sprinklers from the database
function loadSprinklers(scheduleId) {

    // clear the list
    document.getElementById('sprinklerList').innerHTML = '';

    // Fetch sprinklers from the database
    fetch('/sprinklers')
    .then(response => response.json())
    .then(data => {
        // Debug to see what is being returned
        console.log('Sprinkler data received from FETCH:', data);

        // Create a list item for each sprinkler
        data.forEach(function(sprinkler) {
            var sprinklerItem = document.createElement('li');
            sprinklerItem.className = 'list-group-item';
            sprinklerItem.classList.add('sortable-item');
            sprinklerItem.innerText = sprinkler.name;
            sprinklerItem.setAttribute('data-sprinkler-id', sprinkler.id);
            sprinklerItem.setAttribute('data-schedule-id', scheduleId);
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

// function to load the tasks from the database and create a sortable.js list
function loadTasks(scheduleId) {

    // clear the list
    document.getElementById('wateringTasksList').innerHTML = '';

    // Fetch tasks from the database
    fetch('/watering_tasks/' + scheduleId )
    .then(response => response.json())
    .then(data => {
        // Debug to see what is being returned
        console.log('Task data received from FETCH:', data);

        // Create a list item for each task
        data.forEach(function(task) {
            // Get sprinkler name
            const sprinklerName = $(`#sprinklerList li[data-id=${task.sprinkler_id}]`).text();

            // Create elements
            const li = document.createElement('li');
            const content = document.createElement('div');
            const timeInput = document.createElement('input');
            const label = document.createElement('span');
            const helpText = document.createElement('small');
            const timeContainer = document.createElement('div');

            // Create remove button
            const removeBtn = document.createElement('button');
            removeBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'remove-btn', 'm-2', 'p-1');

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

            // Append to list
            $('#wateringTasksList').append(li);

        });

        // Create a sortable list
        var sortable = Sortable.create(wateringTasksList, {
            group: {
                name: 'wateringTasksList',
                pull: 'clone',
                put: true
            },
            sort: false,
            animation: 150
        });
    })
    .catch(error => {
        // Handle error here
        console.error('Error fetching tasks:', error);
    });
}

// Function to delete a schedule
function deleteSchedule(scheduleId) {
    $.ajax({
        url: '/schedules/' + scheduleId, // your endpoint to delete a schedule
        type: 'DELETE',
        success: function(schedule) {
            // Refresh the schedules table
            loadSchedulesTable();
        },
        error: function(error) {
            console.log(error);
        }
    });
}

