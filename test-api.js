const testData = {
    destination: "Paris",
    days: 3,
    budget: 50000,
    travelerType: "solo",
    preferences: "adventure"
};

fetch('http://localhost:5000/api/trip/generate', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
})
    .then(response => {
        console.log('Status:', response.status);
        return response.text();
    })
    .then(data => {
        console.log('Response:', data);
        try {
            const json = JSON.parse(data);
            console.log('Parsed JSON:', json);
        } catch (e) {
            console.log('Not JSON:', data);
        }
    })
    .catch(err => {
        console.error('Error:', err);
    });
