import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    TrendingUp,
    PieChart,
    Calendar,
    Settings,
    LogOut,
    Wallet
} from 'lucide-react';
import { cn } from '../utils/cn';
import { ThemeToggle } from './ThemeToggle';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isPinned, setIsPinned] = useState(false);
    const isExpanded = isPinned;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Expenses', path: '/expenses', icon: TrendingUp },
        { name: 'Analytics', path: '/analytics', icon: PieChart },
        { name: 'Plans', path: '/plans', icon: Calendar },
    ];

    return (
        <div className="min-h-screen bg-[#f4f7fb] dark:bg-slate-900 flex text-slate-800 dark:text-slate-100 font-sans relative overflow-hidden">
            {/* Soft top-right gradient blob globally */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#dbe8fc] via-[#e2ebfa]/50 to-transparent dark:from-blue-900/30 dark:via-transparent pointer-events-none blur-[80px] z-0"></div>

            {/* Sidebar - Fixed Left */}
            <aside
                className={cn(
                    "bg-[#Eef0f6] dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto transition-all duration-300 ease-in-out z-40 whitespace-nowrap",
                    isExpanded ? "w-64" : "w-20 items-center"
                )}
            >
                {/* Logo Section */}
                <div
                    className={cn("p-6 flex items-center gap-3 cursor-pointer transition-all", !isExpanded && "justify-center px-0 w-full")}
                    onClick={() => setIsPinned(!isPinned)}
                >
                    <div className="bg-blue-600 text-white p-2 rounded-xl shadow-sm min-w-10 flex justify-center items-center shrink-0">
                        <Wallet className="w-6 h-6" />
                    </div>
                    {isExpanded && <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight animate-fade-in">ExpenseTracker</span>}
                </div>

                {/* Navigation Section */}
                <div className={cn("flex-1 mt-2 transition-all", isExpanded ? "px-4" : "px-2 w-full")}>
                    {isExpanded && <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-3 animate-fade-in">Analytics</p>}
                    <nav className="space-y-2 block relative">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                title={!isExpanded ? link.name : ""}
                                className={({ isActive }) => cn(
                                    "flex items-center rounded-xl font-medium transition-all duration-200 overflow-hidden",
                                    isExpanded ? "gap-3 px-3 py-2.5" : "justify-center p-3 mx-auto w-12 h-12",
                                    isActive
                                        ? "bg-white dark:bg-slate-800 text-[#4d73b8] dark:text-blue-400 shadow-sm border-r-4 border-[#4d73b8]"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200",
                                    !isExpanded && isActive && "border-r-0 border-l-4"
                                )}
                            >
                                <link.icon className="w-5 h-5 shrink-0" />
                                {isExpanded && <span className="animate-fade-in">{link.name}</span>}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* User / Settings Profile Area */}
                <div className={cn("mt-auto mb-4 border-t border-slate-200 dark:border-slate-800/50 transition-all", isExpanded ? "p-4" : "p-2 items-center flex flex-col")}>
                    {isExpanded ? (
                        <div className="flex items-center justify-between px-2 mb-4 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden ring-2 ring-white dark:ring-slate-800 shrink-0">
                                    <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name?.split(' ')[0]}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.name?.split(' ')[1] || 'User'}</p>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 mb-4 mt-4 animate-fade-in">
                            <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden ring-2 ring-white dark:ring-slate-800 shrink-0">
                                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <ThemeToggle />
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        title={!isExpanded ? "Logout" : ""}
                        className={cn("flex items-center text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-medium text-sm overflow-hidden",
                            isExpanded ? "w-full gap-3 px-3 py-2" : "justify-center p-3 mx-auto w-12 h-12"
                        )}
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {isExpanded && <span className="animate-fade-in">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full min-w-0 flex flex-col transition-all duration-300">
                {/* Mobile Header (Only visible on small screens) */}
                <div className="md:hidden sticky top-0 z-50 flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                        <div className="bg-blue-600 text-white p-1 rounded-md">
                            <Wallet className="w-5 h-5" />
                        </div>
                        ExpenseTracker
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button className="text-slate-500 focus:outline-none">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Children Rendered Here */}
                <div className="flex-1 overflow-x-hidden p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
