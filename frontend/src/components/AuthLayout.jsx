import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Smartphone, ShieldCheck, Globe } from 'lucide-react';

const AuthLayout = ({ children, type = 'login' }) => {
    const location = useLocation();
    const isLogin = type === 'login';

    return (
        <div className="min-h-screen lg:h-screen flex bg-white font-sans text-slate-800 lg:overflow-hidden">
            {/* Left Panel - Dark / Brand */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a1a] text-white flex-col justify-center items-center p-12 relative overflow-hidden">
                {/* Background Decor - Subtle circles */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none"></div>

                {/* Center Content */}
                <div className="z-10 relative flex flex-col items-center text-center">
                    <div className="mb-8 w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/50">
                        <TrendingUp className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-4 text-white">
                        Track your <br /> <span className="text-blue-500">money</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md mt-6 leading-relaxed">
                        Effortlessly manage your expenses and savings in one place. No clutter, just control.
                    </p>
                </div>

                {/* Bottom Decor */}
                <div className="absolute bottom-12 text-xs text-slate-600 tracking-widest uppercase">
                    Smart Financial Management
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full lg:w-1/2 flex flex-col relative h-full">
                {/* Header */}
                <div className="p-6 flex justify-between items-center absolute top-0 w-full z-20">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:text-blue-600 transition-colors">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
                            {/* Use PieChart icon here to match landing page if imported, otherwise trending up is fine but let's stick to consistency */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pie-chart"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
                        </div>
                        ExpenseTracker
                    </Link>

                    {/* Back to Home Button (Requested) */}
                    <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
                        Back to Home
                    </Link>
                </div>

                {/* Center Content - Form */}
                <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 w-full max-w-lg mx-auto">

                    <div className="w-full mb-8">
                        {/* Toggle Switch */}
                        <div className="flex p-1 bg-slate-100 rounded-xl mb-8 relative">
                            <Link
                                to="/login"
                                className={`flex-1 py-3 text-center text-sm font-bold rounded-lg transition-all duration-200 z-10 ${isLogin ? 'text-blue-600 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/signup"
                                className={`flex-1 py-3 text-center text-sm font-bold rounded-lg transition-all duration-200 z-10 ${!isLogin ? 'text-blue-600 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Sign Up
                            </Link>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-slate-500 text-center mb-8">
                            {isLogin ? 'Enter your details to access your account' : 'Start your journey to better financial health'}
                        </p>

                        {children}
                    </div>

                    <div className="mt-auto py-6 text-center text-xs text-slate-400">
                        &copy; 2025-2026 ExpenseTracker Inc.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
