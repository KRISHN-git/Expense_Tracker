
import axios from 'axios';

const API_URL = 'https://expense-tracker-pi-swart-90.vercel.app/expenses';

const api = axios.create({
    baseURL: API_URL,
});

export const getExpenses = async (params) => {
    const response = await api.get('/', { params });
    return response.data;
};

export const createExpense = async (expenseData, idempotencyKey) => {
    const config = {
        headers: {
            'Idempotency-Key': idempotencyKey,
        },
    };
    const response = await api.post('/', expenseData, config);
    return response.data;
};

export default api;
