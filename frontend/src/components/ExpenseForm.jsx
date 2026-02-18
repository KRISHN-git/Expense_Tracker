
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createExpense } from '../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CATEGORIES } from '../utils/constants';
import { PlusCircle, Loader2 } from 'lucide-react';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const ExpenseForm = ({ onExpenseAdded }) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [idempotencyKey, setIdempotencyKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setIdempotencyKey(uuidv4());
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const amountInPaise = Math.round(parseFloat(amount) * 100);

        if (amountInPaise <= 0) {
            setError("Amount must be positive.");
            setLoading(false);
            return;
        }

        try {
            const newExpense = await createExpense({
                amount: amountInPaise,
                category,
                description,
                date
            }, idempotencyKey);

            setSuccess(true);
            onExpenseAdded(newExpense);

            setAmount('');
            setCategory('');
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]);
            setIdempotencyKey(uuidv4());

            setTimeout(() => setSuccess(false), 3000);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to add expense. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <PlusCircle className="w-6 h-6 text-indigo-600" />
                    New Expense
                </h2>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
                        {Array.isArray(error) ? error.join(', ') : error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium border border-green-100 animate-fade-in">
                        Expense added successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Amount</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <span className="text-gray-500 text-xl font-semibold">₹</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                placeholder="0.00"
                                className="block w-full rounded-xl pl-10 pr-4 py-3 text-xl font-semibold text-gray-900 border-2 border-gray-300 focus:border-indigo-600 focus:ring-0 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="block w-full rounded-xl py-3 px-4 text-lg font-medium text-gray-900 border-2 border-gray-300 focus:border-indigo-600 focus:ring-0 transition-colors"
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="block w-full rounded-xl py-3 px-4 text-lg font-medium text-gray-900 border-2 border-gray-300 focus:border-indigo-600 focus:ring-0 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="What was this for?"
                            className="block w-full rounded-xl py-3 px-4 text-lg font-medium text-gray-900 border-2 border-gray-300 focus:border-indigo-600 focus:ring-0 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.01] active:scale-[0.98] mt-4",
                            loading && "opacity-75 cursor-not-allowed transform-none"
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Adding...
                            </>
                        ) : 'ADD EXPENSE'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ExpenseForm;
