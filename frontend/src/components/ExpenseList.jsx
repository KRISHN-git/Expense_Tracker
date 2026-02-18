
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
            {/* Summary Grid */}
            {!loading && !error && expenses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                    {/* Total Card */}
                    <div className="bg-blue-500 rounded-2xl p-5 text-white shadow-lg flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-white/20 transition-all"></div>
                        <div>
                            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Total Spending</p>
                            <h3 className="text-3xl font-black">₹{(totalAmount / 100).toFixed(2)}</h3>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-blue-50 text-sm font-medium">
                            <span className="bg-white/20 px-2 py-1 rounded-md text-xs font-bold text-white">{expenses.length}</span>
                            <span>Transactions</span>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col gap-3">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Category Breakdown</p>
                        <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 items-center h-full">
                            {Object.entries(categorySummary).map(([cat, amount]) => {
                                const config = getCategoryConfig(cat);
                                const Icon = config?.icon || Wallet;
                                return (
                                    <div key={cat} className="flex flex-col items-center justify-center gap-1 min-w-[100px] p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-default group">
                                        <div className={`p-2 rounded-full ${config?.bg || 'bg-gray-200'} ${config?.color || 'text-gray-600'} group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 mt-1">{cat}</span>
                                        <span className="text-sm font-black text-gray-900">₹{(amount / 100).toFixed(0)}</span>
                                    </div>
                                );
                            })}
                        </div>
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
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold border ${catConfig?.bg || 'bg-gray-100'} ${catConfig?.color || 'text-gray-700'} border-black/5`}>
                                                    {catConfig?.icon && <catConfig.icon className="w-3.5 h-3.5" />}
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
