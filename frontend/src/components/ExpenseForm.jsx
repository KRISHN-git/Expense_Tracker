
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createExpense } from '../services/api';
import { CATEGORIES, API_BASE_URL } from '../utils/constants';
import { PlusCircle, Loader2, Users, Check } from 'lucide-react';
import { cn } from '../utils/cn';

const ExpenseForm = ({ onExpenseAdded, defaultPlanId = null }) => {
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
            // Determine splitMembers
            let splitBetween = [];
            const selectedPlan = plans.find(p => p._id === planId);

            if (selectedPlan && selectedPlan.type === 'group') {
                if (splitOption === 'everyone') {
                    // Start with everyone (empty array means everyone backend side? 
                    // Let's be explicit and send all names OR empty and handle in logic.
                    // Implementation plan said: "If empty or null, assumes 'Everyone'". 
                    // But for "Member Spending Breakdown", explicit is better.
                    // Actually, if I send empty, I have to assume the group membership AT THAT TIME.
                    // If membership changes later, historical expenses might get weird if based on "current members".
                    // Best to snapshot the members involved.
                    // The schema for `members` is `[{name: String}]`.
                    splitBetween = selectedPlan.members.map(m => m.name);
                } else {
                    splitBetween = selectedMembers;
                }
            }

            const payload = {
                amount: amountInPaise,
                category,
                description,
                date,
                planId: planId || null,
                splitBetween: splitBetween
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col font-sans">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <PlusCircle className="w-6 h-6 text-blue-600" />
                    New Expense
                </h2>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
                        {Array.isArray(error) ? error.join(', ') : error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium border border-green-100 animate-fade-in">
                        Expense added successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Amount</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <span className="text-slate-400 text-xl font-semibold">₹</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                placeholder="0.00"
                                className="block w-full rounded-xl pl-10 pr-4 py-3 text-xl font-bold text-slate-800 border bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="block w-full rounded-xl py-3 px-4 text-base font-medium text-slate-800 border bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Plan Selection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Assign to Plan (Optional)</label>
                            <select
                                value={planId}
                                onChange={(e) => setPlanId(e.target.value)}
                                disabled={!!defaultPlanId} // Lock if default provided
                                className={cn(
                                    "block w-full rounded-xl py-3 px-4 text-base font-medium text-slate-800 border bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all",
                                    !!defaultPlanId && "bg-slate-100 text-slate-500 cursor-not-allowed"
                                )}
                            >
                                <option value="">No Plan (General Expense)</option>
                                {plans.map(plan => (
                                    <option key={plan._id} value={plan._id}>{plan.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Split Expense Option (Group Plans Only) */}
                        {isGroupPlan && (
                            <div className="animate-fade-in space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Split Between</label>
                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setSplitOption('everyone')}
                                        className={cn(
                                            "flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all border",
                                            splitOption === 'everyone'
                                                ? "bg-blue-100 text-blue-700 border-blue-200 shadow-sm"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
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
                                                ? "bg-blue-100 text-blue-700 border-blue-200 shadow-sm"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        Select People
                                    </button>
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
                                                        ? "bg-blue-50 border-blue-200 text-blue-800"
                                                        : "bg-white border-slate-200 text-slate-600 hover:border-blue-200"
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                                        selectedMembers.includes(member.name) ? "bg-blue-200 text-blue-800" : "bg-slate-100 text-slate-500"
                                                    )}>
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    {member.name}
                                                </div>
                                                {selectedMembers.includes(member.name) && (
                                                    <Check className="w-4 h-4 text-blue-600" />
                                                )}
                                            </button>
                                        ))}
                                        {selectedMembers.length === 0 && (
                                            <p className="text-xs text-red-500 font-medium text-center mt-1">Select at least one member</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="block w-full rounded-xl py-3 px-4 text-base font-medium text-slate-800 border bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="What was this for?"
                            className="block w-full rounded-xl py-3 px-4 text-base font-medium text-slate-800 border bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.01] active:scale-[0.98] mt-4",
                            loading && "opacity-75 cursor-not-allowed transform-none"
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Adding...
                            </>
                        ) : 'ADD EXPENSE'}
                    </button>
                </form>
            </div >
        </div >
    );
};

export default ExpenseForm;
