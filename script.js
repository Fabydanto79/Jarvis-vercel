const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const resetBtn = document.getElementById('reset-btn');
const messageCount = document.getElementById('message-count');

let isTyping = false;
let conversationHistory = []; // Memoria della conversazione

function addMessage(content, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
  messageDiv.textContent = content;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  updateMessageCount();
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

function updateMessageCount() {
  const userMessages = conversationHistory.filter(m => m.role === 'user').length;
  messageCount.textContent = `Messaggi: ${userMessages}`;
}

function resetConversation() {
  if (conversationHistory.length > 0) {
    const confirmed = confirm('Vuoi davvero iniziare una nuova conversazione? La cronologia attuale verrà cancellata.');
    if (!confirmed) return;
  }
  
  conversationHistory = [];
  chatMessages.innerHTML = '';
  addMessage('👋 Nuova conversazione iniziata! Come posso aiutarti?');
  updateMessageCount();
}

async function sendMessage() {
  const message = messageInput.value.trim();
  
  if (!message || isTyping) return;
  
  // Aggiungi messaggio utente alla cronologia
  conversationHistory.push({
    role: 'user',
    content: message
  });
  
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
      body: JSON.stringify({ 
        message,
        history: conversationHistory // Invia tutta la cronologia
      }),
    });
    
    hideTyping();
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Errore ${response.status}`);
    }
    
    const data = await response.json();
    
    // Aggiungi risposta assistente alla cronologia
    conversationHistory.push({
      role: 'assistant',
      content: data.reply
    });
    
    addMessage(data.reply);
    
  } catch (error) {
    hideTyping();
    addMessage(`❌ Errore: ${error.message}`);
    console.error('Errore:', error);
    // Rimuovi l'ultimo messaggio utente dalla cronologia in caso di errore
    conversationHistory.pop();
  } finally {
    isTyping = false;
    sendBtn.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
  }
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
resetBtn.addEventListener('click', resetConversation);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Messaggio di benvenuto
addMessage('👋 Ciao! Sono Jarvis, il tuo assistente AI. Come posso aiutarti?');
updateMessageCount();
