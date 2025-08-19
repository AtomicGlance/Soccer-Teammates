document.addEventListener('DOMContentLoaded', () => {
    // Get references to all HTML elements
    const checkButton = document.getElementById('checkButton');
    const playerListInput = document.getElementById('playerList');
    const singlePlayerInput = document.getElementById('singlePlayer');
    const findCommonTeammateCheckbox = document.getElementById('findCommonTeammate');
    const resultDiv = document.getElementById('result');

    const API_ENDPOINT = '/check-teammates';

    // Event listener to hide/show the single player input based on the checkbox
    findCommonTeammateCheckbox.addEventListener('change', () => {
        singlePlayerInput.style.display = findCommonTeammateCheckbox.checked ? 'none' : 'block';
    });

    const performCheck = async () => {
        const playerList = playerListInput.value.trim();
        const singlePlayer = singlePlayerInput.value.trim();
        const isFindingCommon = findCommonTeammateCheckbox.checked;

        // Validation: Ensure the list is not empty
        if (!playerList) {
            resultDiv.innerHTML = '<p>The player list cannot be empty.</p>';
            return;
        }

        // Update UI to a loading state
        checkButton.disabled = true;
        checkButton.textContent = 'Searching...';
        resultDiv.innerHTML = '<p>Consulting the AI historian...</p>';

        try {
            // The request body now includes a "mode" to tell the backend what to do
            const requestBody = {
                mode: isFindingCommon ? 'common' : 'single',
                playerList: playerList,
                singlePlayer: singlePlayer,
            };
            
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error || `Server error: ${response.statusText}`);
            }
            
            const aiResponse = data.choices[0].message.content;
            resultDiv.innerHTML = `<p>${aiResponse.replace(/\n/g, '<br>')}</p>`;

        } catch (error) {
            console.error('Error:', error);
            resultDiv.innerHTML = `<p><strong>Error:</strong> ${error.message}</p>`;
        } finally {
            checkButton.disabled = false;
            checkButton.textContent = 'Find Teammates';
        }
    };

    checkButton.addEventListener('click', performCheck);
});