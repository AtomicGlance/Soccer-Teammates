export async function onRequest(context) {
  // Only allow POST requests to this endpoint.
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { playerList, singlePlayer } = await context.request.json();

    const DEEPSEEK_API_KEY = context.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
      throw new Error('API key is not configured on the server.');
    }
    
    const prompt = `
        I have a single focus soccer player: "${singlePlayer}".

        I also have a list of other players provided below, separated by newlines:
        ---
        ${playerList}
        ---

        Your task is to determine if the focus player, "${singlePlayer}", has ever been an official teammate (at a professional club or on a national team) with ANY of the players on the provided list.

        Please format your response as follows:
        1. Start with a clear summary sentence, like "Yes, ${singlePlayer} has been teammates with X players from your list." or "No, ${singlePlayer} has not been a teammate with anyone on your list."
        2. If yes, create a bulleted list. For each match you find, specify the player from the list, the team(s) they played on together, and the approximate years.
    `;

    const apiResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.2,
      }),
    });

    if (!apiResponse.ok) {
      throw new Error(`DeepSeek API error: ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}