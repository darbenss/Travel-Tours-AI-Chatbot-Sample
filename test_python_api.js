// Native fetch is available in Node 18+

async function test() {
    console.log("Testing Python API...");
    const payload = {
        message: "Tes API dari Node.js",
        thread_id: "test-thread-1"
    };

    try {
        // Fetch is available globally in Node 18+
        const response = await fetch("http://127.0.0.1:8000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        console.log("Status:", response.status);
        if (!response.ok) {
            console.log("Error Text:", await response.text());
        } else {
            console.log("Success!");
            const data = await response.json();
            console.log("Response:", data);
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

test();
