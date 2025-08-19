export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // 1. Get data from the frontend, now including the "mode".
    const { mode, playerList, singlePlayer } = await context.request.json();
    const GEMINI_API_KEY = context.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured on the server.');
    }

    let prompt;

    // 2. Generate the correct prompt based on the selected mode.
    if (mode === 'common') {
      // PROMPT 1: For finding a common teammate for the entire list.
      prompt = `
        Your task is to act as a world-class soccer historian. I will provide a list of players. You must find one or more players who have been an official teammate with EVERY player on this list at some point in their careers (either at a professional club or on a national team).

        List of players to find a common teammate for:
        ---
        ${playerList}
        ---

        Please format your response as follows:
        1. If you find a common teammate, start with a clear summary sentence, for example: "Sergio Busquets has been a teammate with everyone on the list."
        2. Below the summary, provide a bulleted list that proves the connection for each player on the original list. For example:
           - Teammate with Lionel Messi at FC Barcelona (2008-2021) and Inter Miami (2023-Present).
           - Teammate with Andrés Iniesta on the Spanish National Team (2009-2018).
           - Teammate with Sergio Ramos on the Spanish National Team (2009-2021).
        3. If no single player has been a teammate with everyone on the list, state that clearly and concisely.
      `;
    } else {
      // PROMPT 2: The original prompt for checking one player against a list.
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

    // 3. The API call logic remains the same, just with the chosen prompt.
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
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}