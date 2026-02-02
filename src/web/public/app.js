const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const socketUrl = `${protocol}//${window.location.host}`;
let ws = null;
const statusEl = document.getElementById('connection-status');
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

function connect() {
    ws = new WebSocket(socketUrl);

    ws.onopen = () => {
        statusEl.className = 'connected';
        statusEl.innerText = '● Connected';
        console.log('Connected to OpenClaw');
        appendMessage('Connected to server.', 'system');
    };

    ws.onmessage = (event) => {
        // Handle incoming messages (expecting JSON or plain text)
        // Format: { type: 'message', content: '...' }
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'message') {
                appendMessage(data.content, 'bot');
            } else if (data.type === 'system') {
                appendMessage(data.content, 'system');
            } else {
                appendMessage(JSON.stringify(data), 'bot');
            }
        } catch (e) {
            // Fallback for plain text
            appendMessage(event.data, 'bot');
        }
    };

    ws.onclose = () => {
        statusEl.className = 'disconnected';
        statusEl.innerText = '● Disconnected';
        console.log('Disconnected from OpenClaw');
        appendMessage('Connection lost. Reconnecting in 3s...', 'system');
        setTimeout(connect, 3000); // Auto reconnect
    };

    ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
    };
}

function appendMessage(text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.innerText = text;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
        // Format: { type: 'message', content: '...' } for standardized communication
        const payload = JSON.stringify({ type: 'message', content: text });
        ws.send(payload);
        appendMessage(text, 'user');
        messageInput.value = '';
    } else {
        alert('Not connected to server!');
    }
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Start connection
connect();
