import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

function Settings() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col gap-6 animate-fade-in-up pb-10 max-w-3xl mx-auto w-full">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your account and viewing preferences.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Profile Reference</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-slate-800 dark:text-white">{user?.name}</p>
                            <p className="text-slate-500 text-sm">{user?.email}</p>
                        </div>
                    </div>
                </div>
                <hr className="border-slate-100 dark:border-slate-700" />
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex justify-between items-center">
                        <span>Appearance</span>
                        <ThemeToggle />
                    </h3>
                    <p className="text-slate-500 text-sm">Toggle between automatic system preference, dark theme, or light theme seamlessly.</p>
                </div>
            </div>
        </div>
    )
}

export default Settings;
