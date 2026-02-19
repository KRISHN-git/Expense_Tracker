import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Append /expenses strictly for the expenses service, OR just use base?
// The original code was: const API_URL = 'http://localhost:5000/expenses';
// But other files use /auth, /plans, etc. 
// This specific file `api.js` seems to be just for expenses based on `getExpenses`.
// So I will keep it pointing to /expenses base for THIS instance, but derived from constant.
const API_URL = `${API_BASE_URL}/expenses`;

const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const getExpenses = async (params) => {
    const response = await api.get('', { params });
    return response.data;
};

export const getBudgetAnalytics = async () => {
    const response = await api.get('/budget-analytics');
    return response.data;
};

export const createExpense = async (expenseData, idempotencyKey) => {
    const config = {
        headers: {
            'Idempotency-Key': idempotencyKey,
        },
    };
    const response = await api.post('', expenseData, config);
    return response.data;
};

export const deleteExpense = async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
};

// Generic API Client for other routes (since 'api' base is /expenses)
const client = axios.create({
    baseURL: API_BASE_URL,
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const updateProfile = async (userData) => {
    const response = await client.put('/auth/profile', userData);
    return response.data;
};

export const updatePlan = async (id, planData) => {
    const response = await client.put(`/plans/${id}`, planData);
    return response.data;
};

export const removePlanMember = async (id, memberName) => {
    const response = await client.put(`/plans/${id}/members/remove`, { memberName });
    return response.data;
};

export const addPlanMember = async (id, memberName) => {
    const response = await client.put(`/plans/${id}/members/add`, { memberName });
    return response.data;
};

export default api;
