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
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 rounded-full bg-white text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Plans</h1>
                            <p className="text-slate-500 mt-1">Manage your budgets for specific events</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/10"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Plan
                    </button>
                </header>

                {plans.length === 0 ? (
                    <div className="text-center py-20 bg-white/60 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60">
                        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No plans yet</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">Create a plan to track expenses for a trip, event, or project.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-100 transition"
                        >
                            Create your first plan
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

                            // Original progress bar logic (kept for now, but the provided snippet removed it)
                            const progress = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
                            let progressColor = 'bg-blue-500'; // Changed from teal
                            if (progress > 75) progressColor = 'bg-yellow-500';
                            if (progress > 90) progressColor = 'bg-red-500';

                            return (
                                <Link
                                    key={plan._id}
                                    to={`/plans/${plan._id}`}
                                    className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${isGroup ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600'} group-hover:text-white transition-colors duration-300`}>
                                            {isGroup ? <Users className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => handleDeleteClick(e, plan)}
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors z-10"
                                                title="Delete Plan"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{plan.title}</h3>
                                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-grow">{plan.description || 'No description'}</p>

                                    <div className="pt-4 border-t border-slate-100">
                                        <div className="flex justify-between items-end mb-3">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Spent</p>
                                                <p className={`text-lg font-black ${isOverBudget ? 'text-red-500' : 'text-slate-800'}`}>
                                                    ₹{(totalSpent / 100).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Budget</p>
                                                <p className="text-base font-bold text-slate-600">
                                                    {budget > 0 ? `₹${(budget / 100).toLocaleString('en-IN')}` : 'No Limit'}
                                                </p>
                                            </div>
                                        </div>

                                        {budget > 0 && (
                                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
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
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Create New Plan</h2>
                        <form onSubmit={handleCreatePlan} className="space-y-5">

                            {/* Plan Type Selection */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setNewPlan({ ...newPlan, type: 'personal' })}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${newPlan.type === 'personal' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <User className="w-6 h-6 mb-2" />
                                    <span className="text-sm font-bold">Personal</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewPlan({ ...newPlan, type: 'group' })}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${newPlan.type === 'group' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <Users className="w-6 h-6 mb-2" />
                                    <span className="text-sm font-bold">Group</span>
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Plan Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newPlan.title}
                                    onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition font-medium text-slate-800"
                                    placeholder="e.g., Goa Trip"
                                />
                            </div>

                            {/* Group Members Input (only if Group) */}
                            {newPlan.type === 'group' && (
                                <div className="animate-fadeIn">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Group Members</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={memberInput}
                                            onChange={(e) => setMemberInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addMember(e)}
                                            className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium text-slate-800"
                                            placeholder="Add Name (Enter)"
                                        />
                                        <button
                                            type="button"
                                            onClick={addMember}
                                            className="bg-indigo-100 text-indigo-700 px-4 rounded-xl font-bold hover:bg-indigo-200"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {newPlan.members.map((member, idx) => (
                                            <span key={idx} className="bg-indigo-50 text-indigo-700 text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                                {member}
                                                <button type="button" onClick={() => removeMember(member)} className="hover:text-indigo-900">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Add names of people in this group.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={newPlan.description}
                                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition font-medium text-slate-800 resize-none"
                                    placeholder="Brief details..."
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Budget (Optional)</label>
                                <input
                                    type="number"
                                    value={newPlan.totalBudget}
                                    onChange={(e) => setNewPlan({ ...newPlan, totalBudget: e.target.value })}
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition font-medium text-slate-800"
                                    placeholder="In Paise (e.g. 500000 for 5000)"
                                />
                                <p className="text-xs text-slate-400 mt-2 font-medium">Enter amount in paise (₹1 = 100 paise)</p>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-slate-500 hover:text-slate-800 font-bold px-5 py-3 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30"
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
