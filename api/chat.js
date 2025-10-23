require('dotenv').config();
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request received:', req.body);

    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'message missing' });
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    const payload = {
      model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: message
        }
      ],
      system: 'Sei Jarvis, un assistente creativo e professionale che risponde in italiano.'
    };

    console.log('Calling Anthropic API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('Anthropic response status:', response.status);
    console.log('Anthropic response:', responseText);

    if (!response.ok) {
      return res.status(502).json({ 
        error: 'Anthropic API error', 
        detail: responseText,
        status: response.status 
      });
    }

    const data = JSON.parse(responseText);
    const reply = data.content && data.content[0] ? data.content[0].text : 'Nessuna risposta';
    
    console.log('Sending reply:', reply);
    res.status(200).json({ reply });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};
