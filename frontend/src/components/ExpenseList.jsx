
import React, { useState, useEffect } from 'react';
import { getExpenses } from '../services/api';
import { format } from 'date-fns';

const ExpenseList = ({ refreshTrigger }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('date_desc'); // 'date_desc' or 'date_asc' (backend defaults to created_at desc if not spec, but we implemented sort=date_desc)

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const params = {};
            if (categoryFilter) params.category = categoryFilter;
            if (sortOrder === 'date_desc') params.sort = 'date_desc';

            const data = await getExpenses(params);
            setExpenses(data);
        } catch (err) {
            setError('Failed to fetch expenses.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [refreshTrigger, categoryFilter, sortOrder]);

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h2 className="text-xl font-bold mb-4 md:mb-0">Expenses</h2>
                <div className="flex gap-4">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    >
                        <option value="">All Categories</option>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Other">Other</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'date_desc' ? 'created_desc' : 'date_desc')}
                        className="px-4 py-2 border rounded-md hover:bg-gray-50 bg-gray-100 text-sm font-medium text-gray-700"
                    >
                        Sort: {sortOrder === 'date_desc' ? 'Date' : 'Created'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {expenses.map((expense) => (
                                    <tr key={expense._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(expense.date), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                            {/* Convert paise to Rupees */}
                                            ₹{(expense.amount / 100).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex justify-end items-center border-t pt-4">
                        <span className="text-lg font-bold text-gray-900">Total: ₹{(totalAmount / 100).toFixed(2)}</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default ExpenseList;
