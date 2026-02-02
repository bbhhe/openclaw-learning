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
            const data = JSON.parse(event.data);
            if (data.type === 'system') appendMessage(data.content, 'system');
        } catch (e) {}
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

    // 2. Create Bot Placeholder
    const botMsgDiv = appendMessage('...', 'bot');
    botMsgDiv.innerText = ''; // Clear placeholder
    let botText = "";

    try {
        // 3. Call SSE Endpoint
        const response = await fetch('/api/chat/sse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: conversationHistory })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6);
                    if (dataStr === '[DONE]') break;
                    try {
                        const json = JSON.parse(dataStr);
                        if (json.content) {
                            botText += json.content;
                            botMsgDiv.innerText = botText;
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                        }
                    } catch (e) {}
                }
            }
        }
        // 4. Update History
        conversationHistory.push({ role: 'assistant', content: botText });

    } catch (err) {
        botMsgDiv.innerText = `Error: ${err.message}`;
    }
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Start WS for system events only
connect();
