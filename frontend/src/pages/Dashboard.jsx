
import React, { useState, useEffect } from 'react'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseList from '../components/ExpenseList'
import { getExpenses, deleteExpense } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { LogOut, PieChart } from 'lucide-react'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, formatISO } from 'date-fns';
import ConfirmModal from '../components/ConfirmModal';

function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('date_desc');
    const [dateFilter, setDateFilter] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const { user, logout } = useAuth();

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const params = { excludePlans: true }; // Exclude plan transactions
            if (categoryFilter) params.category = categoryFilter;

            // Handle Date Filter
            if (dateFilter) {
                const now = new Date();
                let start, end;

                if (dateFilter === 'today') {
                    start = startOfDay(now);
                    end = endOfDay(now);
                } else if (dateFilter === 'week') {
                    start = startOfWeek(now);
                    end = endOfWeek(now);
                } else if (dateFilter === 'month') {
                    start = startOfMonth(now);
                    end = endOfMonth(now);
                }

                if (start && end) {
                    params.startDate = start.toISOString();
                    params.endDate = end.toISOString();
                }
            }

            // Handle sort
            params.sort = sortOrder;

            const data = await getExpenses(params);

            // Robust Client-Side Filtering (in case backend is stale)
            let processedData = data.filter(exp => !exp.plan);

            // Robust Client-Side Sorting
            processedData.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);

                if (sortOrder === 'date_desc') {
                    // Newest First: If dates are same, use createdAt
                    if (dateA.getTime() === dateB.getTime()) {
                        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                    }
                    return dateB - dateA;
                } else if (sortOrder === 'date_asc') {
                    // Oldest First
                    if (dateA.getTime() === dateB.getTime()) {
                        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                    }
                    return dateA - dateB;
                } else if (sortOrder === 'amount_desc') {
                    return b.amount - a.amount;
                } else if (sortOrder === 'amount_asc') {
                    return a.amount - b.amount;
                }
                return 0;
            });

            setExpenses(processedData);
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
        // If the expense belongs to a plan, do not add it to the dashboard list
        if (newExpense.plan) return;

        setExpenses(prev => {
            const updated = [newExpense, ...prev];
            // Re-sort on add to ensure order is maintained
            return updated.sort((a, b) => {
                // Keep consistent with main sort logic (assuming date_desc for new items usually)
                // Or just prepend if we assume it's "Newest"? 
                // Better to prepend and let the user re-sort if they change filter.
                // But for "Newest First" (default), prepending is usually correct.
                // However, if the user added a backdated expense, it should be placed correctly.

                // For simplicity/UX, usually prepending is fine for "Just Added", 
                // but strictly we should re-sort if we want "Newest First" to be true by date.
                // Let's just prepend for now as it gives better immediate feedback "I just added this".
                return updated;
            });
            return [newExpense, ...prev];
        });
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
            // You might want to show a toast here in a real app
            alert('Failed to delete expense');
        } finally {
            setIsDeleteModalOpen(false);
            setExpenseToDelete(null);
        }
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
                            onDelete={handleDeleteExpense}
                        />
                    </div>
                </div>
            </div>
            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Expense?"
                message="Are you sure you want to delete this expense? This action cannot be undone."
                confirmText="Delete Expense"
                isDestructive={true}
            />
        </div>
    );
};

export default Dashboard
