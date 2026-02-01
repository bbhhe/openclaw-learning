import WebSocket from 'ws';

function createClient(id: number, message: string) {
    return new Promise<void>((resolve) => {
        const ws = new WebSocket('ws://localhost:8080');
        
        ws.on('open', () => {
            console.log(`[Client ${id}] Connected`);
            // Wait a bit to ensure server registers it
            setTimeout(() => {
                console.log(`[Client ${id}] Sending: ${message}`);
                ws.send(message);
            }, 500);
        });

        ws.on('message', (data) => {
            console.log(`[Client ${id}] Received: ${data.toString()}`);
            if (data.toString().includes('AI:')) {
                ws.close();
                resolve();
            }
        });
        
        ws.on('error', (err) => console.error(`[Client ${id}] Error:`, err));
    });
}

async function run() {
    console.log("--- Test 1: First Connection ---");
    await createClient(1, "My name is Binbin.");
    
    console.log("\n--- Test 2: Second Connection (Should remember name) ---");
    // Connect again. If session is shared, context should be preserved.
    // We send a new message to trigger a response that (hopefully) uses context.
    // Note: The simple router might not be smart enough to answer "Who am I?" without a real LLM,
    // but we can check server logs for "Resuming existing Main Session".
    await createClient(2, "Hello again!");
}

run();
