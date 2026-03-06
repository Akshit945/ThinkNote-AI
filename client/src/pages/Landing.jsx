import { Link } from 'react-router-dom';
import { BookOpen, Search, Zap, Shield, ArrowRight, Github, Sparkles, Youtube, AlignLeft, Bot, Globe } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-slate-200">
            {/* Navbar */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-200 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center">
                                <img src="/logo.png" alt="ThinkNote AI Logo" className="h-7 w-7 object-contain" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                                ThinkNote AI
                            </span>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
                        </div>

                        <div className="flex items-center gap-4">
                            {localStorage.getItem('token') ? (
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
                    {/* Decorative Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
                    <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
                        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-slate-200 to-slate-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="animate-fade-in inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wide mb-8 shadow-sm">
                            <Sparkles className="h-3 w-3" />
                            <span className="mt-0.5">Meet ThinkNote AI 2.0</span>
                        </div>

                        <h1 className="animate-slide-up mx-auto max-w-5xl font-display text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl">
                            The intelligent workspace for <span className="text-slate-500">deep research</span>
                        </h1>

                        <p className="animate-slide-up [animation-delay:200ms] mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                            Upload documents, parse YouTube videos, auto-generate quizzes, and converse with your data in real-time. Experience the most advanced RAG notebook.
                        </p>

                        <div className="animate-slide-up [animation-delay:400ms] mt-10 flex items-center justify-center gap-x-6">
                            {localStorage.getItem('token') ? (
                                <Link
                                    to="/dashboard"
                                    className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all w-full sm:w-auto"
                                >
                                    <span>Go to Dashboard</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/register"
                                        className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all w-full sm:w-auto"
                                    >
                                        <span>Start for free</span>
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    <Link
                                        to="/login"
                                        className="text-sm font-semibold leading-6 text-slate-900 hover:text-slate-600 transition-colors flex items-center gap-1"
                                    >
                                        Already have an account? <span aria-hidden="true">→</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Bento Grid */}
                <section id="features" className="py-24 bg-slate-50 border-y border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center mb-16">
                            <h2 className="text-sm font-bold leading-7 text-slate-400 uppercase tracking-widest">Platform Features</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need to master your content</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Feature 1 */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-6 border border-brand-100">
                                    <Search className="h-6 w-6 text-brand-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Live Web Search</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">Instantly research the web and pull live internet data directly into your notebook alongside your uploaded documents.</p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow lg:col-span-2">
                                <div className="flex flex-col sm:flex-row gap-6 items-center w-full">
                                    <div className="flex-1">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                                            <Globe className="h-6 w-6 text-slate-700" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Omni-Channel Imports</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">Import PDFs, scrape websites, parse YouTube videos, or input raw text. All seamlessly indexed into your private vector database.</p>
                                    </div>
                                    <div className="w-full sm:w-1/2 flex items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <div className="flex -space-x-3">
                                            <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center z-30 shadow-sm"><Globe className="h-5 w-5 text-slate-600" /></div>
                                            <div className="w-12 h-12 rounded-full border-2 border-white bg-red-50 flex items-center justify-center z-20 shadow-sm"><Youtube className="h-5 w-5 text-red-600" /></div>
                                            <div className="w-12 h-12 rounded-full border-2 border-white bg-sky-50 flex items-center justify-center z-10 shadow-sm"><BookOpen className="h-5 w-5 text-sky-600" /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Feature 3 */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                                    <Bot className="h-6 w-6 text-slate-700" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Advanced RAG Chat</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">Chat with a GPT-4o powered assistant that instantly cites exact sources and pages for every claim. No hallucinations.</p>
                            </div>

                            {/* Feature 4 */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                                    <Sparkles className="h-6 w-6 text-slate-700" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Auto-Generated Quizzes</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">Turn any collection of sources into an interactive 10-question multiple-choice quiz instantly. Test your knowledge.</p>
                            </div>

                            {/* Feature 5 */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                                    <AlignLeft className="h-6 w-6 text-slate-700" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Integrated Notes</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">A clean, auto-saving notepad right alongside your chat and sources. Never lose a valuable thought during your research.</p>
                            </div>

                            {/* Feature 6 */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow lg:col-span-3 flex flex-col sm:flex-row gap-8 items-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay">
                                <div className="flex-1">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                                        <Shield className="h-6 w-6 text-slate-700" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">Enterprise-Grade Controls</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">Daily token tracking, dynamic fallbacks to GPT-3.5-turbo, and strict security rules ensure your notebooks run flawlessly and affordably.</p>
                                </div>
                                <div className="w-full sm:w-[45%] bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-inner">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Daily Tokens</span>
                                        <span className="text-[11px] font-mono font-medium text-slate-500 bg-white px-2 py-1 rounded shadow-sm border border-slate-200">45.2k / 100k</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-800 w-[45%] rounded-full" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium mt-3 text-center">Metrics updated in real-time</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 bg-white relative overflow-hidden">
                    {/* Decorative Geometric Overlay for CTA */}
                    <div className="absolute inset-0 top-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
                    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-slate-400 opacity-20 blur-[100px]"></div>

                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">Ready to upgrade your workflow?</h2>
                        <p className="text-lg leading-8 text-slate-600 mb-10 max-w-2xl mx-auto">Join thousands of researchers, students, and professionals who use ThinkNote AI to synthesize information faster.</p>
                        {localStorage.getItem('token') ? (
                            <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-sm font-semibold text-white shadow-xl hover:bg-slate-800 transition-all">
                                Go to your Dashboard <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-sm font-semibold text-white shadow-xl hover:bg-slate-800 transition-all">
                                Create your free account <ArrowRight className="h-4 w-4" />
                            </Link>
                        )}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200">
                <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
                    <div className="flex justify-center space-x-6 md:order-2">
                        <a href="https://github.com/Akshit945/ThinkNote-AI" className="text-slate-400 hover:text-slate-900 transition-colors">
                            <span className="sr-only">GitHub</span>
                            <Github className="h-5 w-5" aria-hidden="true" />
                        </a>
                    </div>
                    <div className="mt-8 md:order-1 md:mt-0">
                        <p className="text-center text-xs leading-5 text-slate-500 font-medium">&copy; 2026 ThinkNote AI. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
