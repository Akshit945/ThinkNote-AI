import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                username,
                email,
                password,
            });
            localStorage.setItem('token', data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration Failed');
            setIsLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                email: 'guest@thinknote.ai',
                password: 'Guest123',
            });
            localStorage.setItem('token', data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Guest Login Failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-slate-900 bg-surface-50">
            {/* Left side - visual */}
            <div className="hidden lg:relative lg:flex lg:flex-1 lg:items-center lg:justify-center bg-slate-50 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-tr from-slate-100 hover:from-brand-50 transition-colors duration-1000"></div>
                </div>

                {/* Decorative blobs */}
                <div className="absolute bottom-[20%] left-[20%] w-72 h-72 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow"></div>
                <div className="absolute top-[20%] right-[30%] w-72 h-72 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow [animation-delay:2s]"></div>

                <div className="relative z-10 p-12 max-w-lg text-center">
                    <h3 className="text-3xl font-display font-bold tracking-tight text-slate-900 mb-6">
                        Start building your knowledge
                    </h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Create your free account to start organizing your PDFs, articles, and videos into intelligent, conversational notebooks instantly.
                    </p>
                </div>
            </div>

            {/* Right side - form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full max-w-xl mx-auto lg:mx-0 bg-white shadow-2xl lg:shadow-none z-10 relative">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-8 group">
                        <ArrowRight className="h-4 w-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>

                    <Link to="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity w-fit">
                        <div className="flex items-center justify-center">
                            <img src="/logo.png" alt="ThinkNote AI Logo" className="h-8 w-8 object-contain" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                            ThinkNote AI
                        </span>
                    </Link>

                    <h2 className="mt-6 text-3xl font-display font-bold tracking-tight text-slate-900">
                        Create an account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500 transition-colors">
                            Sign in here
                        </Link>
                    </p>

                    <div className="mt-8">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
                                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium leading-6 text-slate-900">
                                    Username
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 transition-all bg-white hover:bg-slate-50 focus:bg-white"
                                        placeholder="johndoe"
                                        required
                                    />
                                </div>
                            </div>

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
                                <label className="block text-sm font-medium leading-6 text-slate-900">
                                    Password
                                </label>
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
                                className="flex w-full justify-center rounded-lg bg-brand-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden mt-2"
                            >
                                <span className={`absolute inset-0 w-full h-full bg-white/20 -translate-x-full ${!isLoading ? 'group-hover:translate-x-full' : ''} transition-transform duration-500 ease-out z-0`} />
                                <span className="relative z-10">{isLoading ? 'Creating account...' : 'Create account'}</span>
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-2 text-slate-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={handleGuestLogin}
                                    disabled={isLoading}
                                    className="flex w-full justify-center rounded-lg bg-white px-3 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    Log in as Guest
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
