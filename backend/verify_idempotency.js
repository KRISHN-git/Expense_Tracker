
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_URL = 'http://localhost:5000/expenses';

async function testIdempotency() {
    const idempotencyKey = uuidv4();
    const expenseData = {
        amount: 5000, // ₹50.00
        category: 'Test',
        description: 'Idempotency Test',
        date: new Date().toISOString()
    };

    console.log(`Testing Idempotency with Key: ${idempotencyKey}`);

    try {
        // First Request
        console.log('Sending First Request...');
        const res1 = await axios.post(API_URL, expenseData, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
        console.log(`First Request Status: ${res1.status}, ID: ${res1.data._id}`);

        // Second Request (Duplicate)
        console.log('Sending Second Request (Duplicate)...');
        const res2 = await axios.post(API_URL, expenseData, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
        console.log(`Second Request Status: ${res2.status}, ID: ${res2.data._id}`);

        if (res1.data._id === res2.data._id) {
            console.log('✅ PASSED: Both requests returned the same Expense ID.');
        } else {
            console.error('❌ FAILED: Duplicate requests created different IDs.');
        }

    } catch (err) {
        console.error('Test Failed:', err.message);
        if (err.response) {
            console.error('Response:', err.response.data);
        }
    }
}

testIdempotency();
