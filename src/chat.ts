import WebSocket from 'ws';
import readline from 'readline';

const ws = new WebSocket('ws://localhost:8080');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Connecting to Gateway...');

ws.on('open', () => {
  console.log('✅ Connected! Type a message and press Enter:');
  process.stdout.write('> ');
});

ws.on('message', (data) => {
  // 把光标移到行首，打印回复，再恢复提示符
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  console.log(`📥 Gateway: ${data.toString()}`);
  process.stdout.write('> ');
});

rl.on('line', (input) => {
  if (input.trim()) {
    ws.send(input);
  }
  process.stdout.write('> ');
});
