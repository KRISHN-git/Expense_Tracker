
import {
    ShoppingBag,
    Utensils,
    Car,
    Zap,
    Clapperboard,
    HeartPulse,
    MoreHorizontal,
    Home,
    Briefcase,
    TrendingUp,
    Shirt,
    GraduationCap,
    Plane
} from 'lucide-react';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const CATEGORIES = [
    { id: 'Food', label: 'Food & Dining', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-100' },
    { id: 'Groceries', label: 'Groceries', icon: ShoppingBag, color: 'text-green-500', bg: 'bg-green-100' },
    { id: 'Transport', label: 'Transport', icon: Car, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'Utilities', label: 'Utilities', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { id: 'Rent', label: 'Rent/Housing', icon: Home, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    { id: 'Entertainment', label: 'Entertainment', icon: Clapperboard, color: 'text-purple-500', bg: 'bg-purple-100' },
    { id: 'Healthcare', label: 'Healthcare', icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-100' },
    { id: 'Shopping', label: 'Shopping', icon: Shirt, color: 'text-pink-500', bg: 'bg-pink-100' },
    { id: 'Education', label: 'Education', icon: GraduationCap, color: 'text-sky-500', bg: 'bg-sky-100' },
    { id: 'Travel', label: 'Travel', icon: Plane, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'Income', label: 'Income', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { id: 'Investment', label: 'Investment', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { id: 'Other', label: 'Other', icon: MoreHorizontal, color: 'text-slate-500', bg: 'bg-slate-100' },
];

export const getCategoryConfig = (id) => {
    return CATEGORIES.find(c => c.id === id) || CATEGORIES.find(c => c.id === 'Other');
};
