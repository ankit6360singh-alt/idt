import fetch from 'node-fetch';

const testData = {
    destination: "Paris",
    days: 3,
    budget: 50000,
    travelerType: "solo",
    preferences: "adventure"
};

async function test() {
    try {
        const response = await fetch('http://localhost:5000/api/trip/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Response:', text);

        if (response.status === 500) {
            const json = JSON.parse(text);
            console.log('\n=== ERROR DETAILS ===');
            console.log('Error:', json.error);
            console.log('Details:', json.details);
            if (json.stack) {
                console.log('Stack:', json.stack);
            }
        }
    } catch (err) {
        console.error('Request failed:', err);
    }
}

test();
