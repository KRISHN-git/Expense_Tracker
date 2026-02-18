
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { CATEGORIES, getCategoryConfig } from '../utils/constants';
import { Wallet } from 'lucide-react';

const ExpenseList = ({
    expenses,
    loading,
    error,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
    dateFilter,
    setDateFilter
}) => {

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const categorySummary = useMemo(() => {
        const summary = {};
        expenses.forEach(exp => {
            if (!summary[exp.category]) summary[exp.category] = 0;
            summary[exp.category] += exp.amount;
        });
        return summary;
    }, [expenses]);

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Summary Bar */}
            {!loading && !error && expenses.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 shrink-0 flex items-center justify-between gap-6 overflow-hidden">
                    <div className="flex flex-col min-w-max">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Expenses</span>
                        <span className="text-3xl font-extrabold text-gray-900">₹{(totalAmount / 100).toFixed(2)}</span>
                    </div>
                    <div className="h-12 w-px bg-gray-200"></div>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide items-center py-2">
                        {Object.entries(categorySummary).map(([cat, amount]) => {
                            const config = getCategoryConfig(cat);
                            return (
                                <div key={cat} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 whitespace-nowrap shadow-sm">
                                    <div className={`w-3 h-3 rounded-full ${config?.color.replace('text-', 'bg-')}`}></div>
                                    <span className="text-sm font-semibold text-gray-700">{cat}</span>
                                    <span className="text-sm font-bold text-gray-900">₹{(amount / 100).toFixed(0)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col flex-1 overflow-hidden">
                {/* Controls */}
                <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 bg-gray-50/80 shrink-0 items-center">
                    <div className="flex-1 min-w-[150px]">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full text-sm font-semibold rounded-lg border-gray-300 py-2.5 pl-3 pr-8 focus:border-indigo-600 focus:ring-indigo-600 shadow-sm"
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[150px] relative">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full text-sm font-semibold rounded-lg border-gray-300 py-2.5 pl-3 pr-8 focus:border-indigo-600 focus:ring-indigo-600 shadow-sm"
                        />
                        {dateFilter && (
                            <button
                                onClick={() => setDateFilter('')}
                                className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-red-500 font-bold p-1"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full text-sm font-semibold rounded-lg border-gray-300 py-2.5 pl-3 pr-8 focus:border-indigo-600 focus:ring-indigo-600 shadow-sm"
                        >
                            <option value="date_desc">Newest First</option>
                            <option value="date_asc">Oldest First</option>
                            <option value="created_desc">Added Recently</option>
                        </select>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-indigo-600"></div>
                            <p className="text-base font-medium">Loading transactions...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-600 text-base font-medium">
                            {error}
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                            <Wallet className="w-12 h-12 text-gray-300" />
                            <p className="text-base font-medium">No transactions found.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-40">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-36">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {expenses.map((expense) => {
                                    const catConfig = getCategoryConfig(expense.category);

                                    return (
                                        <tr key={expense._id || expense.idempotencyKey} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold h-16">
                                                {expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold border ${catConfig?.bg || 'bg-gray-100'} ${catConfig?.color || 'text-gray-700'} border-black/5`}>
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-base text-gray-800 font-medium max-w-[250px] truncate group-hover:whitespace-normal group-hover:overflow-visible relative">
                                                {expense.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-lg font-bold text-gray-900">
                                                    ₹{(expense.amount / 100).toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseList;
