import React, { useState, useEffect } from 'react';
import Analytics from '../components/Analytics';
import BudgetTracker from '../components/BudgetTracker';
import AddIncomeWidget from '../components/AddIncomeWidget';
import { getExpenses, updateProfile, createExpense } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

function AnalyticsPage() {
    const [expenses, setExpenses] = useState([]);
    const { user, setUser } = useAuth();
    const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || 20000);

    useEffect(() => {
        if (user?.monthlyBudget) setMonthlyBudget(user.monthlyBudget);
        const fetchExps = async () => {
            try {
                const data = await getExpenses({ excludePlans: true });
                setExpenses(data.filter(e => !e.plan));
            } catch (e) { }
        };
        fetchExps();
    }, [user]);

    const handleAddIncome = async (payload) => {
        try {
            const uuid = uuidv4();
            const newIncome = await createExpense(payload, uuid);
            // Optimistically update chart data
            setExpenses(prev => [newIncome, ...prev]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateBudget = async (newAmount) => {
        try {
            const updatedUser = await updateProfile({ monthlyBudget: newAmount });
            setUser(prev => ({ ...prev, monthlyBudget: updatedUser.monthlyBudget }));
            setMonthlyBudget(updatedUser.monthlyBudget);
        } catch (err) {
            console.error("Budget fail", err);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in-up pb-10 max-w-7xl mx-auto w-full">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Detailed Analytics</h1>
                <p className="text-slate-500 text-sm mt-1">Deep dive into your financial behavior and monthly insights.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Actions & Configurations */}
                <div className="lg:col-span-1 w-full space-y-6">
                    <AddIncomeWidget onAddIncome={handleAddIncome} />
                    <BudgetTracker expenses={expenses} monthlyBudget={monthlyBudget} onUpdateBudget={handleUpdateBudget} />
                </div>
                <div className="lg:col-span-2">
                    <Analytics expenses={expenses} monthlyBudget={monthlyBudget} onUpdateBudget={handleUpdateBudget} />
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPage;
