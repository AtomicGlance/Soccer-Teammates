/**
 * This is the updated backend function that securely communicates
 * with the Google Gemini API.
 */
export async function onRequest(context) {
  // Only allow POST requests.
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // 1. Get player data from the frontend's request.
    const { playerList, singlePlayer } = await context.request.json();

    // 2. Securely access the NEW Gemini API key from Cloudflare's environment variables.
    const GEMINI_API_KEY = context.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured on the server.');
    }

    // 3. The prompt remains the same, as it's well-structured.
    const prompt = `
        I have a single focus soccer player: "${singlePlayer}".
        I also have a list of other players provided below, separated by newlines:
        ---
        ${playerList}
        ---
        Your task is to determine if the focus player, "${singlePlayer}", has ever been an official teammate (at a professional club or on a national team) with ANY of the players on the provided list.
        Please format your response as follows:
        1. Start with a clear summary sentence.
        2. If matches are found, create a bulleted list specifying the player, team, and approximate years.
    `;

    // 4. Construct the request for the Google Gemini API.
    // Note the URL and the request body format are different from DeepSeek.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    // 5. Make the secure, server-to-server call to the Gemini API.
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      throw new Error(`Google Gemini API error: ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();

    // 6. Extract the text from the Gemini response structure.
    const aiResponseText = data.candidates[0]?.content?.parts[0]?.text;
    if (!aiResponseText) {
        throw new Error('No valid response content from the AI.');
    }

    // 7. IMPORTANT: We format our response to match the structure the frontend
    // expects, so no frontend changes are needed.
    const frontendResponse = {
      choices: [{
        message: {
          content: aiResponseText
        }
      }]
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