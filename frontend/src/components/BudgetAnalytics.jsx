import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { getBudgetAnalytics } from '../services/api';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const BudgetAnalytics = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getBudgetAnalytics();
                // Reverse to show oldest to newest? No, backend sends newest to oldest?
                // Backend loop: i=5 (oldest) to 0 (current). 
                // Ah, backend pushes in order: 5 months ago -> ... -> current month.
                // So result is already sorted Oldest -> Newest. Good for charts.
                setData(result);
            } catch (error) {
                console.error("Failed to fetch budget analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl"></div>;

    // Last Month Analysis (2nd to last item, since last item is current month)
    const lastMonth = data.length > 1 ? data[data.length - 2] : null;

    return (
        <div className="space-y-6 mt-8 animate-fade-in-up">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                Budget History
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Last Month Summary Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-slate-500 font-bold text-sm mb-4 uppercase tracking-wider">Last Month ({lastMonth?.month})</h3>

                    {lastMonth ? (
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <span className="text-3xl font-bold text-slate-800">₹{lastMonth.spent.toLocaleString()}</span>
                                    <span className="text-sm text-slate-400 ml-2 font-medium">/ ₹{lastMonth.budget.toLocaleString()}</span>
                                </div>
                                <div className={`p-2 rounded-full ${lastMonth.spent > lastMonth.budget ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {lastMonth.spent > lastMonth.budget ? <AlertCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                                </div>
                            </div>

                            <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                                <div
                                    className={`h-2 rounded-full ${lastMonth.spent > lastMonth.budget ? 'bg-red-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min((lastMonth.spent / lastMonth.budget) * 100, 100)}%` }}
                                ></div>
                            </div>

                            <p className="text-sm font-medium text-slate-500">
                                {lastMonth.spent > lastMonth.budget
                                    ? `You exceeded your budget by ₹${(lastMonth.spent - lastMonth.budget).toLocaleString()}`
                                    : `You saved ₹${(lastMonth.budget - lastMonth.spent).toLocaleString()} last month!`
                                }
                            </p>
                        </div>
                    ) : (
                        <p className="text-slate-400">No data available for last month.</p>
                    )}
                </div>

                {/* History Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[300px]">
                    <h3 className="text-slate-700 font-bold mb-6">6-Month Budget vs Spending</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} barGap={0} barCategoryGap={20} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    tickFormatter={(val) => `₹${val / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`₹${value.toLocaleString()}`]}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="budget" name="Budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="spent" name="Spent" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetAnalytics;
