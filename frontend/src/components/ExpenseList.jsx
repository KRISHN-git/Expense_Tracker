
import React from 'react';
import { format } from 'date-fns';
import { CATEGORIES, getCategoryConfig } from '../utils/constants';
import { ArrowUpDown, Filter, Wallet } from 'lucide-react';

const ExpenseList = ({ expenses, loading, error, categoryFilter, setCategoryFilter, sortOrder, setSortOrder }) => {

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Transactions</h2>
                </div>

                <div className="flex gap-2 flex-wrap justify-end">
                    <div className="relative">
                        <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-lg border-gray-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white shadow-sm transition-all hover:border-gray-300"
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => setSortOrder(prev => prev === 'date_desc' ? 'created_desc' : 'date_desc')}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white text-sm font-medium text-gray-700 shadow-sm transition-all"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        {sortOrder === 'date_desc' ? 'By Date' : 'By Created'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 min-h-[300px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p>Loading transactions...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500 bg-red-50 m-6 rounded-lg border border-red-100">
                        {error}
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 min-h-[300px]">
                        <Wallet className="w-12 h-12 text-gray-200" />
                        <p>No transactions found. Add one to get started!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/80 sticky top-0 backdrop-blur-sm z-10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {expenses.map((expense) => {
                                    const catConfig = getCategoryConfig(expense.category);
                                    const Icon = catConfig?.icon || Wallet;

                                    return (
                                        <tr key={expense._id || expense.idempotencyKey} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                {expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${catConfig?.bg || 'bg-gray-100'} ${catConfig?.color || 'text-gray-700'}`}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:bg-white group-hover:shadow-lg group-hover:rounded group-hover:z-20 group-hover:absolute transition-all">
                                                {expense.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm font-bold text-gray-900">
                                                    ₹{(expense.amount / 100).toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center rounded-b-xl">
                <span className="text-sm text-gray-500 font-medium">{expenses.length} Transactions</span>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Total Spent</span>
                    <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        ₹{(totalAmount / 100).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ExpenseList;
