
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createExpense } from '../services/api';
import { CATEGORIES, API_BASE_URL } from '../utils/constants';
import { PlusCircle, Loader2, Users, Check } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';

const ExpenseForm = ({ onExpenseAdded, defaultPlanId = null, defaultType = 'expense', hideTitle = false, hideTypeToggle = false }) => {
    const { user } = useAuth();
    const [expenseType, setExpenseType] = useState(defaultType);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    // Use local date to prevent timezone shifts
    const today = new Date();
    // specific to 'en-CA' (YYYY-MM-DD) which serves as ISO format but local time
    const localDate = today.toLocaleDateString('en-CA');
    const [date, setDate] = useState(localDate);
    const [planId, setPlanId] = useState(defaultPlanId || '');
    const [plans, setPlans] = useState([]);
    const [idempotencyKey, setIdempotencyKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Group Expense Splitting State
    const [splitOption, setSplitOption] = useState('everyone'); // 'everyone' | 'custom'
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [paidBy, setPaidBy] = useState('You'); // newly added



    useEffect(() => {
        setIdempotencyKey(uuidv4());
        fetchPlans();
    }, []);

    // If defaultPlanId changes (e.g. navigation), update state
    useEffect(() => {
        if (defaultPlanId) setPlanId(defaultPlanId);
    }, [defaultPlanId]);

    // Reset split selection when plan changes
    useEffect(() => {
        setSplitOption('everyone');
        setSelectedMembers([]);
        setPaidBy('You');
    }, [planId]);

    const fetchPlans = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const { data } = await import('axios').then(a => a.default.get(`${API_BASE_URL}/plans`, {
                headers: { Authorization: `Bearer ${token}` }
            }));
            setPlans(data);
        } catch (err) {
            console.error("Failed to load plans for form", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        setError(null);
        setSuccess(false);

        const amountInPaise = Math.round(parseFloat(amount) * 100);

        if (amountInPaise <= 0) {
            setError("Amount must be positive.");
            setLoading(false);

            return;
        }

        try {
            // ... (payload preparation)
            // Determine splitMembers
            let splitBetween = [];
            const selectedPlan = plans.find(p => p._id === planId);

            if (selectedPlan && selectedPlan.type === 'group') {
                if (splitOption === 'everyone') {
                    splitBetween = selectedPlan.members.map(m => m.name);
                } else {
                    splitBetween = selectedMembers;
                }
            }

            const payload = {
                amount: amountInPaise,
                category,
                type: expenseType,
                description,
                date,
                planId: planId || null,
                splitBetween: splitBetween,
                paidBy: paidBy === 'You' ? (user?.name || 'You') : paidBy
            };

            const newExpense = await createExpense(payload, idempotencyKey);

            setSuccess(true);
            onExpenseAdded(newExpense);

            setAmount('');
            setCategory('');
            setDescription('');
            const today = new Date();
            const localDate = today.toLocaleDateString('en-CA');
            setDate(localDate);

            if (!defaultPlanId) setPlanId('');
            setSplitOption('everyone');
            setSelectedMembers([]);
            setPaidBy('You');

            setIdempotencyKey(uuidv4());

            setTimeout(() => setSuccess(false), 3000);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to add expense. Please try again.');
        } finally {
            setLoading(false);

        }
    };

    const selectedPlan = plans.find(p => p._id === planId);
    const isGroupPlan = selectedPlan?.type === 'group';

    const toggleMember = (memberName) => {
        if (selectedMembers.includes(memberName)) {
            setSelectedMembers(selectedMembers.filter(m => m !== memberName));
        } else {
            setSelectedMembers([...selectedMembers, memberName]);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-fit flex flex-col font-sans transition-colors duration-300">
            {!hideTitle && (
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <PlusCircle className={cn("w-6 h-6", expenseType === 'income' ? "text-green-500" : "text-blue-500")} />
                        {expenseType === 'income' ? 'New Income' : 'New Expense'}
                    </h2>
                </div>
            )}

            <div className="p-6 flex-1 overflow-y-auto">
                {!hideTypeToggle && (
                    <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl mb-6 shadow-inner">
                        <button
                            type="button"
                            onClick={() => setExpenseType('expense')}
                            className={cn(
                                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                                expenseType === 'expense'
                                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            )}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            onClick={() => setExpenseType('income')}
                            className={cn(
                                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                                expenseType === 'income'
                                    ? "bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            )}
                        >
                            Income
                        </button>
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 dark:border-red-800/50">
                        {Array.isArray(error) ? error.join(', ') : error}
                    </div>
                )}
                {success && (
                    <div className={cn("p-4 rounded-xl mb-6 text-sm font-medium border animate-fade-in",
                        expenseType === 'income'
                            ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800/50"
                            : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50"
                    )}>
                        {expenseType === 'income' ? 'Income' : 'Expense'} added successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Amount</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <span className="text-slate-400 dark:text-slate-500 text-xl font-semibold">₹</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                placeholder="0.00"
                                className="block w-full rounded-xl pl-10 pr-4 py-3 text-xl font-bold text-slate-800 dark:text-white border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="block w-full rounded-xl py-3 px-4 text-base font-medium text-slate-800 dark:text-white border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.filter(cat => expenseType === 'income' ? ['Salary', 'Investment', 'Other'].includes(cat.id) : !['Salary'].includes(cat.id)).map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Only show plan selection for expenses */}
                        {expenseType === 'expense' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Assign to Plan (Optional)</label>
                                <select
                                    value={planId}
                                    onChange={(e) => setPlanId(e.target.value)}
                                    disabled={!!defaultPlanId} // Lock if default provided
                                    className={cn(
                                        "block w-full rounded-xl py-3 px-4 text-base font-medium text-slate-800 dark:text-white border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all",
                                        !!defaultPlanId && "bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-600 cursor-not-allowed border-transparent"
                                    )}
                                >
                                    <option value="">No Plan (General Expense)</option>
                                    {plans.map(plan => (
                                        <option key={plan._id} value={plan._id}>{plan.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Split Expense Option (Group Plans Only) */}
                        {expenseType === 'expense' && isGroupPlan && (
                            <div className="animate-fade-in space-y-4 p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                                
                                {/* Paid By Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Paid By</label>
                                    <select
                                        value={paidBy}
                                        onChange={(e) => setPaidBy(e.target.value)}
                                        className="block w-full rounded-xl py-3 px-4 text-sm font-bold text-blue-700 dark:text-blue-400 border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    >
                                        <option value="You">You</option>
                                        {selectedPlan.members.map(member => (
                                            <option key={member._id || member.name} value={member.name}>{member.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Split Between Selection */}
                                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Split Between</label>
                                    <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setSplitOption('everyone')}
                                        className={cn(
                                            "flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all border",
                                            splitOption === 'everyone'
                                                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-sm"
                                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        Everyone
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSplitOption('custom')}
                                        className={cn(
                                            "flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all border",
                                            splitOption === 'custom'
                                                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-sm"
                                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        Select People
                                    </button>
                                    </div>
                                </div>

                                {splitOption === 'custom' && (
                                    <div className="space-y-2">
                                        {selectedPlan.members.map(member => (
                                            <button
                                                key={member._id || member.name}
                                                type="button"
                                                onClick={() => toggleMember(member.name)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-3 rounded-lg border transition-all text-sm font-semibold",
                                                    selectedMembers.includes(member.name)
                                                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400"
                                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-200 dark:hover:border-blue-800"
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                                        selectedMembers.includes(member.name) ? "bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                                    )}>
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    {member.name}
                                                </div>
                                                {selectedMembers.includes(member.name) && (
                                                    <Check className="w-4 h-4 text-blue-500" />
                                                )}
                                            </button>
                                        ))}
                                        {selectedMembers.length === 0 && (
                                            <p className="text-xs text-red-500 dark:text-red-400 font-medium text-center mt-1">Select at least one member</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="block w-full rounded-xl py-3 px-4 text-base font-medium text-slate-800 dark:text-white border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all color-scheme-light dark:[color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="What was this for?"
                            className="block w-full rounded-xl py-3 px-4 text-base font-medium text-slate-800 dark:text-white border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white transition-all transform hover:scale-[1.01] active:scale-[0.98] mt-4 focus:outline-none focus:ring-2 focus:ring-offset-2",
                            expenseType === 'income' ? "bg-green-600 hover:bg-green-700 shadow-green-500/30" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30",
                            loading && "opacity-75 cursor-not-allowed transform-none"
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Adding...
                            </>
                        ) : (expenseType === 'income' ? 'ADD INCOME' : 'ADD EXPENSE')}
                    </button>
                </form >
            </div >
        </div >
    );
};

export default ExpenseForm;
