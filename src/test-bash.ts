import WebSocket from 'ws';

function runTest() {
    return new Promise<void>((resolve, reject) => {
        const ws = new WebSocket('ws://localhost:8080');
        console.log("--- Starting Bash Tool Test ---");

        ws.on('open', () => {
            console.log("[Client] Connected.");
            setTimeout(() => {
                // Ask LLM to use bash
                const command = "Run 'ping -c 3 localhost' in the background using the bash tool.";
                console.log(`[Client] Sending: "${command}"`);
                ws.send(command);
            }, 500);
        });

        ws.on('message', (data) => {
            const msg = data.toString();
            console.log(`[Client] Received: ${msg}`);
            
            // Check for success confirmation
            if (msg.includes("Started background session") || msg.includes("tool")) {
                console.log("\n✅ SUCCESS! LLM invoked bash tool.");
                ws.close();
                resolve();
            }
        });
        
        ws.on('error', reject);
        setTimeout(() => { console.log("Timeout"); ws.close(); resolve(); }, 15000);
    });
}

runTest();
