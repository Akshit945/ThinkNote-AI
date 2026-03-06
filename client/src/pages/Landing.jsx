import { Link } from 'react-router-dom';
import { BookOpen, Search, Zap, Shield, ArrowRight, Github, Sparkles, Youtube, AlignLeft, Bot, Globe, Brain } from 'lucide-react';

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
                            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How it Works</a>
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
                            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                                    <Brain className="h-6 w-6 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Long-Term AI Memory</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">Powered by Mem0, the assistant securely remembers your personal facts and preferences across all your notebooks globally.</p>
                            </div>

                            {/* Feature 7 - Enterprise */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow lg:col-span-2 flex flex-col sm:flex-row gap-8 items-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay">
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

                {/* How it Works Flowchart */}
                <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="mx-auto max-w-2xl text-center mb-20">
                            <h2 className="text-sm font-bold leading-7 text-slate-400 uppercase tracking-widest">Under the Hood</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">The ThinkNote Architecture</p>
                            <p className="mt-4 text-slate-600 text-lg">Our dual-pipeline system handles complex document indexing and employs a proprietary 9-step reasoning engine to eliminate hallucinations.</p>
                        </div>

                        {/* Phase 1: Source Insertion */}
                        <div className="mb-24">
                            <h3 className="text-xl font-bold text-slate-900 mb-8 border-l-4 border-brand-500 pl-4">Phase 1: Source Ingestion & Indexing</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                                {/* Connecting line for Desktop */}
                                <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -z-10 translate-y-3" />

                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:-translate-y-1 transition-transform">
                                    <div className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md inline-block mb-3">Step 1</div>
                                    <h4 className="font-bold text-slate-900">Multi-Modal Extraction</h4>
                                    <p className="text-xs text-slate-500 mt-2">Uploading PDFs, URLs, YouTube videos, Text, or Live Web Searches.</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:-translate-y-1 transition-transform">
                                    <div className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md inline-block mb-3">Step 2</div>
                                    <h4 className="font-bold text-slate-900">Parsing & Chunking</h4>
                                    <p className="text-xs text-slate-500 mt-2">LangChain recursively splits the raw text into semantically complete, overlapping chunks.</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:-translate-y-1 transition-transform">
                                    <div className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md inline-block mb-3">Step 3</div>
                                    <h4 className="font-bold text-slate-900">Vector Embedding</h4>
                                    <p className="text-xs text-slate-500 mt-2">OpenAI transcribes the text chunks into high-dimensional numerical vectors.</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:-translate-y-1 transition-transform">
                                    <div className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md inline-block mb-3">Step 4</div>
                                    <h4 className="font-bold text-slate-900">Qdrant Indexing</h4>
                                    <p className="text-xs text-slate-500 mt-2">Vectors are securely stored in a scalable vector database, uniquely linked to your Notebook.</p>
                                </div>
                            </div>
                        </div>

                        {/* Phase 2: RAG Pipeline */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-8 border-l-4 border-slate-800 pl-4">Phase 2: Proprietary 9-Step Advanced RAG</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">1</div>
                                        <h4 className="font-bold text-slate-900">Query Correction</h4>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">The AI analyzes your chat history to resolve pronouns and fix typos before searching.</p>
                                </div>

                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">2</div>
                                        <h4 className="font-bold text-slate-900">Query Expansion</h4>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">The engine hallucinates 5 distinct search queries encompassing various perspectives of the original query.</p>
                                </div>

                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">3</div>
                                        <h4 className="font-bold text-slate-900">HyDE Generation</h4>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">Hypothetical Document Embeddings: the AI drafts hypothetical answers to embed alongside the expanded queries.</p>
                                </div>

                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 border-l-brand-400 border-l-4 relative overflow-hidden">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold z-10">4</div>
                                        <h4 className="font-bold text-slate-900 z-10">Parallel Vector Search</h4>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed z-10 relative">We run concurrent similarity searches against the Qdrant database using every expanded query and HyDE passage simultaneously.</p>
                                    <div className="absolute top-0 right-0 -m-4 opacity-5"><Search className="h-24 w-24" /></div>
                                </div>

                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">5</div>
                                        <h4 className="font-bold text-slate-900">Deduplication</h4>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">Incoming semantic chunks are deduplicated by mapping exact metadata locators.</p>
                                </div>

                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">6</div>
                                        <h4 className="font-bold text-slate-900">Frequency Scoring</h4>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">Chunks discovered repetitively across multiple query permutations receive a statistical hybrid score boost.</p>
                                </div>

                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">7</div>
                                        <h4 className="font-bold text-slate-900">Pre-Filtering</h4>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">The pool of documents is aggressively filtered to preserve only the top 20 most relevant candidates to save token compute.</p>
                                </div>

                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 border-l-brand-400 border-l-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">8</div>
                                        <h4 className="font-bold text-slate-900">AI Re-Ranking</h4>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">A specialized Language Model interprets the contextual relevance of the final candidate pool, scoring each strictly from 1-10.</p>
                                </div>

                                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-indigo-600 opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
                                    <div className="flex items-center gap-3 mb-3 relative z-10">
                                        <div className="h-8 w-8 rounded-full bg-white text-slate-900 flex items-center justify-center text-sm font-bold">9</div>
                                        <h4 className="font-bold text-white">Generation & Citations</h4>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed relative z-10">GPT-4o forms exactly 8 highly accurate context blocks into a structured prompt, guaranteeing verifiable answers mapped to specific pages.</p>
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
