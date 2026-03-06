import { Link } from 'react-router-dom';
import { BookOpen, Search, Zap, Shield, ArrowRight, Github } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-brand-600 p-1.5 rounded-lg">
                                <BookOpen className="text-white h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                                ThinkNote AI
                            </span>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Features</a>
                            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">How it Works</a>
                        </div>

                        <div className="flex items-center gap-4">
                            {localStorage.getItem('token') ? (
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 hover:shadow-md transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
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
                                        className="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 hover:shadow-md transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
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
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-slate-300 to-brand-300 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="animate-fade-in inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-semibold uppercase tracking-wide mb-8">
                            <Zap className="h-3 w-3" />
                            <span className="mt-0.5">Supercharge your learning</span>
                        </div>

                        <h1 className="animate-slide-up mx-auto max-w-4xl font-display text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl">
                            Talk to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-slate-400">documents</span> directly
                        </h1>

                        <p className="animate-slide-up [animation-delay:200ms] mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                            Upload PDFs, URLs, and YouTube videos. Ask questions and get instant answers backed by citations from your own data. The ultimate research companion.
                        </p>

                        <div className="animate-slide-up [animation-delay:400ms] mt-10 flex items-center justify-center gap-x-6">
                            {localStorage.getItem('token') ? (
                                <Link
                                    to="/dashboard"
                                    className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all w-full sm:w-auto overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                                    <span className="relative z-10">Go to Dashboard</span>
                                    <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/register"
                                        className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all w-full sm:w-auto overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                                        <span className="relative z-10">Start for free</span>
                                        <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    <Link
                                        to="/login"
                                        className="text-sm font-semibold leading-6 text-slate-900 hover:text-brand-600 transition-colors flex items-center gap-1"
                                    >
                                        View demo <span aria-hidden="true">→</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-slate-300 to-brand-300 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
                    </div>
                </section>

                {/* Mockup Section */}
                <section className="relative -mt-10 mb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="animate-fade-in [animation-delay:600ms] relative rounded-2xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:-m-4 lg:rounded-3xl lg:p-4 shadow-2xl overflow-hidden backdrop-blur-3xl">
                        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                            {/* Fake Browser App Topbar */}
                            <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="text-xs text-gray-400 font-medium">Notebook: Machine Learning Basics</div>
                                <div className="w-10"></div>
                            </div>
                            {/* Fake Chat Interface */}
                            <div className="flex-1 flex bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                                <div className="hidden sm:block w-64 border-r border-gray-100 bg-gray-50/30 p-4">
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sources</div>
                                    <div className="flex items-center gap-2 p-2 rounded-md bg-white border border-gray-200 shadow-sm mb-2 text-sm text-gray-700">
                                        <BookOpen className="h-4 w-4 text-brand-500" />
                                        <span className="truncate">Attention_Is_All_You_Need.pdf</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-md bg-transparent text-sm text-gray-600 hover:bg-gray-100 transition">
                                        <Zap className="h-4 w-4 text-orange-500" />
                                        <span className="truncate">Neural Networks Video</span>
                                    </div>
                                </div>
                                <div className="flex-1 p-6 flex flex-col justify-end gap-4 relative">
                                    <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 self-end max-w-md shadow-sm">
                                        <p className="text-sm text-slate-800">Can you explain transformers based on the uploaded paper?</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-2xl p-4 self-start max-w-xl shadow-sm">
                                        <p className="text-sm text-slate-700 leading-relaxed mb-2">Based on the "Attention Is All You Need" paper, a transformer is an architecture that relies entirely on an attention mechanism to draw global dependencies between input and output, eschewing recurrence and convolutions...</p>
                                        <div className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                                            Source: Page 2, Section 3.1
                                        </div>
                                    </div>

                                    {/* Fake input box */}
                                    <div className="mt-8 relative max-w-3xl w-full mx-auto">
                                        <div className="w-full bg-white border border-gray-300 rounded-full h-12 shadow-sm flex items-center px-4 gap-2 opacity-70">
                                            <Search className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-400">Ask a question about your documents...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 bg-surface-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-base font-semibold leading-7 text-brand-600 transition-all hover:tracking-wide cursor-default">Everything you need</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Streamline your research process</p>
                            <p className="mt-6 text-lg leading-8 text-slate-600">We provide the tools to extract, index, and query text from multiple formats instantly.</p>
                        </div>

                        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">

                                {/* Feature 1 */}
                                <div className="flex flex-col group p-6 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 border border-transparent hover:border-gray-100">
                                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-brand-600/10 group-hover:bg-brand-600 group-hover:scale-110 transition-all duration-300">
                                            <Zap className="h-5 w-5 text-brand-600 group-hover:text-white transition-colors" />
                                        </div>
                                        Vector Search
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                        <p className="flex-auto">Powered by Qdrant, find exact semantic matches across hundreds of pages in milliseconds.</p>
                                    </dd>
                                </div>

                                {/* Feature 2 */}
                                <div className="flex flex-col group p-6 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 border border-transparent hover:border-gray-100">
                                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-brand-600/10 group-hover:bg-brand-600 group-hover:scale-110 transition-all duration-300">
                                            <BookOpen className="h-5 w-5 text-brand-600 group-hover:text-white transition-colors" />
                                        </div>
                                        Multi-modal Input
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                        <p className="flex-auto">Upload PDFs, raw text,youtube or paste URLs to scrape directly into your knowledge base.</p>
                                    </dd>
                                </div>

                                {/* Feature 3 */}
                                <div className="flex flex-col group p-6 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 border border-transparent hover:border-gray-100">
                                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-brand-600/10 group-hover:bg-brand-600 group-hover:scale-110 transition-all duration-300">
                                            <Shield className="h-5 w-5 text-brand-600 group-hover:text-white transition-colors" />
                                        </div>
                                        Accurate Citations
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                        <p className="flex-auto">Every answer cites its sources so you can easily verify facts and trace information back to its origin.</p>
                                    </dd>
                                </div>

                            </dl>
                        </div>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100">
                <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
                    <div className="flex justify-center space-x-6 md:order-2">
                        <a href="https://github.com/Akshit945/ThinkNote-AI" className="text-gray-400 hover:text-gray-500 transition-colors">
                            <span className="sr-only">GitHub</span>
                            <Github className="h-5 w-5" aria-hidden="true" />
                        </a>
                    </div>
                    <div className="mt-8 md:order-1 md:mt-0">
                        <p className="text-center text-xs leading-5 text-gray-500">&copy; 2026 RAG Notebooks. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
