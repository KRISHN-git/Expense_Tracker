import React, { useState } from 'react';
import { Target, PlusCircle } from 'lucide-react';
import { cn } from '../utils/cn';

const AddIncomeWidget = ({ onAddIncome }) => {
    const [isAddingIncome, setIsAddingIncome] = useState(false);
    const [incomeAmount, setIncomeAmount] = useState('');
    const [incomeSource, setIncomeSource] = useState('Income');

    const handleSaveIncome = async () => {
        if (!incomeAmount || isNaN(incomeAmount) || parseFloat(incomeAmount) <= 0) return;

        // Prepare expense formatted as income
        const amountInPaise = Math.round(parseFloat(incomeAmount) * 100);
        const today = new Date();
        const localDate = today.toLocaleDateString('en-CA');

        const payload = {
            amount: amountInPaise,
            category: incomeSource,
            type: 'income',
            description: `Added Income: ${incomeSource}`,
            date: localDate,
            planId: null,
            splitBetween: []
        };

        await onAddIncome(payload);

        // Reset and close
        setIncomeAmount('');
        setIsAddingIncome(false);
    };

    return (
        <div className="font-sans">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-full">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Quick Income</h3>
                            {!isAddingIncome && (
                                <button
                                    onClick={() => setIsAddingIncome(true)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-bold px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-md transition-colors flex items-center gap-1"
                                >
                                    <PlusCircle className="w-3 h-3" />
                                    Add Income
                                </button>
                            )}
                        </div>
                        {isAddingIncome ? (
                            <div className="flex flex-col gap-3 mt-2 w-full animate-fade-in">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-lg">₹</span>
                                        <input
                                            type="number"
                                            value={incomeAmount}
                                            onChange={(e) => setIncomeAmount(e.target.value)}
                                            className="w-full pl-8 pr-4 py-2 border-2 border-blue-100 dark:border-blue-900/50 bg-white dark:bg-slate-950 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all text-sm"
                                            placeholder="Amount"
                                            autoFocus
                                        />
                                    </div>
                                    <select
                                        value={incomeSource}
                                        onChange={(e) => setIncomeSource(e.target.value)}
                                        className="border-2 border-blue-100 dark:border-blue-900/50 bg-white dark:bg-slate-950 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 text-sm px-3"
                                    >
                                        <option value="Income">Income</option>
                                    </select>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveIncome}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Save Income
                                    </button>
                                    <button
                                        onClick={() => setIsAddingIncome(false)}
                                        className="p-2.5 px-4 text-slate-500 dark:text-slate-400 font-bold text-sm hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-baseline gap-2 cursor-pointer group" onClick={() => setIsAddingIncome(true)}>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors">Click here to quickly log new income deposits.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddIncomeWidget;
