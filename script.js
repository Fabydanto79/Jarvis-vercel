const chatContainer = document.getElementById("chat-container");
const input = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");

async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  appendMessage("Tu", message, "user");
  input.value = "";

  appendTyping("Jarvis sta scrivendo...");
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    removeTyping();

    if (!response.ok) {
      const error = await response.text();
      appendMessage("Jarvis", "Errore: " + error, "assistant");
      return;
    }

    const data = await response.json();
    typeEffect("Jarvis", data.reply, "assistant");
  } catch (err) {
    removeTyping();
    appendMessage("Jarvis", "Errore di connessione: " + err.message, "assistant");
  }
}

function appendMessage(sender, text, className) {
  const div = document.createElement("div");
  div.className = `message ${className}`;
  div.textContent = `${sender}: ${text}`;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendTyping(text) {
  const div = document.createElement("div");
  div.id = "typing";
  div.className = "message typing";
  div.textContent = text;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTyping() {
  const typingDiv = document.getElementById("typing");
  if (typingDiv) typingDiv.remove();
}

function typeEffect(sender, text, className, delay = 25) {
  const div = document.createElement("div");
  div.className = `message ${className}`;
  chatContainer.appendChild(div);

  let i = 0;
  function type() {
    if (i < text.length) {
      div.textContent = `${sender}: ${text.slice(0, i + 1)}`;
      i++;
      chatContainer.scrollTop = chatContainer.scrollHeight;
      setTimeout(type, delay);
    }
  }
  type();
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
