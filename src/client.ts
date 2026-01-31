import WebSocket from 'ws';
import readline from 'readline';

// 连接 Gateway
const ws = new WebSocket('ws://localhost:8080');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

ws.on('open', () => {
    console.log("✅ Connected to Gateway!");
    console.log("Type something to chat with the AI Router...");
    ask();
});

ws.on('message', (data) => {
    console.log(`\n${data.toString()}\n`);
    ask(); // 收到回复后，允许再次输入
});

function ask() {
    rl.question('> ', (input) => {
        ws.send(input);
    });
}
