$(document).ready(function() {

    console.log("TaskList.js loaded");

    // event handler for the save-task button
    $("#saveBtn").click(function() {
        // log to the console
        console.log("Save button clicked");

        // get the schedule id from the save button
        let scheduleId = $(this).data("id");

        console.log("Save scheduleId: " + scheduleId);

        // get the list of tasks
        var items = document.querySelectorAll('#wateringTasksList li');
        var tasks = [];
        for (var i = 0; i < items.length; i++) {
            tasks.push({
                duration: items[i].querySelector('.time-input').value,
                schedule_id: scheduleId,
                task_order: i,
                sprinkler_id: items[i].getAttribute('data-id')  // Changed from 'sprinklers' to 'sprinkler_id'
            });
        }


        // Delete existing tasks for the associated scheduleId and then save the updated tasks
        $.ajax({
            url: "/watering_tasks/" + scheduleId,
            method: "DELETE",
            contentType: "application/json",
            success: function(response) {   // on success, save the updated tasks
                console.log(response);

                // After successful deletion, proceed with saving the updated tasks
                saveWateringTasks(tasks, scheduleId);
            },
            error: function(xhr, status, error) {
                console.error(error);
                alert('Failed to delete existing tasks. Please try again.');
            }
        });

        // close the modalTask
        $("#taskListModal").modal("hide");

        // clear the wateringTasksList
        $('#wateringTasksList').empty();

    });

    // Event handlers for "Edit Task"
    $("#schedules-table").on("click", ".task-list-btn", function(e) {
        e.stopPropagation();  // Prevent triggering the row click event

        // Get the schedule id from the button's data attribute
        const button = $(this);
        const scheduleId = button.data("id");


        console.log("Edit Task button clicked for schedule " + scheduleId);
        
        // Open the modal to edit the watering task with this ID
        $("#taskListModal").modal("show");


        // update the modal header to include the schedule id
        console.log('updating task list header');
        const taskModalHeader = document.getElementById('task-modal-header');
        taskModalHeader.textContent = 'Schedule ' + scheduleId + ' task editor';


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

            console.log("loading tasks for schedule " + scheduleId);
            loadTasks(scheduleId);
        });

        // check if the save button already exists. if so, remove it (to prevent duplicates)
        if (document.getElementById('saveTaskListBtn')) {
            console.log('save button already exists');
            // remove the existing save button
            document.getElementById('saveTaskListBtn').remove();
        }

        // create the save button
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.classList.add('btn', 'btn-primary', 'm-2');
        saveBtn.setAttribute('id', 'saveTaskListBtn');
        saveBtn.setAttribute('data-id', scheduleId);
        saveBtn.setAttribute('data-dismiss', 'modal');
        saveBtn.setAttribute('aria-label', 'Close');
        saveBtn.setAttribute('type', 'button');

        // add the save button to the modal body
        const modalBody = document.getElementById('task-modal-body');
        modalBody.appendChild(saveBtn);

        // Event handler for "Save" button
        saveBtn.addEventListener('click', function(e) {
            var items = document.querySelectorAll('#wateringTasksList li');
            var tasks = [];
            for (var i = 0; i < items.length; i++) {
                tasks.push({
                    duration: items[i].querySelector('.time-input').value,
                    schedule_id: scheduleId,
                    task_order: i,
                    sprinkler_id: items[i].getAttribute('data-id')  // Changed from 'sprinklers' to 'sprinkler_id'
                });
            }

            // Delete existing tasks for the associated scheduleId
            $.ajax({
                url: "/watering_tasks/" + scheduleId,
                method: "DELETE",
                contentType: "application/json",
                success: function(response) {
                    console.log(response);

                    // After successful deletion, proceed with saving the updated tasks
                    saveWateringTasks(tasks, scheduleId);
                },
                error: function(xhr, status, error) {
                    console.error(error);
                    alert('Failed to delete existing tasks. Please try again.');
                }
            });

            // close the modalTask
            $("#taskListModal").modal("hide");

            // clear the wateringTasksList
            $('#wateringTasksList').empty();

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
                removeBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'remove-btn', 'm-2', 'p-1');
                removeBtn.addEventListener('click', function(e) {
                    itemEl.remove();
                });

                // add remove button to item
                itemEl.appendChild(removeBtn);
            }
        });
    });
});



async function loadTasks(scheduleId) {

    // Get tasks for the specified scheduleId
    const response = await fetch(`/watering_tasks/${scheduleId}`);
    const tasks = await response.json();

    // Clear the sortable list first to prevent duplicates
    $('#wateringTasksList').empty();

    // for each task, create a list item
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

}

// Save watering tasks to the database for the specified scheduleId
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