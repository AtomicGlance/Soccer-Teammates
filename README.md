Soccer Teammate Finder

A web application that uses the Google Gemini AI to find connections between professional soccer players. The app can check if a specific player has been a teammate with anyone on a given list or find a common teammate for an entire list of players.

Live Demo: https://soccer-teammates.pages.dev/

⚽ Features

This tool offers two distinct modes for discovering player connections:

    Check Player Against List: Provide a list of players and a single "focus player" to see which players from the list have been teammates with the focus player.

    Find Common Teammate: Provide a list of at least two players, and the application will find a player who has been a teammate with everyone on that list.

🛠️ Tech Stack & Architecture

This project is built with a modern, serverless architecture to ensure API keys are kept secure.

    Frontend: HTML, CSS, JavaScript

    Backend: Cloudflare Functions (Serverless)

    AI Model: Google Gemini API

    Deployment: Cloudflare Pages

Secure Architecture

The user's browser never directly communicates with the Google Gemini API. Instead, it sends requests to a secure backend function running on Cloudflare. This function is the only part of the system that has access to the secret API key, which is stored as an encrypted environment variable. This prevents the API key from being exposed publicly.
🚀 Setup and Deployment

To deploy your own version of this project, follow these steps:
1. Clone the Repository

git clone https://github.com/AtomicGlance/Soccer-Teammates.git
cd Soccer-Teammates

2. Get a Google Gemini API Key

    Go to Google AI Studio.

    Log in and click "Get API key" to create a new key.

    Copy the generated API key.

3. Deploy to Cloudflare Pages

    Push the cloned repository to your own GitHub account.

    Log in to your Cloudflare dashboard and go to Workers & Pages.

    Click Create application > Pages > Connect to Git.

    Select your repository and click Save and Deploy.

4. Set the Environment Variable

    In your new Cloudflare project, go to Settings > Variables and Secrets.

    Under Environment variables, click Add variable.

    Set the following:

        Variable name: GEMINI_API_KEY

        Value: Paste your API key from Google AI Studio.

    Click Encrypt and then Save.

    Go to the Deployments tab and redeploy the project to apply the changes.

📖 How to Use

    Check Player Against List:

        Paste a list of players into the text area.

        Enter a single player's name in the input box below.

        Ensure the "Find a common teammate" checkbox is unchecked.

        Click "Find Teammates".

    Find a Common Teammate:

        Paste a list of players you want to find a common link for.

        Check the "Find a common teammate for this list" box. The single player input will disappear.

        Click "Find Teammates".
