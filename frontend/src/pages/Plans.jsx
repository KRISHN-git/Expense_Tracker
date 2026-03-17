import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; // Import Toast
import { API_BASE_URL } from '../utils/constants';
import { Plus, ArrowRight, Loader2, Calendar, ArrowLeft, User, Users, X, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal'; // Import Modal


const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ show: false, planId: null, planName: '' });

    const { addToast } = useToast(); // Use Toast

    // Updated state for new plan creation
    const [newPlan, setNewPlan] = useState({
        title: '',
        description: '',
        totalBudget: '',
        type: 'personal',
        members: []
    });
    const [memberInput, setMemberInput] = useState('');

    const { user } = useAuth();


    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const { data } = await axios.get(`${API_BASE_URL}/plans`, config);
            console.log("Fetched Plans:", data); // Debugging
            setPlans(data);
        } catch (error) {
            console.error('Failed to fetch plans', error);
            addToast('Failed to load plans.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            // Prepare payload
            const payload = {
                title: newPlan.title,
                description: newPlan.description,
                totalBudget: newPlan.totalBudget,
                type: newPlan.type, // Explicitly send type
                members: newPlan.members.map(m => ({ name: m }))
            };

            await axios.post(`${API_BASE_URL}/plans`, payload, config);
            setShowCreateModal(false);
            setNewPlan({ title: '', description: '', totalBudget: '', type: 'personal', members: [] });
            setMemberInput('');
            fetchPlans();
            addToast('Plan created successfully!', 'success');
        } catch (error) {
            console.error('Failed to create plan', error);
            addToast('Failed to create plan.', 'error');
        } finally {

        }
    };

    // Open Modal
    const handleDeleteClick = (e, plan) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteModal({ show: true, planId: plan._id, planName: plan.title });
    };

    // Actual Delete Logic
    const confirmDelete = async () => {
        if (!deleteModal.planId) return;


        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/plans/${deleteModal.planId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove from local state
            setPlans(plans.filter(p => p._id !== deleteModal.planId));
            addToast('Plan deleted successfully.', 'success');
        } catch (error) {
            console.error("Failed to delete plan", error);
            addToast('Failed to delete plan. Please try again.', 'error');
        } finally {
            setDeleteModal({ show: false, planId: null, planName: '' });

        }
    };

    const addMember = (e) => {
        e.preventDefault();
        if (memberInput.trim()) {
            if (!newPlan.members.includes(memberInput.trim())) {
                setNewPlan({ ...newPlan, members: [...newPlan.members, memberInput.trim()] });
            }
            setMemberInput('');
        }
    };

    const removeMember = (member) => {
        setNewPlan({ ...newPlan, members: newPlan.members.filter(m => m !== member) });
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 font-sans text-slate-800 transition-colors duration-300 relative">
            <div className="max-w-7xl mx-auto relative z-10">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Link to="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm shrink-0 border border-slate-100 dark:border-slate-700">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-[28px] sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">My Plans</h1>
                            <p className="text-[#6b7280] dark:text-slate-400 mt-1 text-sm sm:text-base font-medium">Manage budgets and split group expenses.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#4f46e5] dark:bg-indigo-500 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors text-sm font-semibold shadow-md shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Plan
                    </button>
                </header>

                {plans.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 max-w-2xl mx-auto mt-10">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">No Plans Yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto font-medium">Create a plan to track personal expenses or split group costs.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
                        >
                            <Plus className="w-5 h-5" />
                            Create First Plan
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => {
                            // Debug log for the specific plan causing issues
                            if (plan.title === 'sangam') console.log("Debug Plan 'sangam':", plan);

                            // Calculate basic stats for card preview
                            // Use backend calculated totalSpent
                            const totalSpent = plan.totalSpent || 0;
                            const budget = plan.totalBudget || 0;
                            const isOverBudget = budget > 0 && totalSpent > budget;
                            // Force group if members exist, even if type says personal (migration/bug fix)
                            const hasMembers = plan.members && plan.members.length > 0;
                            const isGroup = plan.type === 'group' || hasMembers;

                            // Dynamic progress bar styling
                            const progress = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
                            let progressColor = 'bg-[#5a67d8] dark:bg-indigo-500';

                            return (
                                <Link
                                    key={plan._id}
                                    to={`/plans/${plan._id}`}
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.12)] transition-all duration-300 border border-white dark:border-slate-700/60 flex flex-col h-full group hover:-translate-y-1 relative overflow-hidden"
                                >
                                    {/* Subtle Background Gradient Accents */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent dark:from-blue-900/20 rounded-bl-full pointer-events-none -z-10"></div>

                                    {/* Action Buttons Container - Hidden untill hover on desktop */}
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-20">
                                        <button
                                            onClick={(e) => handleDeleteClick(e, plan)}
                                            className="p-2 bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 rounded-full transition-colors"
                                            title="Delete Plan"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="mb-5 relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${isGroup ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-sm shadow-indigo-100 dark:shadow-none' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 shadow-sm shadow-blue-100 dark:shadow-none'} transition-transform group-hover:scale-105`}>
                                            {isGroup ? <Users className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                        </div>
                                        <h3 className="text-[20px] font-black text-slate-800 dark:text-white mb-1.5 leading-tight tracking-tight">{plan.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-2 leading-relaxed">{plan.description || 'No description provided'}</p>
                                    </div>

                                    <div className="mt-auto pt-5 border-t border-slate-100/80 dark:border-slate-700/60 transition-colors relative z-10">
                                        <div className="flex justify-between items-end mb-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Spent</p>
                                                <p className="text-2xl font-black text-slate-800 dark:text-white flex items-baseline gap-1 tracking-tight">
                                                    <span className="text-sm font-bold text-slate-400">₹</span> {(totalSpent / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Budget</p>
                                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                                    {budget > 0 ? `₹${(budget / 100).toLocaleString('en-IN')}` : 'No Limit'}
                                                </p>
                                            </div>
                                        </div>

                                        {budget > 0 && (
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                                                <div
                                                    className={`h-full ${progressColor} transition-all duration-700 rounded-full`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Create New Plan</h2>
                        <form onSubmit={handleCreatePlan} className="space-y-5">

                            {/* Plan Type Selection */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setNewPlan({ ...newPlan, type: 'personal' })}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${newPlan.type === 'personal' ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                >
                                    <User className="w-6 h-6 mb-2" />
                                    <span className="text-sm font-bold">Personal</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewPlan({ ...newPlan, type: 'group' })}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${newPlan.type === 'group' ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                >
                                    <Users className="w-6 h-6 mb-2" />
                                    <span className="text-sm font-bold">Group</span>
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Plan Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newPlan.title}
                                    onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition font-medium text-slate-800 dark:text-white"
                                    placeholder="e.g., Goa Trip"
                                />
                            </div>

                            {/* Group Members Input (only if Group) */}
                            {newPlan.type === 'group' && (
                                <div className="animate-fadeIn">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Group Members</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={memberInput}
                                            onChange={(e) => setMemberInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addMember(e)}
                                            className="flex-1 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition font-medium text-slate-800 dark:text-white"
                                            placeholder="Add Name (Enter)"
                                        />
                                        <button
                                            type="button"
                                            onClick={addMember}
                                            className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 rounded-xl font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {newPlan.members.map((member, idx) => (
                                            <span key={idx} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                                {member}
                                                <button type="button" onClick={() => removeMember(member)} className="hover:text-indigo-900 dark:hover:text-indigo-300">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Add names of people in this group.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={newPlan.description}
                                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition font-medium text-slate-800 dark:text-white resize-none"
                                    placeholder="Brief details..."
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Budget (Optional)</label>
                                <input
                                    type="number"
                                    value={newPlan.totalBudget}
                                    onChange={(e) => setNewPlan({ ...newPlan, totalBudget: e.target.value })}
                                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition font-medium text-slate-800 dark:text-white"
                                    placeholder="In Paise (e.g. 500000 for 5000)"
                                />
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">Enter amount in paise (₹1 = 100 paise)</p>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-bold px-5 py-3 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-lg shadow-blue-600/20 dark:shadow-blue-900/40 hover:shadow-blue-600/30"
                                >
                                    Create Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, planId: null, planName: '' })}
                onConfirm={confirmDelete}
                title="Delete Plan?"
                message={`Are you sure you want to delete "${deleteModal.planName}"? This action cannot be undone and all distinct expenses will be deleted.`}
                confirmText="Delete Plan"
            />
        </div>
    );
};

export default Plans;
