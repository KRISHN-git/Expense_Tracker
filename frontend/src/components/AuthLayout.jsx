import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthLayout = () => {
    const location = useLocation();
    // Determine isLogin based on path (true for /login, false for /signup)
    // Default to true if not strictly signup (e.g. root treated as login redirect)
    const isLogin = location.pathname === '/login' || location.pathname === '/';

    return (
        <div className="min-h-screen lg:h-screen flex bg-white font-sans text-slate-800 lg:overflow-hidden relative">
            {/* Left Panel - Dark / Brand */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0f172a] text-white flex-col justify-center items-center p-12 relative overflow-hidden">
                {/* Background Decor - Animated Circles */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full pointer-events-none"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -45, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute top-1/3 left-1/3 w-[500px] h-[500px] border border-blue-500/10 rounded-full pointer-events-none"
                />
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-20 right-20 w-[300px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"
                />

                {/* Center Content */}
                <div className="z-10 relative flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-8 w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/50"
                    >
                        <TrendingUp className="w-12 h-12 text-white" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl lg:text-7xl font-bold tracking-tight mb-4 text-white"
                    >
                        Track your <br /> <span className="text-blue-500">money</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-slate-400 text-lg max-w-md mt-6 leading-relaxed"
                    >
                        Effortlessly manage your expenses and savings in one place. No clutter, just control.
                    </motion.p>
                </div>

                {/* Bottom Decor */}
                <div className="absolute bottom-12 text-xs text-slate-600 tracking-widest uppercase">
                    Smart Financial Management
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full lg:w-1/2 flex flex-col relative h-full bg-slate-50/50">
                {/* Header */}
                <div className="p-4 sm:p-6 flex justify-between items-center absolute top-0 w-full z-20">
                    <Link to="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-800 hover:text-blue-600 transition-colors">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="hidden min-[475px]:inline">ExpenseTracker</span>
                    </Link>

                    {/* Back to Home Button */}
                    <Link to="/" className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-white backdrop-blur-sm">
                        <span className="hidden min-[475px]:inline">Back to Home</span>
                        <span className="min-[475px]:hidden">Home</span>
                    </Link>
                </div>

                {/* Center Content - Form */}
                <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 w-full max-w-lg mx-auto overflow-y-auto max-h-screen no-scrollbar">

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="w-full bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
                    >
                        {/* Custom Toggle (No Animation) */}
                        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                            <Link
                                to="/login"
                                className={`flex-1 py-2.5 text-center text-sm font-bold rounded-lg transition-colors duration-200 ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/signup"
                                className={`flex-1 py-2.5 text-center text-sm font-bold rounded-lg transition-colors duration-200 ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Sign Up
                            </Link>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-1">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-slate-500 text-sm">
                                {isLogin ? 'Enter your details below' : 'Start your financial journey'}
                            </p>
                        </div>

                        {/* Render Child Routes (Forms) */}
                        <Outlet />
                    </motion.div>

                    <div className="mt-4 text-center text-xs text-slate-400">
                        &copy; 2025-2026 ExpenseTracker Inc.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
