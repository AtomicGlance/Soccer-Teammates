export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // 1. Get data from the frontend, including the "mode".
    const { mode, playerList, singlePlayer } = await context.request.json();
    const GEMINI_API_KEY = context.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured on the server.');
    }

    let prompt;

    // 2. Generate the correct prompt based on the selected mode.
    if (mode === 'common') {
      // ** NEW, MORE ROBUST PROMPT **
      // This prompt forces the AI to think step-by-step.
      prompt = `
        Your task is to act as a world-class soccer historian and solve a logic puzzle. I will provide a list of players. You must determine if there is a player who has been an official teammate with EVERY player on this list at some point in their careers.

        List of players to analyze:
        ---
        ${playerList}
        ---

        Follow these steps precisely:
        1.  **Step 1: Analyze Teammates for Each Player.** For each player on the list, mentally list out some of their most well-known teammates from their various clubs and national teams.
        2.  **Step 2: Find the Intersection.** Compare the lists of teammates you generated in Step 1. Identify any players who appear as a teammate for ALL of the players on the original list.
        3.  **Step 3: Formulate the Final Answer.** Based on your analysis in Step 2, provide your answer.

        **Answer Formatting Rules:**
        -   If you find one or more common teammates, start with a clear summary sentence, for example: "Yes, Keylor Navas has been a teammate with everyone on the list."
        -   Then, provide a bulleted list that proves the connection for each player on the original list. For example:
            - Teammate with Cristiano Ronaldo at Real Madrid (2014-2018).
            - Teammate with Sergio Ramos at Real Madrid (2014-2021) and PSG (2021-2023).
        -   If, after your step-by-step analysis, you are certain no single player has been a teammate with everyone on the list, state that clearly.
      `;
    } else {
      // PROMPT 2: The original prompt (this one works well).
      prompt = `
        I have a single focus soccer player: "${singlePlayer}".
        I also have a list of other players provided below:
        ---
        ${playerList}
        ---
        Your task is to determine if the focus player, "${singlePlayer}", has ever been an official teammate with ANY of the players on the list.
        Please format your response as follows:
        1. Start with a clear summary sentence.
        2. If matches are found, create a bulleted list specifying the player, team, and approximate years.
      `;
    }

    // 3. The API call logic remains the same.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      throw new Error(`Google Gemini API error: ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    const aiResponseText = data.candidates[0]?.content?.parts[0]?.text;

    if (!aiResponseText) {
      throw new Error('No valid response content from the AI.');
    }

    const frontendResponse = {
      choices: [{ message: { content: aiResponseText } }]
    };
    
    return new Response(JSON.stringify(frontendResponse), {
        headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}