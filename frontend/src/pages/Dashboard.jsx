
import React, { useState, useEffect } from 'react'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseList from '../components/ExpenseList'
import { getExpenses } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { LogOut, PieChart, Calendar } from 'lucide-react'

function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('date_desc');
    const [dateFilter, setDateFilter] = useState('');
    const { user, logout } = useAuth();

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const params = {};
            if (categoryFilter) params.category = categoryFilter;
            if (dateFilter) params.date = dateFilter;

            // Handle sort
            params.sort = sortOrder;

            const data = await getExpenses(params);
            setExpenses(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch expenses.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [categoryFilter, sortOrder, dateFilter]);

    const handleExpenseAdded = (newExpense) => {
        setExpenses(prev => [newExpense, ...prev]);
    };

    return (
        <div className="min-h-screen lg:h-screen flex flex-col bg-slate-50 lg:overflow-hidden font-sans text-slate-800">
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm z-10 shrink-0 sticky top-0 lg:static">
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                            <PieChart className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                            ExpenseTracker
                        </h1>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-slate-600 hidden sm:block">
                        Hi, {user?.name || 'User'}
                    </div>
                    <Link to="/plans" className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors">
                        My Plans
                    </Link>
                    <button
                        onClick={logout}
                        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
                <div className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-full">
                    {/* Left Sidebar: Form */}
                    <div className="lg:col-span-4 h-auto lg:h-full lg:overflow-y-auto pr-1">
                        <ExpenseForm onExpenseAdded={handleExpenseAdded} />
                    </div>

                    {/* Right Content: List & Summary */}
                    <div className="lg:col-span-8 h-auto lg:h-full flex flex-col lg:overflow-hidden">
                        <ExpenseList
                            expenses={expenses}
                            loading={loading}
                            error={error}
                            categoryFilter={categoryFilter}
                            setCategoryFilter={setCategoryFilter}
                            sortOrder={sortOrder}
                            setSortOrder={setSortOrder}
                            dateFilter={dateFilter}
                            setDateFilter={setDateFilter}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard
