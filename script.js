const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

let isTyping = false;

function addMessage(content, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
  messageDiv.textContent = content;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message typing';
  typingDiv.id = 'typing-indicator';
  typingDiv.textContent = 'Jarvis sta scrivendo...';
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
  const typingDiv = document.getElementById('typing-indicator');
  if (typingDiv) {
    typingDiv.remove();
  }
}

async function sendMessage() {
  const message = messageInput.value.trim();
  
  if (!message || isTyping) return;
  
  // Mostra messaggio utente
  addMessage(message, true);
  messageInput.value = '';
  
  // Disabilita input
  isTyping = true;
  sendBtn.disabled = true;
  messageInput.disabled = true;
  
  showTyping();
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    hideTyping();
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Errore ${response.status}`);
    }
    
    const data = await response.json();
    addMessage(data.reply);
    
  } catch (error) {
    hideTyping();
    addMessage(`❌ Errore: ${error.message}`);
    console.error('Errore:', error);
  } finally {
    isTyping = false;
    sendBtn.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
  }
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Messaggio di benvenuto
addMessage('👋 Ciao! Sono Jarvis, il tuo assistente AI. Come posso aiutarti?');
