import React, { useState, useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    LabelList,
} from "recharts";
import { CATEGORIES, getCategoryConfig } from "../utils/constants";
import {
    format,
    subDays,
    startOfMonth,
    eachDayOfInterval,
    isSameDay,
} from "date-fns";
import { TrendingUp, Download } from "lucide-react";


const Analytics = ({ expenses }) => {
    // 1. Spending Trend (Last 30 Days)
    const trendData = useMemo(() => {
        const end = new Date();
        const start = subDays(end, 30);
        const days = eachDayOfInterval({ start, end });

        return days.map((day) => {
            const dailyTotal = expenses
                .filter((exp) => isSameDay(new Date(exp.date), day))
                .reduce((sum, exp) => sum + exp.amount, 0);

            return {
                date: format(day, "MMM d"),
                amount: dailyTotal / 100,
            };
        });
    }, [expenses]);

    // 2. Category Breakdown
    const categoryData = useMemo(() => {
        const summary = {};
        expenses.forEach((exp) => {
            if (!summary[exp.category]) summary[exp.category] = 0;
            summary[exp.category] += exp.amount;
        });

        return Object.entries(summary)
            .map(([name, value]) => ({ name, value: value / 100 }))
            .sort((a, b) => b.value - a.value);
    }, [expenses]);

    const COLORS = [
        "#2563eb",
        "#16a34a",
        "#d97706",
        "#dc2626",
        "#7c3aed",
        "#db2777",
        "#4f46e5",
    ];

    // 3. Removed Budget Logic (Moved to BudgetTracker)

    // 4. Export CSV
    const handleExport = () => {
        const headers = ["Date", "Category", "Description", "Amount (INR)"];

        const rows = expenses.map((exp) => {
            let dateStr = "N/A";
            try {
                if (exp.date) dateStr = format(new Date(exp.date), "yyyy-MM-dd");
            } catch (e) {
                console.error("Date error", e);
            }

            // Escape description quotes logic
            const safeDesc = exp.description
                ? `"${exp.description.replace(/"/g, '""')}"`
                : '""';
            return [
                dateStr,
                exp.category,
                safeDesc,
                (exp.amount / 100).toFixed(2),
            ].join(",");
        });

        const csvContent =
            "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `expenses_export_${format(new Date(), "yyyy-MM-dd")}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 mt-8 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    Analytics & Goals
                </h2>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-md"
                >
                    <Download className="w-4 h-4" />
                    Export Report
                </button>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Trend */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[350px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-slate-700 font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Spending Trend
                        </h3>
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                            Last 30 Days
                        </span>
                    </div>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f1f5f9"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                                    axisLine={false}
                                    tickLine={false}
                                    minTickGap={30}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "16px",
                                        border: "none",
                                        boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                                        padding: "12px",
                                    }}
                                    formatter={(value) => [`₹${value}`, "Spent"]}
                                    cursor={{
                                        stroke: "#3b82f6",
                                        strokeWidth: 1,
                                        strokeDasharray: "5 5",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Bar Chart */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[350px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-slate-700 font-bold">Category Breakdown</h3>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={categoryData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                                barCategoryGap={20}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                    stroke="#f1f5f9"
                                />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }}
                                    width={90}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: "#f8fafc", radius: 8 }}
                                    contentStyle={{
                                        borderRadius: "16px",
                                        border: "none",
                                        boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                                        padding: "12px",
                                    }}
                                    formatter={(value) => [`₹${value.toFixed(2)}`, "Spent"]}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[0, 8, 8, 0]}
                                    barSize={28}
                                    animationDuration={1500}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                    <LabelList
                                        dataKey="value"
                                        position="right"
                                        formatter={(value) => `₹${value.toLocaleString()}`}
                                        style={{
                                            fontSize: "11px",
                                            fill: "#64748b",
                                            fontWeight: 700,
                                        }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Analytics;
