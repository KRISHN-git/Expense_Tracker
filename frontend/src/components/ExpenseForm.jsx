
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    New Expense
                </h2>
            </div>

            <div className="p-6">
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6 text-sm">
                        {Array.isArray(error) ? error.join(', ') : error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r mb-6 text-sm animate-fade-in">
                        Expense added successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                placeholder="0.00"
                                className="block w-full rounded-md border-gray-300 pl-7 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border"
                            >
                                <option value="">Select...</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="block w-full rounded-md border-gray-300 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="What was this for?"
                            className="block w-full rounded-md border-gray-300 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all",
                            loading && "opacity-75 cursor-not-allowed"
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Adding...
                            </>
                        ) : 'Add Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ExpenseForm;
