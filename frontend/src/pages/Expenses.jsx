import React, { useState, useEffect } from 'react';
import { getExpenses, deleteExpense } from '../services/api';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';
import ConfirmModal from '../components/ConfirmModal';
import { Plus } from 'lucide-react';

function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('date_desc');
    const [dateFilter, setDateFilter] = useState('');
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const data = await getExpenses({ excludePlans: true, sort: sortOrder, category: categoryFilter, dateFilter });
            setExpenses(data.filter(exp => !exp.plan));
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

    return (
        <div className="flex flex-col gap-6 animate-fade-in-up pb-10 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">All Expenses</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage all your personal transaction records.</p>
                </div>
                <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-[12px] font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30"
                >
                    <Plus className="w-5 h-5" />
                    New Expense
                </button>
            </div>

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

            {/* Expense Form Modal */}
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

export default Expenses;
