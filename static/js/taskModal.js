$(document).ready(function(){

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

        // Create Sortable.js instance after populating the list
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
});

// Edit tasks button click event handler, show taskModal
$("#edit-tasks-btn").click(function(){

    // Get the schedule id from the button's data attribute
    let scheduleId = $(this).data("schedule-id");

    // Show the modal
    $("#taskModal").modal("show");

    //debug to console
    console.log("creating sortable list");

    // Create Sortable.js instance
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
    loadTasks(scheduleId);

});


var sprinklerList = document.getElementById('sprinklerList');
var wateringTasksList = document.getElementById('wateringTasksList');
var save = document.getElementById('save');
var back = document.getElementById('back');

Sortable.create(sprinklerList, {
    animation: 150,
    group: {
        name: 'shared',
        pull: 'clone',
        put: false,
        revertClone: true
    }             
});



// sort event handler
wateringTasksList.addEventListener('sort', function(e) {
    console.log(e);
});

// button click event handler
save.addEventListener('click', function(e) {
    var items = document.querySelectorAll('#wateringTasksList li');
    var order = [];
    for (var i = 0; i < items.length; i++) {
        order.push(items[i].innerHTML);
    }
    console.log(order);
});

back.addEventListener('click', function(e) {
    window.location.href = '/';
});

// save button click event handler
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
            saveWateringTasks(tasks);
        },
        error: function(xhr, status, error) {
            console.error(error);
            alert('Failed to delete existing tasks. Please try again.');
        }
    });
    
    // close the modalTask
    $("#taskModal").modal("hide");

    // clear the wateringTasksList
    $('#wateringTasksList').empty();

});

function saveWateringTasks(tasks) {
    $.ajax({
        url: "/watering_tasks/" + 1,
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

async function loadTasks(scheduleId) {

    const response = await fetch(`/watering_tasks/${scheduleId}`);
    const tasks = await response.json();

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
