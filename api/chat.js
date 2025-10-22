export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // puoi cambiare in opus o sonnet
        max_tokens: 500,
        messages: [
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();
    res.status(200).json({ reply: data.content[0]?.text || 'Nessuna risposta' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
}
