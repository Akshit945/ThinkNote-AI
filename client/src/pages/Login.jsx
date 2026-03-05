import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                email,
                password,
            });
            localStorage.setItem('token', data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login Failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-slate-900 bg-surface-50">
            {/* Left side - form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full max-w-xl mx-auto lg:mx-0 bg-white shadow-2xl lg:shadow-none z-10 relative">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-brand-600 p-1.5 rounded-lg">
                            <BookOpen className="text-white h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                            ThinkNote AI
                        </span>
                    </div>

                    <h2 className="mt-6 text-3xl font-display font-bold tracking-tight text-slate-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500 transition-colors">
                            Sign up for free
                        </Link>
                    </p>

                    <div className="mt-8">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
                                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium leading-6 text-slate-900">
                                    Email address
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 transition-all bg-white hover:bg-slate-50 focus:bg-white"
                                        placeholder="you@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium leading-6 text-slate-900">
                                        Password
                                    </label>
                                    <div className="text-sm">
                                        {/* <a href="#" className="font-medium text-brand-600 hover:text-brand-500">
                                            Forgot password?
                                        </a> */}
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 transition-all bg-white hover:bg-slate-50 focus:bg-white"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full justify-center rounded-lg bg-brand-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <span className={`absolute inset-0 w-full h-full bg-white/20 -translate-x-full ${!isLoading ? 'group-hover:translate-x-full' : ''} transition-transform duration-500 ease-out z-0`} />
                                <span className="relative z-10">{isLoading ? 'Signing in...' : 'Sign in'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right side - visual */}
            <div className="hidden lg:relative lg:flex lg:flex-1 lg:items-center lg:justify-center bg-slate-50 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-br from-slate-100 hover:from-brand-50 transition-colors duration-1000"></div>
                </div>

                {/* Decorative blobs */}
                <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow"></div>
                <div className="absolute top-[30%] right-[20%] w-72 h-72 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow [animation-delay:2s]"></div>

                <div className="relative z-10 p-12 max-w-lg text-center">
                    <h3 className="text-3xl font-display font-bold tracking-tight text-slate-900 mb-6">
                        Dive into your data
                    </h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Log in to access your curated notebooks, instantly query complex documents, and accelerate your research workflow with precision AI indexing.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
