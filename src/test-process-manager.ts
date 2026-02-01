import { ProcessManager } from './process-manager';

async function test() {
    console.log("--- Testing Process Manager ---");
    const pm = new ProcessManager();

    // 1. Start a long-running process
    console.log("1. Starting 'ping -c 3 localhost'...");
    // Use bash -c to ensure shell interpretation works
    const id = pm.start("ping -c 3 localhost");
    console.log(`   Session ID: ${id}`);

    // 2. Wait for some output
    console.log("2. Waiting 1.5s for output...");
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 3. Check logs
    const log1 = pm.getLog(id);
    console.log(`   [Log Check 1] Output length: ${log1.length}`);
    if (log1.length > 0) {
        console.log("   ✅ Capture working. Preview:\n" + log1.split('\n').slice(0, 2).join('\n'));
    } else {
        console.error("   ❌ No output captured yet.");
    }

    // 4. Test List
    const list = pm.list();
    console.log("3. List processes:", list);
    if (list.find(p => p.id === id)) {
        console.log("   ✅ Process listed correctly.");
    } else {
        console.error("   ❌ Process missing from list.");
    }

    // 5. Wait for finish
    console.log("4. Waiting for process to finish...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const log2 = pm.getLog(id);
    if (log2.includes("exit")) {
        console.log("   ✅ Process exit detected.");
    }

    // 6. Kill (even if finished, to test safety)
    console.log("5. Killing process...");
    pm.kill(id);
    
    if (pm.list().length === 0) {
        console.log("   ✅ Kill/Cleanup successful.");
    } else {
        console.error("   ❌ Process still in list.");
    }
}

test();
