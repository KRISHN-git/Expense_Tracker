import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", isDestructive = true }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in transition-all duration-300">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 transform transition-all scale-100 animate-scale-up border border-slate-100">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg ${isDestructive ? 'bg-red-50 text-red-500 shadow-red-100' : 'bg-blue-50 text-blue-500 shadow-blue-100'}`}>
                        <AlertTriangle className="w-8 h-8" strokeWidth={2.5} />
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">{title}</h3>
                    <p className="text-slate-500 mb-8 text-base font-medium leading-relaxed px-2">{message}</p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3.5 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all duration-200 active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => { onConfirm(); onClose(); }}
                            className={`flex-1 px-4 py-3.5 rounded-2xl font-bold text-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95
                                ${isDestructive
                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                                }
                            `}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
