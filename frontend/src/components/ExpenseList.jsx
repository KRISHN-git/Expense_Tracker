import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { CATEGORIES, getCategoryConfig } from '../utils/constants';
import { Wallet, Trash2 } from 'lucide-react';

const ExpenseList = ({
    expenses,
    loading,
    error,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
    dateFilter,
    setDateFilter,
    onDelete,
    hideTotal = false
}) => {

    const totalAmount = expenses
        .filter(exp => !(exp.type === 'income' || ['Salary', 'Income', 'Investment'].includes(exp.category)))
        .reduce((sum, expense) => sum + expense.amount, 0);

    const categorySummary = useMemo(() => {
        const summary = {};
        expenses
            .filter(exp => !(exp.type === 'income' || ['Salary', 'Income', 'Investment'].includes(exp.category)))
            .forEach(exp => {
                if (!summary[exp.category]) summary[exp.category] = 0;
                summary[exp.category] += exp.amount;
            });
        return summary;
    }, [expenses]);

    return (
        <div className="flex flex-col h-full gap-6 font-sans">
            {/* Summary Grid */}
            {!loading && !error && expenses.length > 0 && (
                <div className={`grid grid-cols-1 ${hideTotal ? '' : 'md:grid-cols-3'} gap-6 shrink-0`}>
                    {/* Total Card */}
                    {!hideTotal && (
                        <div className="bg-[#4d73b8] rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                            <div className="relative z-10">
                                <p className="text-blue-50/90 text-sm font-medium mb-1">Total Found</p>
                                <h3 className="text-3xl font-bold mb-4">₹{(totalAmount / 100).toLocaleString()}</h3>
                                <div className="flex items-center gap-1 text-xs text-white/90 bg-white/20 w-fit px-2 py-1 rounded-md">
                                    {expenses.length} Transactions
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Category Breakdown */}
                    <div className={`${hideTotal ? 'w-full' : 'md:col-span-2'} bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm flex flex-col gap-4 transition-colors duration-300`}>
                        <p className="font-bold text-slate-800 dark:text-white">Category Breakdown</p>
                        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2 items-center h-full">
                            {Object.entries(categorySummary).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
                                const config = getCategoryConfig(cat);
                                const Icon = config?.icon || Wallet;
                                return (
                                    <div key={cat} className="flex flex-col items-center justify-center gap-2 min-w-[110px] p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-default group">
                                        <div className={`p-2.5 rounded-full ${config?.bg || 'bg-slate-200 dark:bg-slate-800'} ${config?.color || 'text-slate-600 dark:text-slate-400'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">{cat}</span>
                                            <span className="block text-sm font-bold text-slate-800 dark:text-white">₹{(amount / 100).toLocaleString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col flex-1 overflow-hidden transition-colors duration-300">
                {/* Controls */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 bg-slate-50/50 dark:bg-slate-900/20 shrink-0 items-center">
                    <div className="flex-1 min-w-[150px]">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full text-sm font-medium rounded-lg border-slate-200 dark:border-slate-600 py-2.5 pl-3 pr-8 focus:border-[#4d73b8] focus:ring-[#4d73b8] shadow-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[150px] relative">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full text-sm font-medium rounded-lg border-slate-200 dark:border-slate-600 py-2.5 pl-3 pr-8 focus:border-[#4d73b8] focus:ring-[#4d73b8] shadow-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        >
                            <option value="">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full text-sm font-medium rounded-lg border-slate-200 dark:border-slate-600 py-2.5 pl-3 pr-8 focus:border-[#4d73b8] focus:ring-[#4d73b8] shadow-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        >
                            <option value="date_desc">Newest First</option>
                            <option value="date_asc">Oldest First</option>
                        </select>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-[#4d73b8]"></div>
                            <p className="text-sm font-medium">Loading transactions...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500 dark:text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 gap-4">
                            <Wallet className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            <p className="text-sm font-medium">No transactions found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left relative">
                            <thead className="text-xs text-slate-400 uppercase bg-transparent border-b border-slate-100 dark:border-slate-800 tracking-wider sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <tr>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 font-semibold text-right uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense) => {
                                    const { icon: Icon, color: colorClass, bg: bgClass } = getCategoryConfig(expense.category);
                                    const isIncome = expense.type === 'income' || ['Salary', 'Income', 'Investment'].includes(expense.category);

                                    return (
                                        <tr key={expense._id || expense.idempotencyKey} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer relative">
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap hidden md:table-cell">
                                                {expense.date ? format(new Date(expense.date), 'MMM dd, yyyy') : '-'}
                                                <div className="md:hidden text-xs text-slate-400 mt-1">{expense.date ? format(new Date(expense.date), 'MMM dd, yyyy') : '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 table-cell md:hidden">
                                                <div className="flex flex-col">
                                                    <p className="text-slate-700 dark:text-slate-200 font-semibold mb-1 truncate max-w-[150px]">{expense.description || 'Unknown'}</p>
                                                    <div className="text-xs text-slate-400">{expense.date ? format(new Date(expense.date), 'MMM dd') : '-'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${bgClass} ${colorClass}`}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {expense.category}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium hidden md:table-cell">
                                                <div className="truncate max-w-[250px]">{expense.description || 'Unknown'}</div>
                                            </td>
                                            <td className={`px-6 py-4 text-right ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="flex flex-col items-end font-bold">
                                                        <span className="block md:hidden mb-1 text-xs">
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-normal ${bgClass} ${colorClass}`}>
                                                                <Icon className="w-3 h-3" />
                                                                {expense.category}
                                                            </div>
                                                        </span>
                                                        <span>{isIncome ? '+' : ''}₹{(expense.amount / 100).toLocaleString()}</span>
                                                    </div>
                                                    {onDelete && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onDelete(expense._id); }}
                                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
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
