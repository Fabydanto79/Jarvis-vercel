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
      model: process.env.CLAUDE_MODEL || 'claude-3-haiku',
      prompt: `You are Jarvis, an assistant that is creative and professional.\n\nHuman: ${message}\n\nAssistant:`,
      max_tokens_to_sample: 400
    };

    const response = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': process.env.ANTHROPIC_API_VERSION || '2024-11-08'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: 'Anthropic API error', detail: text });
    }

    const data = await response.json();
    res.status(200).json({ reply: data.completion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
