const socket = io();
const messageContainer = document.querySelector('.messages');
const nameInput = document.querySelector('#name');
const messageInput = document.querySelector('#message');
const sendButton = document.querySelector('#send');

// Load previous messages
socket.on('previousMessages', (messages) => {
  messages.forEach((data) => {
    appendMessage(`${data.username}: ${data.message}`);
  });
});

// Listen for new chat messages
socket.on('chat message', (data) => {
  appendMessage(`${data.username}: ${data.message}`);
});

// Send message to the server
sendButton.addEventListener('click', () => {
  const username = nameInput.value;
  const message = messageInput.value;
  if (username && message) {
    socket.emit('chat message', { username, message });
    messageInput.value = '';
  }
});

// Append message to the chat window
function appendMessage(msg) {
  const messageElement = document.createElement('div');
  messageElement.textContent = msg;
  messageContainer.appendChild(messageElement);
}
