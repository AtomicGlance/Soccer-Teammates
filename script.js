document.addEventListener('DOMContentLoaded', () => {
    const checkButton = document.getElementById('checkButton');
    const playerListInput = document.getElementById('playerList');
    const singlePlayerInput = document.getElementById('singlePlayer');
    const resultDiv = document.getElementById('result');

    const API_ENDPOINT = '/check-teammates';

    const performCheck = async () => {
        const playerList = playerListInput.value.trim();
        const singlePlayer = singlePlayerInput.value.trim();

        if (!playerList || !singlePlayer) {
            resultDiv.innerHTML = '<p>Please provide both a list of players and a single player.</p>';
            return;
        }

        checkButton.disabled = true;
        checkButton.textContent = 'Searching...';
        resultDiv.innerHTML = '<p>Consulting the AI scout...</p>';

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ playerList, singlePlayer })
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