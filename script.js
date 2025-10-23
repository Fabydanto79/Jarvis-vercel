const messagesEl = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');

function appendMessage(text, cls='bot'){
  const div = document.createElement('div');
  div.className = 'msg ' + cls;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if(!text) return;
  appendMessage(text, 'user');
  input.value = '';
  appendMessage('...', 'bot');
  const last = messagesEl.querySelector('.msg.bot:last-child');
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    last.textContent = data.reply || '[nessuna risposta]';
  } catch (err) {
    last.textContent = 'Errore: ' + err.message;
  }
});