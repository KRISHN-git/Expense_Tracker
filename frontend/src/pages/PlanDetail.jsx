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

    // Splitwise Logic: Calculate Net Balances and Settlements
    const settlements = useMemo(() => {
        if (!plan || plan.type !== 'group' || !plan.members || expenses.length === 0) return [];

        // 1. Calculate Net Balance for everyone
        // + means they are owed money, - means they owe money
        const balances = {};
        plan.members.forEach(m => balances[m.name] = 0);
        // Add "You" to balances if not already there but expenses use "You" (fallback to actual name if possible)
        
        expenses.forEach(exp => {
            const amount = exp.amount;
            const paidBy = exp.paidBy || 'You'; // Fallback
            
            // Ensure paidBy exists in balances
            if (balances[paidBy] === undefined) balances[paidBy] = 0;

            // They get +amount for paying
            balances[paidBy] += amount;

            const splitBetween = exp.splitBetween && exp.splitBetween.length > 0 
                ? exp.splitBetween 
                : plan.members.map(m => m.name);

            const share = amount / splitBetween.length;

            // Everyone involved gets -share
            splitBetween.forEach(name => {
                if (balances[name] === undefined) balances[name] = 0;
                balances[name] -= share;
            });
        });

        // 2. Greedy algorithm to settle debts
        let debtors = [];
        let creditors = [];

        Object.keys(balances).forEach(person => {
            const bal = Math.round(balances[person]); // Round to avoid floating point issues (paise)
            if (bal < 0) debtors.push({ name: person, amount: -bal });
            else if (bal > 0) creditors.push({ name: person, amount: bal });
        });

        // Sort by amount descending to minimize transactions
        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        const calculatedSettlements = [];

        let i = 0; // debtors index
        let j = 0; // creditors index

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];

            const amount = Math.min(debtor.amount, creditor.amount);

            if (amount > 0) {
                 calculatedSettlements.push({
                    from: debtor.name,
                    to: creditor.name,
                    amount: amount
                });
            }

            debtor.amount -= amount;
            creditor.amount -= amount;

            if (debtor.amount === 0) i++;
            if (creditor.amount === 0) j++;
        }

        return calculatedSettlements;

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
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!plan) {
        return <div className="p-8 text-center text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 h-screen transition-colors duration-300">Plan not found</div>;
    }

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budget = plan.totalBudget || 0;
    const progress = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

    // Determine color based on progress
    let progressColor = 'bg-blue-500'; // Changed from blue
    if (progress > 75) progressColor = 'bg-yellow-500';
    if (progress > 90) progressColor = 'bg-red-500';

    return (
        <div className="h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            {/* 1. Minimize Top Header (Just Back Button and Brand) */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm shrink-0 z-20 py-3 px-4 md:px-8">
                <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
                    <Link to="/plans" className="inline-flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Plans
                    </Link>
                    <div className="flex gap-2">
                        <button
                            onClick={openEditModal}
                            className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 font-bold text-sm bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 flex items-center gap-2"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => setDeletePlanModal(true)}
                            className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
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
                        "lg:w-[360px] lg:border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-full overflow-y-auto z-10 transition-all duration-300 ease-in-out",
                        showAddExpenseMobile ? "fixed inset-0 z-50 w-full" : "hidden lg:block relative"
                    )}>
                        <div className="p-6 h-full flex flex-col">
                            {showAddExpenseMobile && (
                                <button
                                    onClick={() => setShowAddExpenseMobile(false)}
                                    className="mb-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center lg:hidden font-bold transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                                </button>
                            )}

                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                Add Transaction
                            </h3>

                            <div className="flex-1">
                                <ExpenseForm
                                    onExpenseAdded={handleExpenseAdded}
                                    defaultPlanId={plan._id}
                                    hideTypeToggle={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Plan Details & List */}
                    <div className="flex-1 h-full min-w-0 bg-slate-50 dark:bg-slate-900 flex flex-col relative overflow-hidden transition-colors duration-300">
                        {/* Mobile FAB */}
                        <div className="lg:hidden absolute bottom-6 right-6 z-30">
                            <button
                                onClick={() => setShowAddExpenseMobile(true)}
                                className="bg-blue-600 dark:bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-blue-600/20 dark:shadow-blue-900/40"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">

                                {/* Plan Header (Moved Here) */}
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            {(plan.type === 'group' || (plan.members && plan.members.length > 0)) ? (
                                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800/30">
                                                    <Users className="w-8 h-8" />
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-800/30">
                                                    <Loader2 className="w-8 h-8 hidden" />
                                                    <Wallet className="w-8 h-8" />
                                                </div>
                                            )}
                                            <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">{plan.title}</h1>
                                        </div>
                                        {plan.description && (
                                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-2xl font-medium">{plan.description}</p>
                                        )}

                                        {/* Progress Bar in Header Context */}
                                        {budget > 0 && (
                                            <div className="mt-6 max-w-md">
                                                <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
                                                    <span>Budget Usage</span>
                                                    <span>{progress.toFixed(0)}%</span>
                                                </div>
                                                <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full transition-all duration-500 ease-out rounded-full", progressColor)}
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats Card */}
                                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 rounded-[24px] shadow-sm border border-white dark:border-slate-700/50 min-w-[220px] relative overflow-hidden group">
                                         {/* subtle gradient flare */}
                                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl group-hover:bg-blue-400/30 transition-all duration-500"></div>
                                        
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1.5">Total Spent</p>
                                        <p className={cn(
                                            "text-4xl font-black tracking-tighter",
                                            budget > 0 && totalSpent > budget ? 'text-red-500 dark:text-red-400' : 'text-slate-800 dark:text-white'
                                        )}>
                                            <span className="text-xl font-bold text-slate-400 mr-1">₹</span>
                                            {(totalSpent / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>

                                        {budget > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 mb-3">
                                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                                    of <span className="text-slate-700 dark:text-slate-300 font-bold">₹{(budget / 100).toLocaleString('en-IN')}</span> budget limit
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-800/30">
                                                {expenses.length}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Entries</span>
                                        </div>
                                    </div>
                                </div>


                                {/* Member Spending Breakdown (Group Plans) */}
                                {plan.type === 'group' && memberStats.length > 0 && (
                                    <div className="mb-8 animate-fadeIn">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Member Spending</h4>
                                            {selectedMember && (
                                                <button
                                                    onClick={() => setSelectedMember(null)}
                                                    className="text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-lg transition-colors"
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
                                                            ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white shadow-lg shadow-indigo-600/20 dark:shadow-indigo-900/40 transform scale-[1.02]'
                                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-center mb-2 relative z-10">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                                    }`}>
                                                                    {stat.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{stat.name}</span>
                                                            </div>
                                                            <span className={`font-black ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>₹{(stat.amount / 100).toFixed(0)}</span>
                                                        </div>
                                                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-black/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                                            <div
                                                                className={`h-full rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}
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
                                                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-400 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                                    title="Remove Member"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                                <Users className="w-4 h-4 text-indigo-400 dark:text-indigo-500" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Settlements (Splitwise style) */}
                                {plan.type === 'group' && settlements.length > 0 && (
                                    <div className="mb-10 animate-fadeIn">
                                        <div className="mb-4">
                                            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Balances & Settlements</h4>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Who owes whom based on transactions.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {settlements.map((settlement, idx) => (
                                                <div key={idx} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur border border-slate-200/60 dark:border-slate-700/60 p-4 rounded-2xl shadow-sm flex items-center justify-between group hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 flex items-center justify-center font-bold text-sm border border-red-100 dark:border-red-800/30">
                                                            {settlement.from.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{settlement.from}</span>
                                                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">owes</span>
                                                        </div>
                                                        <ArrowLeft className="w-4 h-4 text-slate-300 dark:text-slate-600 rotate-180 mx-1" />
                                                        <div className="flex flex-col text-right">
                                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{settlement.to}</span>
                                                        </div>
                                                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400 flex items-center justify-center font-bold text-sm border border-green-100 dark:border-green-800/30">
                                                            {settlement.to.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg flex items-baseline gap-1">
                                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">₹</span>
                                                        <span className="font-black text-slate-800 dark:text-white text-lg">{(settlement.amount / 100).toLocaleString('en-IN')}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Transactions List */}
                                <div className="mt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-slate-400 dark:text-slate-500" />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Edit Plan Details</h3>
                            <button onClick={() => setIsEditingPlan(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <Trash2 className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Plan Name</label>
                                <input
                                    type="text"
                                    value={editPlanData.title}
                                    onChange={(e) => setEditPlanData({ ...editPlanData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 font-bold text-slate-700 dark:text-white transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    value={editPlanData.description}
                                    onChange={(e) => setEditPlanData({ ...editPlanData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 font-bold text-slate-700 dark:text-white transition-colors h-24 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Total Budget (₹)</label>
                                <input
                                    type="number"
                                    value={editPlanData.totalBudget}
                                    onChange={(e) => setEditPlanData({ ...editPlanData, totalBudget: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 font-bold text-slate-700 dark:text-white transition-colors"
                                />
                            </div>

                            {/* Add Member Section */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Add Member</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                        placeholder="Enter member name"
                                        className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 font-bold text-slate-700 dark:text-white transition-colors"
                                    />
                                    <button
                                        onClick={handleAddMember}
                                        disabled={!newMemberName.trim()}
                                        className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                            <button
                                onClick={() => setIsEditingPlan(false)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePlan}
                                className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40"
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
