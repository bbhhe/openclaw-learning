import WebSocket from 'ws';

function runTest() {
    return new Promise<void>((resolve, reject) => {
        const ws = new WebSocket('ws://localhost:8080');
        
        console.log("--- Starting Cron Test ---");

        ws.on('open', () => {
            console.log("[Client] Connected.");
            // Wait for connection to settle
            setTimeout(() => {
                const command = "Remind me to 'Check Code' in 3 seconds.";
                console.log(`[Client] Sending: "${command}"`);
                ws.send(command);
            }, 500);
        });

        ws.on('message', (data) => {
            const msg = data.toString();
            console.log(`[Client] Received: ${msg}`);

            // Check for the Scheduler Trigger message
            if (msg.includes("⏰ SYSTEM REMINDER") && msg.includes("Check Code")) {
                console.log("\n✅ SUCCESS! Received the scheduled reminder.");
                ws.close();
                resolve();
            }
        });
        
        ws.on('error', (err) => {
            console.error("[Client] Error:", err);
            reject(err);
        });

        // Timeout if nothing happens
        setTimeout(() => {
            console.log("❌ Test Timed Out (Did not receive reminder)");
            ws.close();
            resolve(); // Resolve anyway to cleanup
        }, 10000);
    });
}

runTest();
