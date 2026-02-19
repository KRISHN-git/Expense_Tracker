import React, { useState, useMemo } from 'react';
import { getBudgetAnalytics } from '../services/api';
import { Target, History, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';

const BudgetTracker = ({ expenses, monthlyBudget, onUpdateBudget }) => {
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [newBudget, setNewBudget] = useState(monthlyBudget || 0);
    const [showHistory, setShowHistory] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const currentMonthTotal = useMemo(() => {
        const now = new Date();
        return expenses
            .filter(exp => new Date(exp.date).getMonth() === now.getMonth() && new Date(exp.date).getFullYear() === now.getFullYear())
            .reduce((sum, exp) => sum + exp.amount, 0) / 100;
    }, [expenses]);

    const budgetProgress = monthlyBudget > 0 ? (currentMonthTotal / monthlyBudget) * 100 : 0;
    const isOverBudget = currentMonthTotal > monthlyBudget;

    const handleSaveBudget = () => {
        onUpdateBudget(parseFloat(newBudget));
        setIsEditingBudget(false);
    };

    const toggleHistory = async () => {
        if (!showHistory && historyData.length === 0) {
            setLoadingHistory(true);
            try {
                const data = await getBudgetAnalytics();
                // Filter out current month if needed, or keep it. 
                // data includes current month as last item usually.
                // Let's reverse to show newest first
                setHistoryData([...data].reverse());
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setLoadingHistory(false);
            }
        }
        setShowHistory(!showHistory);
    };

    return (
        <div className="font-sans">
            {/* Current Month Budget Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-full">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Monthly Budget</h3>
                            {!isEditingBudget && (
                                <button
                                    onClick={() => setIsEditingBudget(true)}
                                    className="text-blue-600 hover:text-blue-700 text-xs font-bold px-2 py-1 bg-blue-50 rounded-md transition-colors"
                                >
                                    {monthlyBudget > 0 ? 'Edit Budget' : 'Set Budget'}
                                </button>
                            )}
                        </div>
                        {isEditingBudget ? (
                            <div className="flex gap-2 items-center mt-2 w-full animate-fade-in">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                                    <input
                                        type="number"
                                        value={newBudget}
                                        onChange={(e) => setNewBudget(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 border-2 border-blue-100 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    onClick={handleSaveBudget}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsEditingBudget(false)}
                                    className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    <Target className="w-5 h-5 rotate-45" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-baseline gap-2 cursor-pointer group" onClick={() => setIsEditingBudget(true)}>
                                <span className="text-3xl font-black text-slate-800">₹{monthlyBudget.toLocaleString()}</span>
                                <Target className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-end mb-1">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Spent</p>
                        <span className={`text-lg font-black ${isOverBudget ? 'text-red-500' : 'text-blue-600'}`}>
                            ₹{currentMonthTotal.toLocaleString()}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`absolute top-0 left-0 h-full transition-all duration-1000 ${isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                            style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-right font-medium">
                        {budgetProgress.toFixed(1)}% used
                    </p>
                </div>

                {isOverBudget && (
                    <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg font-bold border border-red-100 mb-2">
                        ⚠️ You have exceeded your budget!
                    </div>
                )}
            </div>

            {/* Past Budgets Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mt-4">
                <button
                    onClick={toggleHistory}
                    className="w-full flex justify-between items-center text-slate-600 hover:text-slate-800 font-bold text-sm transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-400" />
                        Past Budgets
                    </span>
                    {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showHistory && (
                    <div className="mt-4 space-y-3 animate-fade-in">
                        {loadingHistory ? (
                            <div className="text-center py-4 text-slate-400 text-xs">Loading history...</div>
                        ) : historyData.length > 0 ? (
                            historyData.filter(item => !(item.month === new Date().toLocaleString('default', { month: 'short' }) && item.year === new Date().getFullYear())).map((month, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${month.spent > month.budget ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
                                            {month.spent > month.budget ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">{month.month} {month.year}</p>
                                            <p className="text-xs text-slate-400 font-medium">Budget: ₹{month.budget.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500 font-medium">Spent: ₹{month.spent.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${month.spent > month.budget ? 'text-red-500' : 'text-green-600'}`}>
                                            {month.spent > month.budget ? '-' : '+'}₹{Math.abs(month.budget - month.spent).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {month.spent > month.budget ? 'Overspent' : 'Saved'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-slate-400 text-xs">No past budget history available.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetTracker;
