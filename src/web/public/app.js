const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const socketUrl = `${protocol}//${window.location.host}`;
let ws = null;
const statusEl = document.getElementById('connection-status');
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const previewArea = document.getElementById('preview-area');
const clearImageBtn = document.getElementById('clear-image');

let currentImageBase64 = null;

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
    msgDiv.innerText = text; 
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return msgDiv; 
}

function appendImage(base64, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    const img = document.createElement('img');
    img.src = base64;
    img.style.maxWidth = "100%";
    img.style.borderRadius = "8px";
    msgDiv.appendChild(img);
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text && !currentImageBase64) return;

    // 1. Add User Message to UI
    if (currentImageBase64) appendImage(currentImageBase64, 'user');
    if (text) appendMessage(text, 'user');
    
    // 2. Construct Payload
    const payload = { 
        type: 'message', 
        content: text,
        images: currentImageBase64 ? [currentImageBase64] : []
    };

    // 3. Send via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
    } else {
        appendMessage("Error: WebSocket not connected", 'system');
    }

    // 4. Cleanup
    messageInput.value = '';
    clearImage();
}

// Image Handling
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImageBase64 = e.target.result;
            imagePreview.src = currentImageBase64;
            previewArea.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

function clearImage() {
    currentImageBase64 = null;
    imageUpload.value = '';
    previewArea.style.display = 'none';
}
clearImageBtn.addEventListener('click', clearImage);

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Start WS
connect();
