function goBack() {
    // back to the previous page
    window.history.back();
}

// function to fetch the sprinkler by id and return the name
function getSprinklerName(sprinklerId) {
    return document.querySelector(`#sprinklerList li[data-id="${sprinklerId}"]`).textContent;
}



// function to create a sortable.js list and load the sprinklers from the database
// sprinkers are loaded into the list as list items and shown in the modal
async function loadSprinklers() {
    // clear the list
    document.getElementById('sprinklerList').innerHTML = '';
    
    try {
        const data = await fetchSprinklers();
        
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
    } catch (error) {
        console.error('Error in loadSprinklers:', error);
    }
}



// Function to clear the existing list of tasks in the DOM
function clearTaskList() {
    document.getElementById('wateringTasksList').innerHTML = '';
}



// Function to load the tasks for the specified scheduleId
// Tasks are loaded into the list as list items and shown in the modal
async function loadTasks(scheduleId) {
    clearTaskList();
    
    // if the schedule id is undefined, then we are creating a new schedule
    if (scheduleId == undefined) {
        initializeSortableList();
    }
    // else we are editing an existing schedule
    else {
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

}


function getWateringTasks(scheduleId) {

    // debug
    console.log("Getting watering tasks");

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
    return tasks;
}


// Function to create a list item for a task and return it
// This function is called by loadTasks
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



// function to setup the sortable list
// this function is called when the modal is shown. also handles the onAdd event
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



function getScheduleFormData() {
    let name = document.getElementById("name");
    let frequency = document.getElementById("frequency");
    let startTime = document.getElementById("startTime");

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

    return {
        name: name.value,
        frequency: frequency.value,
        start_time: startTime.value,
        custom_days: customDays,
    };
}

// Function to create a sprinkler button group with various buttons and event handlers
async function createSprinklerButtonGroup(sprinkler) {
    // The sprinkler parameter is an object with properties: id and name

    // Create DOM elements for the button group and individual buttons
    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('btn-group', 'm-1');
    buttonGroup.setAttribute('role', 'group');

    const idButton = document.createElement('button');
    idButton.classList.add('btn', 'btn-secondary');
    idButton.setAttribute('disabled', 'true');
    idButton.setAttribute('data-id', sprinkler.id);
    idButton.textContent = sprinkler.id;

    const nameButton = document.createElement('button');
    nameButton.classList.add('btn', 'btn-secondary');
    nameButton.setAttribute('data-id', sprinkler.id);
    nameButton.textContent = sprinkler.name;

    const editButton = document.createElement('button');
    editButton.classList.add('btn', 'btn-warning');
    editButton.innerHTML = '<i class="bi bi-pencil"></i>';
    editButton.addEventListener('click', () => editSprinklerDetails(sprinkler.id));

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
    deleteButton.addEventListener('click', () => deleteSprinklerById(sprinkler.id));

    // Create a button to represent and toggle the sprinkler state
    const currentState = await fetchSprinklerState(sprinkler.id);
    const stateButton = document.createElement('button');
    stateButton.classList.add('btn', currentState ? 'btn-success' : 'btn-danger', 'state-button');
    stateButton.setAttribute('data-id', sprinkler.id);
    stateButton.innerHTML = '<i class="bi bi-power"></i>'

    // Add event listener to toggle the state when the button is clicked
    stateButton.addEventListener('click', () => toggleSprinklerState(sprinkler.id));

    // Append buttons to the button group
    buttonGroup.append(idButton, nameButton, stateButton, editButton, deleteButton);

    return buttonGroup;
}

// Function to find the correct position to insert a sprinkler button group based on the sprinkler ID
function insertSprinklerButtonGroup(buttonGroup, sprinklerId) {
    // The buttonGroup parameter is a DOM element representing the button group to insert
    // The sprinklerId parameter is the ID of the sprinkler

    // Find the existing button groups in the DOM
    let existingButtons = document.querySelectorAll('#sprinkler-buttons .btn-group');
    
    // Find the correct position based on the sprinkler ID
    let inserted = false;
    for (let i = 0; i < existingButtons.length; i++) {
        let existingId = parseInt(existingButtons[i].querySelector('button').getAttribute('data-id'));
        if (sprinklerId < existingId) {
            existingButtons[i].before(buttonGroup);
            inserted = true;
            break;
        }
    }

    // If not inserted, append it at the end
    if (!inserted) {
        document.getElementById('sprinkler-buttons').append(buttonGroup);
    }
}
