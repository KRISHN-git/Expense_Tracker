import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ArrowLeft, MoreVertical, Wallet, Calendar, TrendingUp, Plus, Users, Trash2 } from 'lucide-react';
import { isSameDay, isSameWeek, isSameMonth } from 'date-fns';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';
import { cn } from '../utils/cn';
import { API_BASE_URL } from '../utils/constants';
import { useToast } from '../context/ToastContext'; // Import
import ConfirmModal from '../components/ConfirmModal'; // Import
import { updatePlan, removePlanMember, addPlanMember } from '../services/api'; // Import new API functions


/*
  Improved PlanDetail Layout:
  - Header: Fixed at top with Plan Details & Stats
  - Content: Two columns (Form + List)
  - Scroll: List scrolls independently
*/

const PlanDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddExpenseMobile, setShowAddExpenseMobile] = useState(false);

    const { addToast } = useToast();

    // Modal States
    const [deletePlanModal, setDeletePlanModal] = useState(false);
    const [deleteExpenseModal, setDeleteExpenseModal] = useState({ show: false, expenseId: null });

    // New States for Edit/Remove
    const [isEditingPlan, setIsEditingPlan] = useState(false);
    const [editPlanData, setEditPlanData] = useState({ title: '', description: '', totalBudget: 0 });
    const [removeMemberModal, setRemoveMemberModal] = useState({ show: false, memberName: null });

    // Add Member State
    const [newMemberName, setNewMemberName] = useState('');

    // Handler to open edit modal
    const openEditModal = () => {
        if (!plan) return;
        setEditPlanData({
            title: plan.title,
            description: plan.description || '',
            totalBudget: plan.totalBudget || 0
        });
        setNewMemberName(''); // Reset new member input
        setIsEditingPlan(true);
    };

    // Handler to submit plan updates
    const handleUpdatePlan = async () => {

        try {
            const updated = await updatePlan(id, editPlanData);
            setPlan(prev => ({ ...prev, ...updated }));
            setIsEditingPlan(false);
            addToast('Plan updated successfully', 'success');
        } catch (error) {
            console.error("Failed to update plan", error);
            addToast('Failed to update plan', 'error');
        } finally {

        }
    };

    // Handler to add new member
    const handleAddMember = async () => {
        if (!newMemberName.trim()) return;

        try {
            const updated = await addPlanMember(id, newMemberName);
            setPlan(prev => ({ ...prev, members: updated.members, type: updated.type }));
            setNewMemberName('');
            addToast(`${newMemberName} added to plan`, 'success');
        } catch (error) {
            console.error("Failed to add member", error);
            const status = error.response?.status;
            const message = error.response?.data?.message || error.message;
            addToast(`Failed: ${message} (${status})`, 'error');
        } finally {

        }
    };

    // Handler to remove member
    const confirmRemoveMember = async () => {
        if (!removeMemberModal.memberName) return;

        try {
            const updated = await removePlanMember(id, removeMemberModal.memberName);
            setPlan(prev => ({ ...prev, members: updated.members }));
            addToast(`${removeMemberModal.memberName} removed`, 'success');
        } catch (error) {
            console.error("Failed to remove member", error);
            addToast('Failed to remove member', 'error');
        } finally {
            setRemoveMemberModal({ show: false, memberName: null });

        }
    };

    // Filters for ExpenseList
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('date_desc');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        fetchPlanDetails();
    }, [id]);

    const fetchPlanDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const { data } = await axios.get(`${API_BASE_URL}/plans/${id}`, config);
            setPlan(data.plan);
            setExpenses(data.expenses);
        } catch (error) {
            console.error('Failed to fetch plan details', error);
            addToast('Failed to load plan details.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExpenseAdded = (newExpense) => {
        setExpenses(prev => [newExpense, ...prev]);
        setShowAddExpenseMobile(false);
        addToast('Transaction added!', 'success');
    };

    const confirmDeletePlan = async () => {

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/plans/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/plans');
            addToast('Plan deleted successfully', 'success');
        } catch (error) {
            console.error("Failed to delete plan", error);
            addToast('Failed to delete plan.', 'error');
        } finally {
            setDeletePlanModal(false);

        }
    };

    const confirmDeleteExpense = async () => {
        if (!deleteExpenseModal.expenseId) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/expenses/${deleteExpenseModal.expenseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExpenses(prev => prev.filter(e => e._id !== deleteExpenseModal.expenseId));
            addToast('Expense deleted.', 'success');
        } catch (error) {
            console.error("Failed to delete expense", error);
            addToast('Failed to delete expense.', 'error');
        } finally {
            setDeleteExpenseModal({ show: false, expenseId: null });

        }
    };

    // Triggered by ExpenseList
    const handleDeleteExpenseClick = (expenseId) => {
        setDeleteExpenseModal({ show: true, expenseId });
    };

    const [selectedMember, setSelectedMember] = useState(null);

    // Calculate Member Spending Breakdown (Group Only)
    // Moved to top level to avoid 'Rendered more hooks' error
    const memberStats = useMemo(() => {
        if (!plan || plan.type !== 'group' || !plan.members) return [];

        const stats = {};
        // Initialize with all members
        plan.members.forEach(m => stats[m.name] = 0);

        expenses.forEach(exp => {
            const splitBetween = exp.splitBetween && exp.splitBetween.length > 0
                ? exp.splitBetween
                : plan.members.map(m => m.name); // Default to all if empty

            const share = exp.amount / splitBetween.length;
            splitBetween.forEach(name => {
                if (stats[name] !== undefined) {
                    stats[name] += share;
                } else {
                    stats[name] = (stats[name] || 0) + share;
                }
            });
        });

        // Convert to array and sort by amount desc
        return Object.entries(stats)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [plan, expenses]);

    // Filtered Expenses based on all filters (Category, Date, Member)
    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            // Category Filter
            if (categoryFilter && exp.category !== categoryFilter) return false;

            // Date Filter
            if (dateFilter) {
                const expDate = new Date(exp.date);
                const now = new Date();

                if (dateFilter === 'today') {
                    if (!isSameDay(expDate, now)) return false;
                } else if (dateFilter === 'week') {
                    if (!isSameWeek(expDate, now)) return false;
                } else if (dateFilter === 'month') {
                    if (!isSameMonth(expDate, now)) return false;
                }
            }

            // Member Filter
            if (selectedMember) {
                const splitBetween = exp.splitBetween && exp.splitBetween.length > 0
                    ? exp.splitBetween
                    : (plan?.members?.map(m => m.name) || []);

                if (!splitBetween.includes(selectedMember)) return false;
            }

            return true;
        });
    }, [expenses, categoryFilter, dateFilter, selectedMember, plan]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!plan) {
        return <div className="p-8 text-center">Plan not found</div>;
    }

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budget = plan.totalBudget || 0;
    const progress = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

    // Determine color based on progress
    let progressColor = 'bg-blue-500';
    if (progress > 75) progressColor = 'bg-yellow-500';
    if (progress > 90) progressColor = 'bg-red-500';

    return (
        <div className="h-[100dvh] flex flex-col bg-slate-50 overflow-hidden font-sans text-slate-800">
            {/* 1. Minimize Top Header (Just Back Button and Brand) */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm shrink-0 z-20 py-3 px-4 md:px-8">
                <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
                    <Link to="/plans" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Plans
                    </Link>
                    <div className="flex gap-2">
                        <button
                            onClick={openEditModal}
                            className="text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50 font-bold text-sm bg-slate-100 flex items-center gap-2"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => setDeletePlanModal(true)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                            title="Delete Plan"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Main Content */}
            <div className="flex-1 overflow-hidden">
                <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row">

                    {/* Left Panel: Expense Form (Desktop: Fixed, Mobile: Toggle) */}
                    <div className={cn(
                        "lg:w-[360px] lg:border-r border-slate-200 bg-white h-full overflow-y-auto z-10 transition-transform duration-300 ease-in-out",
                        showAddExpenseMobile ? "fixed inset-0 z-50 w-full" : "hidden lg:block relative"
                    )}>
                        <div className="p-6 h-full flex flex-col">
                            {showAddExpenseMobile && (
                                <button
                                    onClick={() => setShowAddExpenseMobile(false)}
                                    className="mb-4 text-slate-500 hover:text-slate-800 flex items-center lg:hidden font-bold"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                                </button>
                            )}

                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                Add Transaction
                            </h3>

                            <div className="flex-1">
                                <ExpenseForm
                                    onExpenseAdded={handleExpenseAdded}
                                    defaultPlanId={plan._id}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Plan Details & List */}
                    <div className="flex-1 h-full min-w-0 bg-slate-50 flex flex-col relative overflow-hidden">
                        {/* Mobile FAB */}
                        <div className="lg:hidden absolute bottom-6 right-6 z-30">
                            <button
                                onClick={() => setShowAddExpenseMobile(true)}
                                className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-blue-600/20"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">

                                {/* Plan Header (Moved Here) */}
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {(plan.type === 'group' || (plan.members && plan.members.length > 0)) ? (
                                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                                    <Users className="w-8 h-8" />
                                                </div>
                                            ) : (
                                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                    <Loader2 className="w-8 h-8 hidden" />
                                                    <Wallet className="w-8 h-8" />
                                                </div>
                                            )}
                                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{plan.title}</h1>
                                        </div>
                                        {plan.description && (
                                            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">{plan.description}</p>
                                        )}

                                        {/* Progress Bar in Header Context */}
                                        {budget > 0 && (
                                            <div className="mt-6 max-w-md">
                                                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                                                    <span>Budget Usage</span>
                                                    <span>{progress.toFixed(0)}%</span>
                                                </div>
                                                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full transition-all duration-500 ease-out rounded-full", progressColor)}
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats Card */}
                                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/60 min-w-[200px]">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Spent</p>
                                        <p className={cn(
                                            "text-3xl font-black tracking-tight",
                                            budget > 0 && totalSpent > budget ? 'text-red-500' : 'text-blue-600'
                                        )}>
                                            ₹{(totalSpent / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>

                                        {budget > 0 && (
                                            <div className="mt-2 pt-2 border-t border-slate-100 mb-2">
                                                <p className="text-xs text-slate-400 font-medium">
                                                    of <span className="text-slate-700 font-bold">₹{(budget / 100).toLocaleString('en-IN')}</span> budget
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-bold">
                                                {expenses.length}
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">Transactions</span>
                                        </div>
                                    </div>
                                </div>


                                {/* Member Spending Breakdown (Group Plans) */}
                                {plan.type === 'group' && memberStats.length > 0 && (
                                    <div className="mb-8 animate-fadeIn">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Member Spending</h4>
                                            {selectedMember && (
                                                <button
                                                    onClick={() => setSelectedMember(null)}
                                                    className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 px-2 py-1 rounded-lg transition-colors"
                                                >
                                                    Clear Filter
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {memberStats.map((stat, idx) => {
                                                const totalPlanSpent = totalSpent || 1;
                                                const percentage = (stat.amount / totalPlanSpent) * 100;
                                                const isSelected = selectedMember === stat.name;

                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedMember(isSelected ? null : stat.name)}
                                                        className={`text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group ${isSelected
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20 transform scale-[1.02]'
                                                            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-center mb-2 relative z-10">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                                                    }`}>
                                                                    {stat.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>{stat.name}</span>
                                                            </div>
                                                            <span className={`font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>₹{(stat.amount / 100).toFixed(0)}</span>
                                                        </div>
                                                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-black/20' : 'bg-slate-100'}`}>
                                                            <div
                                                                className={`h-full rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        {!isSelected && (
                                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setRemoveMemberModal({ show: true, memberName: stat.name });
                                                                    }}
                                                                    className="p-1 hover:bg-red-100 rounded text-red-400 hover:text-red-500"
                                                                    title="Remove Member"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                                <Users className="w-4 h-4 text-blue-400" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Transactions List */}
                                <div className="mt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-slate-400" />
                                            Transactions
                                        </h3>
                                    </div>
                                    <ExpenseList
                                        expenses={filteredExpenses}
                                        loading={loading}
                                        error={null}
                                        categoryFilter={categoryFilter}
                                        setCategoryFilter={setCategoryFilter}
                                        sortOrder={sortOrder}
                                        setSortOrder={setSortOrder}
                                        dateFilter={dateFilter}
                                        setDateFilter={setDateFilter}
                                        isPlanView={true}
                                        onDelete={handleDeleteExpenseClick} // Pass the handler
                                        hideTotal={true} // Hide the blue total card
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Plan Delete Modal */}
            <ConfirmModal
                isOpen={deletePlanModal}
                onClose={() => setDeletePlanModal(false)}
                onConfirm={confirmDeletePlan}
                title="Delete Plan?"
                message="Are you sure you want to delete this plan? This action cannot be undone."
                confirmText="Delete Plan"
            />

            {/* Confirm Expense Delete Modal */}
            <ConfirmModal
                isOpen={deleteExpenseModal.show}
                onClose={() => setDeleteExpenseModal({ show: false, expenseId: null })}
                onConfirm={confirmDeleteExpense}
                title="Delete Expense?"
                message="Are you sure you want to delete this transaction?"
                confirmText="Delete Transaction"
            />

            {/* Edit Plan Modal */}
            {isEditingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">Edit Plan Details</h3>
                            <button onClick={() => setIsEditingPlan(false)} className="text-slate-400 hover:text-slate-600">
                                <Trash2 className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Plan Name</label>
                                <input
                                    type="text"
                                    value={editPlanData.title}
                                    onChange={(e) => setEditPlanData({ ...editPlanData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={editPlanData.description}
                                    onChange={(e) => setEditPlanData({ ...editPlanData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-600 h-24 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Total Budget (₹)</label>
                                <input
                                    type="number"
                                    value={editPlanData.totalBudget}
                                    onChange={(e) => setEditPlanData({ ...editPlanData, totalBudget: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700"
                                />
                            </div>

                            {/* Add Member Section */}
                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Add Member</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                        placeholder="Enter member name"
                                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700"
                                    />
                                    <button
                                        onClick={handleAddMember}
                                        disabled={!newMemberName.trim()}
                                        className="px-4 py-2 bg-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button
                                onClick={() => setIsEditingPlan(false)}
                                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePlan}
                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Remove Member Modal */}
            <ConfirmModal
                isOpen={removeMemberModal.show}
                onClose={() => setRemoveMemberModal({ show: false, memberName: null })}
                onConfirm={confirmRemoveMember}
                title="Remove Member?"
                message={`Are you sure you want to remove ${removeMemberModal.memberName} from this plan?`}
                confirmText="Remove"
                isDestructive={true}
            />
        </div>
    );
};

export default PlanDetail;
