import React, { useState, useEffect, useMemo } from 'react';
import { getExpenses, deleteExpense } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Clock, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { format, subDays, startOfMonth, eachDayOfInterval, isSameDay, subMonths } from 'date-fns';
import ExpenseForm from '../components/ExpenseForm';
import ConfirmModal from '../components/ConfirmModal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getCategoryConfig, API_BASE_URL } from '../utils/constants';
import axios from 'axios';

function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const { user, setUser } = useAuth();

    const [plans, setPlans] = useState([]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const data = await getExpenses({ excludePlans: true, sort: 'date_desc' });
            setExpenses(data.filter(exp => !exp.plan));

            // Also fetch plans for the widget
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const plansData = await axios.get(`${API_BASE_URL}/plans`, config);
            setPlans(plansData.data);

            setError(null);
        } catch (err) {
            setError('Failed to fetch data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleExpenseAdded = (newExpense) => {
        if (newExpense.plan) return;
        setExpenses(prev => [newExpense, ...prev]);
        setIsExpenseModalOpen(false);
    };

    const handleDeleteExpense = (id) => {
        setExpenseToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!expenseToDelete) return;
        try {
            await deleteExpense(expenseToDelete);
            setExpenses(prev => prev.filter(exp => exp._id !== expenseToDelete));
        } catch (err) {
            console.error('Failed to delete expense:', err);
        } finally {
            setIsDeleteModalOpen(false);
            setExpenseToDelete(null);
        }
    };

    // Calculate Summaries
    const {
        totalExpenses,
        totalIncome,
        currentMonthExpenses,
        lastMonthExpenses,
        currentMonthIncome,
        lastMonthIncome,
        totalTransactions
    } = useMemo(() => {
        let expensesSum = 0;
        let incomeSum = 0;
        let cMonthExp = 0, lMonthExp = 0;
        let cMonthInc = 0, lMonthInc = 0;

        const now = new Date();
        const startOfCurMonth = startOfMonth(now);
        const startOfPrevMonth = startOfMonth(subMonths(now, 1));

        expenses.forEach(exp => {
            const expDate = new Date(exp.date);
            const isInc = exp.type === 'income' || ['Salary', 'Income', 'Investment'].includes(exp.category);

            if (isInc) {
                incomeSum += exp.amount;
                if (expDate >= startOfCurMonth) cMonthInc += exp.amount;
                else if (expDate >= startOfPrevMonth && expDate < startOfCurMonth) lMonthInc += exp.amount;
            } else {
                expensesSum += exp.amount;
                if (expDate >= startOfCurMonth) cMonthExp += exp.amount;
                else if (expDate >= startOfPrevMonth && expDate < startOfCurMonth) lMonthExp += exp.amount;
            }
        });
        return {
            totalExpenses: expensesSum / 100,
            totalIncome: incomeSum / 100,
            currentMonthExpenses: cMonthExp / 100,
            lastMonthExpenses: lMonthExp / 100,
            currentMonthIncome: cMonthInc / 100,
            lastMonthIncome: lMonthInc / 100,
            totalTransactions: expenses.length
        };
    }, [expenses]);

    const monthlyBudget = user?.monthlyBudget || 20000;
    const budgetUsedPercentage = Math.min(((currentMonthExpenses / monthlyBudget) * 100), 100).toFixed(0);

    // Dynamic percentages
    const expensesPercentChange = lastMonthExpenses === 0
        ? (currentMonthExpenses > 0 ? 100 : 0)
        : ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100);

    const incomePercentChange = lastMonthIncome === 0
        ? (currentMonthIncome > 0 ? 100 : 0)
        : ((currentMonthIncome - lastMonthIncome) / lastMonthIncome * 100);

    // Prepare Chart Data (Full Month Overview)
    const trendData = useMemo(() => {
        const end = new Date();
        const start = startOfMonth(end);
        const days = eachDayOfInterval({ start, end });

        return days.map(day => {
            const isInc = exp => exp.type === 'income' || ['Salary', 'Income', 'Investment'].includes(exp.category);
            const dailyExps = expenses.filter(exp => isSameDay(new Date(exp.date), day) && !isInc(exp));
            const dailyIncs = expenses.filter(exp => isSameDay(new Date(exp.date), day) && isInc(exp));
            return {
                date: format(day, 'MMM d'), // Oct 1, Oct 2...
                fullDate: format(day, 'EEE, MMM d, yyyy'),
                expenses: dailyExps.reduce((s, e) => s + e.amount, 0) / 100,
                income: dailyIncs.reduce((s, e) => s + e.amount, 0) / 100,
            };
        });
    }, [expenses]);

    const pieData = useMemo(() => {
        const summary = {};
        expenses.filter(e => !(e.type === 'income' || ['Salary', 'Income', 'Investment'].includes(e.category))).forEach(exp => {
            summary[exp.category] = (summary[exp.category] || 0) + exp.amount;
        });
        return Object.entries(summary)
            .map(([name, value]) => ({ name, value: value / 100 }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 4); // Top 4 for donut
    }, [expenses]);

    const pieColors = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6'];

    return (
        <div className="flex flex-col gap-6 animate-fade-in-up pb-10">
            {/* Header Area */}
            <div className="sticky top-0 z-40 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 -mx-4 md:-mx-8 px-4 md:px-8 py-4 -mt-4 md:-mt-8 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        Hi, <span className="font-bold">{user?.name || 'User'}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex bg-white dark:bg-slate-800 px-4 py-2 rounded-xl items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {format(new Date(), 'hh:mm a')}
                    </div>
                    <button
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Add Expense
                    </button>
                </div>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Total Spending */}
                <div className="bg-gradient-to-br from-blue-900 to-slate-800 text-white rounded-2xl p-5 shadow-md relative overflow-hidden flex flex-col justify-between border border-blue-800/50">
                    <div className="relative z-10">
                        <h3 className="text-blue-100/90 font-medium mb-1">Total Spending</h3>
                        <p className="text-3xl font-bold mb-4">₹{totalExpenses.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-xs text-white/90 bg-white/20 w-fit px-2 py-1 rounded-md">
                            {expensesPercentChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            This Month {expensesPercentChange >= 0 ? '+' : ''}{expensesPercentChange.toFixed(1)}%
                        </div>
                    </div>
                    <div className="relative z-10 mt-3 text-xs opacity-80 font-medium">
                        Total {totalTransactions} Transactions
                    </div>
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                </div>

                {/* Card 2: Expenses */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-5 shadow-md relative overflow-hidden flex flex-col justify-between border border-blue-500/50">
                    <div className="relative z-10">
                        <h3 className="text-blue-100/90 font-medium mb-1">Expenses (This Month)</h3>
                        <p className="text-3xl font-bold mb-4">₹{currentMonthExpenses.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-xs text-white/90 bg-white/20 w-fit px-2 py-1 rounded-md">
                            <ArrowUpRight className="w-3 h-3" />
                            ₹{(lastMonthExpenses / 1000).toFixed(1)}K Last month
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                </div>

                {/* Card 3: Income */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl p-5 shadow-md relative overflow-hidden flex flex-col justify-between border border-indigo-400/50">
                    <div className="relative z-10">
                        <h3 className="text-indigo-50/90 font-medium mb-1">Income (This Month)</h3>
                        <p className="text-3xl font-bold mb-4">₹{currentMonthIncome.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-xs text-white/90 bg-white/20 w-fit px-2 py-1 rounded-md">
                            {incomePercentChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {incomePercentChange >= 0 ? '+' : ''}{incomePercentChange.toFixed(1)}% vs Last month
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                </div>

                {/* Card 4: Budget */}
                <div className="bg-gradient-to-br from-sky-400 to-sky-600 text-white rounded-2xl p-5 shadow-md relative overflow-hidden border border-sky-300/50">
                    <div className="relative z-10">
                        <h3 className="text-sky-50/90 font-medium mb-1">Budget Limit</h3>
                        <p className="text-3xl font-bold mb-4">₹{monthlyBudget.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-xs text-white/90 bg-white/20 w-fit px-2 py-1 rounded-md">
                            <ArrowUpRight className="w-3 h-3" />
                            {budgetUsedPercentage}% Used
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-white">This Month Overview</h3>
                        <div className="flex gap-2">
                            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 py-1 px-3 rounded text-medium">Income & Expenses</span>
                            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 py-1 px-3 rounded text-medium">Month-to-Date</span>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                                    itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                                    formatter={(value) => `₹${value.toLocaleString()}`}
                                    labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || ''}
                                />
                                <Area type="monotone" dataKey="expenses" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                                <Area type="monotone" dataKey="income" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white w-full text-left mb-4">Spending Overview</h3>
                    <div className="h-[200px] w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData.length ? pieData : [{ name: 'Empty', value: 1 }]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                    ))}
                                    {pieData.length === 0 && <Cell fill="#e2e8f0" />}
                                </Pie>
                                <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Optional Inner Text */}
                        <div className="absolute text-center flex flex-col items-center">
                            <span className="text-xs text-slate-400">Total Expenses</span>
                            <span className="font-bold text-slate-800 dark:text-white text-lg">₹{currentMonthExpenses.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-y-2 gap-x-1 mt-4">
                        {pieData.map((entry, idx) => (
                            <div key={entry.name} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[idx % pieColors.length] }}></div>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Transactions Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
                        <div className="flex gap-2">
                            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 py-1 px-3 rounded font-medium cursor-pointer">Last 30 Days ▾</span>
                            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 py-1 px-3 rounded font-medium cursor-pointer">Newest ▾</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-transparent border-b border-slate-100 dark:border-slate-800 tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 font-semibold rounded-l-lg">Date</th>
                                    <th className="px-4 py-3 font-semibold">Category</th>
                                    <th className="px-4 py-3 font-semibold">Description</th>
                                    <th className="px-4 py-3 font-semibold text-right rounded-r-lg">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-slate-500">Loading...</td>
                                    </tr>
                                )}
                                {!loading && expenses.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-slate-500">No recent transactions.</td>
                                    </tr>
                                )}
                                {expenses.slice(0, 5).map(exp => {
                                    const { icon: Icon, color: colorClass, bg: bgClass } = getCategoryConfig(exp.category);
                                    const isIncome = exp.type === 'income' || ['Salary', 'Income', 'Investment'].includes(exp.category);

                                    return (
                                        <tr key={exp._id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer relative">
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                {format(new Date(exp.date), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${bgClass} ${colorClass}`}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {exp.category}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                                                {exp.description || 'Unknown'}
                                            </td>
                                            <td className={`px-4 py-3 text-right ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="font-bold">{isIncome ? '+' : ''}₹{(exp.amount / 100).toLocaleString()}</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteExpense(exp._id); }}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Plans Widget */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-6">Recent Plans</h3>
                    <div className="space-y-4">
                        {plans.length === 0 ? (
                            <p className="text-sm text-slate-500">No active plans.</p>
                        ) : plans.slice(0, 2).map((plan, idx) => {
                            const saved = plan.totalSpent || 0;
                            const target = plan.totalBudget || 0;
                            const percent = target > 0 ? Math.min((saved / target) * 100, 100) : (saved > 0 ? 100 : 0);

                            const colors = ['bg-indigo-500', 'bg-blue-500'];
                            const isGroup = plan.type === 'group' || (plan.members && plan.members.length > 0);

                            return (
                                <div key={plan._id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{plan.title}</span>
                                        </div>
                                        <Link to={`/plans/${plan._id}`} className="text-xs bg-slate-600 hover:bg-slate-700 text-white px-2 py-1 rounded transition">
                                            View Plan
                                        </Link>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium">
                                        <span>₹{(saved / 100).toLocaleString()}</span>
                                        <span>/ {target > 0 ? `₹${(target / 100).toLocaleString()}` : 'No limit'}</span>
                                    </div>
                                    {target > 0 && (
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                            <div className={`h-full ${colors[idx % colors.length]}`} style={{ width: `${percent}%` }}></div>
                                        </div>
                                    )}
                                    {percent >= 100 && target > 0 && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-bold">
                                            <CheckCircle2 className="w-3 h-3" /> Goal Reached!
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Expense Form Modal (Inline via state) */}
            {isExpenseModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                            <h2 className="font-bold text-slate-800 dark:text-white">Add New Transaction</h2>
                            <button onClick={() => setIsExpenseModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-4 max-h-[80vh] overflow-y-auto">
                            <ExpenseForm onExpenseAdded={handleExpenseAdded} hideTitle={true} />
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Transaction"
                message="Are you sure you want to delete this specific record?"
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
}

export default Dashboard;
