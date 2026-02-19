
import React from 'react';
import { Link } from 'react-router-dom';
import { PieChart, TrendingUp, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-slate-800">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-50 border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1 rounded-md">
                            <PieChart className="w-5 h-5" />
                        </div>
                        ExpenseTracker
                    </div>
                    <div className="space-x-3">
                        <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Login</Link>
                        <Link to="/signup" className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition">Get Started</Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-grow pt-24 pb-10 px-4 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-blue-200">
                        Smart Financial Tracker
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                        Track Your Money <br />
                        <span className="text-blue-600 drop-shadow-sm">Without the Effort</span>
                    </h1>
                    <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
                        The simplest way to track expenses and manage plans. No clutter, just clarity.
                    </p>
                    <div className="flex justify-center gap-3 mb-16">
                        <Link to="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-full text-base font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transform hover:-translate-y-0.5">
                            Start Tracking
                        </Link>
                        <Link to="/login" className="bg-white text-slate-700 border border-slate-200 px-8 py-3 rounded-full text-base font-bold hover:bg-slate-50 transition hover:border-blue-200 hover:text-blue-600">
                            Login
                        </Link>
                    </div>

                    {/* Features Compact Grid */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-md transition-all duration-300 text-left">
                            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-blue-600 shadow-sm">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold mb-1 text-slate-900">Track Daily</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Log expenses instantly. Visualize habits.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-md transition-all duration-300 text-left">
                            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-indigo-600 shadow-sm">
                                <PieChart className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold mb-1 text-slate-900">Plan Budgets</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Set goals for trips and events easily.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-md transition-all duration-300 text-left">
                            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-cyan-600 shadow-sm">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold mb-1 text-slate-900">Secure & Private</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Your data is yours. Always private.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Micro Footer */}
            <footer className="border-t border-slate-100 py-6 text-center">
                <p className="text-slate-400 text-sm font-medium">&copy; {new Date().getFullYear()} ExpenseTracker.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
