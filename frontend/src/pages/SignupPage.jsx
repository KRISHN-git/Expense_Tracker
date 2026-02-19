import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { API_BASE_URL } from '../utils/constants';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signup(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = '/';
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Google login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout type="signup">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 flex items-center gap-2 animate-fade-in">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <div className="relative group">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full px-5 py-4 bg-slate-50 border border-transparent focus:bg-white border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-0 transition-all font-medium"
                            placeholder="Full Name"
                            required
                        />
                    </div>
                </div>

                <div>
                    <div className="relative group">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full px-5 py-4 bg-slate-50 border border-transparent focus:bg-white border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-0 transition-all font-medium"
                            placeholder="Email Address"
                            required
                        />
                    </div>
                </div>

                <div>
                    <div className="relative group">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-5 py-4 bg-slate-50 border border-transparent focus:bg-white border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-0 transition-all font-medium pr-12"
                            placeholder="Password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="text-xs text-slate-500 mt-2 mb-6 px-1">
                    By signing up, you agree to our <a href="#" className="underline hover:text-slate-800">Terms</a> and <a href="#" className="underline hover:text-slate-800">Privacy Policy</a>.
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.01] active:scale-[0.98]"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                </button>
            </form>

            <div className="mt-8 relative mb-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-400 font-medium">Or continue with</span>
                </div>
            </div>

            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google Login Failed')}
                    shape="circle"
                    size="large"
                    text="continue_with"
                    theme="outline"
                    width="300"
                />
            </div>
        </AuthLayout>
    );
};

export default SignupPage;
