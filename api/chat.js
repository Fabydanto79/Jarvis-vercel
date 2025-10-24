// Vercel Serverless Function per Groq con Memoria
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Controlla che la API key sia configurata
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    // Prepara i messaggi per Groq
    // Include la cronologia completa per mantenere il contesto
    const messages = [
      {
        role: 'system',
        content: 'Sei Jarvis, un assistente AI intelligente, creativo e professionale. Rispondi sempre in italiano in modo chiaro, conciso e amichevole. Ricorda le informazioni delle conversazioni precedenti e fai riferimento ad esse quando rilevante.',
      },
      ...(history || []) // Include tutta la cronologia
    ];

    console.log('Sending to Groq with history length:', history?.length || 0);

    // Chiamata all'API di Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      return res.status(500).json({ 
        error: 'Errore nella chiamata API',
        details: errorText 
      });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      error: 'Errore del server',
      message: error.message 
    });
  }
}


