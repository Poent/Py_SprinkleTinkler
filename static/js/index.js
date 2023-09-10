document.addEventListener('DOMContentLoaded', (event) => {
    initializeApp();
});

async function initializeApp() {
    try {
        await loadSprinklers();
        // TODO: Initialize calendar
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

async function loadSprinklers() {
    try {
        const sprinklers = await fetchSprinklers(); // Fetch sprinkler data from the API
        const sprinklerButtonsContainer = document.getElementById('sprinkler-buttons'); // Get the container to hold the sprinkler buttons
        sprinklerButtonsContainer.innerHTML = ''; // Clear any existing sprinkler buttons

        for (const sprinkler of sprinklers) {
            const buttonGroup = await createSprinklerButtonGroup(sprinkler); // Create button group for each sprinkler using utility function
            insertSprinklerButtonGroup(buttonGroup, sprinkler.id); // Insert the button group in the correct position in the DOM using utility function
        }
    } catch (error) {
        console.error('Error loading sprinklers:', error);
    }
}


async function addNewSprinkler() {
    try {
        const newSprinklerName = prompt('Please enter the name for the new sprinkler:');
        if (newSprinklerName) {
            await addSprinkler({ name: newSprinklerName });
            await loadSprinklers();
        }
    } catch (error) {
        console.error('Error adding new sprinkler:', error);
    }
}

async function toggleSprinklerState(sprinklerId) {
    try {
        // Get the current state of the sprinkler from the API
        const currentState = await fetchSprinklerState(sprinklerId);

        // Toggle the state and update it in the API
        const newState = !currentState;
        await toggleSprinklerStateApi(sprinklerId, newState); // Ensure the function name matches with the one in your api.js file

        // Update the button state in the DOM to reflect the new state
        const stateButton = document.querySelector(`button.state-button[data-id="${sprinklerId}"]`);
        
        // Update the button style to reflect the new state
        if (newState) {
            stateButton.classList.remove('btn-danger');
            stateButton.classList.add('btn-success');
        } else {
            stateButton.classList.remove('btn-success');
            stateButton.classList.add('btn-danger');
        }
    } catch (error) {
        console.error('Error toggling sprinkler state:', error);
    }
}




// TODO: Function to initialize the FullCalendar with events

