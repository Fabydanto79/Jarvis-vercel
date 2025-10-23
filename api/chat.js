require('dotenv').config();
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'message missing' });
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
      system: 'You are Jarvis, an assistant that is creative and professional.'
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Anthropic API error:', text);
      return res.status(502).json({ error: 'Anthropic API error', detail: text });
    }

    const data = await response.json();
    const reply = data.content[0].text;
    res.status(200).json({ reply });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
};
