
document.addEventListener('DOMContentLoaded', (event) => {
    loadSprinklersTable();

    // Add event handler for the "Add Sprinkler" button
    // This should be inside the DOMContentLoaded event handler to ensure 
    // that the button is available in the DOM when this script runs
    document.getElementById('addSprinklerButton').addEventListener('click', () => {
        openSprinklerModal();
    });
});

async function loadSprinklersTable() {
    try {
        const sprinklers = await fetchSprinklers(); // Fetch sprinkler data from the API
        const tableBody = document.getElementById('sprinkler-table-body'); // Get the table body element to hold the sprinkler rows
        tableBody.innerHTML = ''; // Clear any existing rows

        for (const sprinkler of sprinklers) {
            const row = await createSprinklerRow(sprinkler); // Create a table row for each sprinkler
            tableBody.appendChild(row); // Add the row to the table body
        }
    } catch (error) {
        console.error('Error loading sprinklers:', error);
    }
}

async function createSprinklerRow(sprinkler) {
    const row = document.createElement('tr');

    // Create cells for the sprinkler ID, name, and state
    const idCell = document.createElement('td');
    idCell.textContent = sprinkler.id;

    const nameCell = document.createElement('td');
    nameCell.textContent = sprinkler.name;

    const stateCell = document.createElement('td');
    const currentState = await fetchSprinklerState(sprinkler.id); // Fetch the current state from the API
    stateCell.textContent = currentState ? 'On' : 'Off';

    // Create cells with buttons for the actions
    const actionsCell = document.createElement('td');

    // Toggle state button
    const toggleButton = document.createElement('button');
    toggleButton.classList.add('btn', currentState ? 'btn-success' : 'btn-primary', 'me-2');
    toggleButton.innerHTML = '<i class="bi bi-power"></i>';  // Power symbol icon
    toggleButton.addEventListener('click', () => toggleSprinklerState(sprinkler.id, toggleButton, stateCell));


    // Edit details button
    const editButton = document.createElement('button');
    editButton.classList.add('btn', 'btn-secondary', 'me-2');
    editButton.innerHTML = '<i class="bi bi-pencil"></i>';  // Pencil icon
    editButton.addEventListener('click', () => openSprinklerModal(sprinkler.id));


    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.innerHTML = '<i class="bi bi-trash"></i>';  // Trashcan icon
    deleteButton.addEventListener('click', () => deleteSprinkler(sprinkler.id));

    // Add the buttons to the actions cell
    actionsCell.appendChild(toggleButton);
    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);

    // Add the cells to the row
    row.appendChild(idCell);
    row.appendChild(nameCell);
    row.appendChild(stateCell);
    row.appendChild(actionsCell);

    return row;
}


async function toggleSprinklerState(sprinklerId, toggleButton, stateCell) {
    try {
        const currentState = await fetchSprinklerState(sprinklerId); // Fetch the current state from the API
        const newState = !currentState;
        await toggleSprinklerStateApi(sprinklerId, newState); // Toggle the state using the API
        stateCell.textContent = newState ? 'On' : 'Off'; // Update the state cell text
        toggleButton.classList.toggle('btn-primary', !newState); // Update the toggle button color
        toggleButton.classList.toggle('btn-success', newState); // Update the toggle button color
    } catch (error) {
        console.error('Error toggling sprinkler state:', error);
    }
}

let myModal;
let modalMode = 'edit'; // 'edit' or 'add'
let currentSprinklerId = null;

function openSprinklerModal(sprinklerId = null) {
    myModal = new bootstrap.Modal(document.getElementById('editSprinklerModal'));  // Removed 'var'
    if (sprinklerId) {
        modalMode = 'edit';
        currentSprinklerId = sprinklerId;
        fetchSprinklerById(sprinklerId)
            .then(sprinkler => {
                document.getElementById('sprinklerId').value = sprinkler.id;
                document.getElementById('sprinklerName').value = sprinkler.name;
            })
            .catch(error => console.error('Error fetching sprinkler details:', error));
    } else {
        modalMode = 'add';
        currentSprinklerId = null;
        fetchSprinklers()
            .then(sprinklers => {
                const maxId = Math.max(...sprinklers.map(s => s.id));
                document.getElementById('sprinklerId').value = maxId + 1;
            })
            .catch(error => console.error('Error fetching sprinklers for ID assignment:', error));
        document.getElementById('sprinklerName').value = '';
    }
    myModal.show();
}



document.getElementById('saveSprinklerButton').onclick = async () => {
    const newId = document.getElementById('sprinklerId').value;
    const newName = document.getElementById('sprinklerName').value;

    // Input validation
    if (!newId.trim()) {
        alert('ID cannot be empty');
        return;
    }
    if (!newName.trim()) {
        alert('Name cannot be empty');
        return;
    }

    try {
        let response;
        if (modalMode === 'add') {
            response = await addSprinklerApi({ id: newId, name: newName }); // Call the API to add a new sprinkler
        } else {
            response = await editSprinkler(currentSprinklerId, { id: newId, name: newName }); // Call the API to edit the sprinkler
        }

        // Check if the response contains an error
        if (response.error) {
            alert(response.error);
        } else {
            loadSprinklersTable();
            myModal.hide();
        }
    } catch (error) {
        console.error('Error saving sprinkler:', error);
        alert('An unexpected error occurred. Please try again.');
    }
};





async function deleteSprinkler(sprinklerId) {
    try {
        const response = await deleteSprinklerApi(sprinklerId); // Delete the sprinkler using the API
        if(response) {
            loadSprinklersTable(); // Reload the table to remove the deleted sprinkler
        } else {
            console.error('Failed to delete the sprinkler');
            alert('Failed to delete the sprinkler. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting sprinkler:', error);
        alert('An error occurred while deleting the sprinkler. Please try again.');
    }
}





