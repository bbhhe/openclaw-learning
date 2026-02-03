const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const socketUrl = `${protocol}//${window.location.host}`;
let ws = null;
const statusEl = document.getElementById('connection-status');
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// Client-side history for SSE mode
let conversationHistory = [
    { role: 'system', content: 'You are a helpful AI assistant.' }
];

function connect() {
    ws = new WebSocket(socketUrl);
    ws.onopen = () => {
        statusEl.className = 'connected';
        statusEl.innerText = '● Connected (WS)';
        console.log('Connected to OpenClaw WS');
    };
    ws.onmessage = (event) => {
        try {
            console.log("Received WS message:", event.data);
            const data = JSON.parse(event.data);
            if (data.type === 'system') {
                appendMessage(data.content, 'system');
            } else if (data.type === 'message') {
                appendMessage(data.content, 'bot');
                conversationHistory.push({ role: 'assistant', content: data.content });
            }
        } catch (e) {
            console.error("Error processing WS message:", e);
        }
    };
    ws.onclose = () => {
        statusEl.className = 'disconnected';
        statusEl.innerText = '● Disconnected';
        setTimeout(connect, 3000);
    };
}

function appendMessage(text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    // Handle Markdown-like text (simple replacement for newlines)
    msgDiv.innerText = text; 
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return msgDiv; // Return element for streaming updates
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    // 1. Add User Message
    appendMessage(text, 'user');
    conversationHistory.push({ role: 'user', content: text });
    messageInput.value = '';

    // 2. Send via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'message', content: text }));
    } else {
        appendMessage("Error: WebSocket not connected", 'system');
    }
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Start WS for system events only
connect();
