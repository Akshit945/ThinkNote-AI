import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Plus, FileText, Globe, Youtube, AlignLeft, Send, Loader2, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const NotebookDetail = () => {
    const { id } = useParams();
    const [notebook, setNotebook] = useState(null);
    const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
    const [viewingSourceText, setViewingSourceText] = useState(null);
    const [selectedSources, setSelectedSources] = useState([]);

    // Source states
    const [sourceType, setSourceType] = useState('pdf'); // pdf, url, youtube, text
    const [sourceTitle, setSourceTitle] = useState('');
    const [sourceContent, setSourceContent] = useState('');
    const [sourceFile, setSourceFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Chat states
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your notebook assistant. Ask me anything based on the sources you have uploaded.' }
    ]);
    const [query, setQuery] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchNotebookDetails();
        fetchChatHistory();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchNotebookDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/notebooks/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotebook(data);
            if (data.sources) {
                // Default to all sources selected
                setSelectedSources(data.sources.map(s => s._id));
            }
        } catch (err) {
            console.error('Fetch notebook details error:', err);
        }
    };

    const toggleSourceSelection = (e, sourceId) => {
        e.stopPropagation();
        setSelectedSources(prev =>
            prev.includes(sourceId)
                ? prev.filter(id => id !== sourceId)
                : [...prev, sourceId]
        );
    };

    const fetchChatHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data && data.length > 0) {
                setMessages(data);
            }
        } catch (err) {
            console.error('Fetch chat history error:', err);
        }
    };

    const handleViewSource = (source, pageNumber = null) => {
        if (!source) return;
        if (source.type === 'text') {
            setViewingSourceText(source);
        } else if (source.content) {
            let url = source.content;
            if (source.type === 'pdf' && pageNumber) {
                url = `${url}#page=${pageNumber}`;
            }
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleViewSourceByMetadata = (sourceMetadata) => {
        const fullSource = notebook?.sources?.find(s => s._id === sourceMetadata.sourceId);
        if (fullSource) {
            handleViewSource(fullSource, sourceMetadata.loc?.pageNumber);
        }
    };

    const handleAddSource = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('type', sourceType);
            formData.append('title', sourceTitle);

            if (sourceType === 'pdf') {
                formData.append('file', sourceFile);
            } else {
                formData.append('content', sourceContent);
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/api/sources/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setIsSourceModalOpen(false);
            setSourceTitle('');
            setSourceContent('');
            setSourceFile(null);
            fetchNotebookDetails();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to add source');
        } finally {
            setIsUploading(false);
        }
    };

    const handleChat = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMessage = { role: 'user', content: query };
        setMessages(prev => [...prev, userMessage]);
        setQuery('');
        setIsThinking(true);

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/${id}`, {
                query: userMessage.content,
                selectedSources
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.answer,
                sources: data.sources // Can be displayed later if needed
            }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Error: Failed to process query.'
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    if (!notebook) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-50">
                <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-surface-50">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-slate-400 hover:text-brand-600 hover:bg-brand-50 p-2 rounded-full transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold font-display text-slate-900 leading-tight tracking-tight">{notebook.title}</h1>
                        <span className="text-xs font-medium text-slate-500">{notebook.sources?.length || 0} sources configured</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Decorative Background grid elements */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

                {/* Left Sidebar - Sources */}
                <aside className="w-80 border-r border-slate-200 bg-white flex flex-col hidden md:flex z-10 shadow-sm relative">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="font-bold font-display text-slate-900">Knowledge Base</h2>
                        <button
                            onClick={() => setIsSourceModalOpen(true)}
                            className="p-1.5 bg-brand-100 text-brand-700 rounded-lg hover:bg-brand-200 transition-colors shadow-sm"
                            title="Add Source"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {notebook.sources?.length === 0 ? (
                            <div className="text-sm text-center mt-10 p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500 font-medium">No sources added yet.</p>
                                <button onClick={() => setIsSourceModalOpen(true)} className="text-brand-600 font-semibold hover:underline mt-2 inline-flex items-center gap-1"><Plus className="h-3 w-3" />Add Source</button>
                            </div>
                        ) : (
                            notebook.sources?.map((source) => (
                                <div key={source._id} onClick={() => handleViewSource(source)} className={`bg-white p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 cursor-pointer group ${selectedSources.includes(source._id) ? 'border-brand-400 bg-brand-50/30 shadow-sm ring-1 ring-brand-400/20' : 'border-slate-200 hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5'}`}>
                                    <div className="pt-0.5 relative z-10" onClick={(e) => toggleSourceSelection(e, source._id)}>
                                        <input type="checkbox" checked={selectedSources.includes(source._id)} onChange={() => { }} className="cursor-pointer h-4 w-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 transition-colors" />
                                    </div>
                                    <div className={`p-2 rounded-lg flex-shrink-0 transition-colors ${source.type === 'pdf' ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-100' :
                                        source.type === 'url' ? 'bg-sky-50 text-sky-600 group-hover:bg-sky-100' :
                                            source.type === 'youtube' ? 'bg-red-50 text-red-600 group-hover:bg-red-100' :
                                                'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                                        }`}>
                                        {source.type === 'pdf' && <FileText className="h-4 w-4" />}
                                        {source.type === 'url' && <Globe className="h-4 w-4" />}
                                        {source.type === 'youtube' && <Youtube className="h-4 w-4" />}
                                        {source.type === 'text' && <AlignLeft className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-700 transition-colors">{source.title}</p>
                                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-1">{source.type}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Main Content - Chat Area */}
                <main className="flex-1 flex flex-col bg-transparent relative z-10 w-full">
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                        <div className="max-w-3xl mx-auto space-y-8 pb-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''} animate-slide-up`} style={{ animationDelay: `${index * 50}ms` }}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border border-brand-200">
                                            <Bot className="h-5 w-5 text-brand-600" />
                                        </div>
                                    )}
                                    <div className={`
                    max-w-[85%] rounded-2xl p-5 shadow-sm text-[15px]
                    ${msg.role === 'user'
                                            ? 'bg-brand-600 text-white rounded-tr-sm shadow-brand-500/20 shadow-lg'
                                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm leading-relaxed shadow-lg shadow-slate-200/40'
                                        }
                  `}>
                                        <div className="prose prose-sm md:prose-base max-w-none">
                                            {msg.role === 'user' ? (
                                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                            ) : (
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-3 space-y-1" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-3 space-y-1" {...props} />,
                                                        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                        p: ({ node, ...props }) => <p className="mb-4 last:mb-0 leading-relaxed text-slate-700" {...props} />,
                                                        h1: ({ node, ...props }) => <h1 className="text-xl font-bold font-display text-slate-900 my-4" {...props} />,
                                                        h2: ({ node, ...props }) => <h2 className="text-lg font-bold font-display text-slate-900 my-3" {...props} />,
                                                        h3: ({ node, ...props }) => <h3 className="text-base font-bold font-display text-slate-900 my-2" {...props} />,
                                                        code: ({ node, inline, ...props }) => inline ? <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-slate-200" {...props} /> : <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-x-auto my-4 text-[13px] font-mono shadow-inner"><code {...props} /></pre>,
                                                        a: ({ node, ...props }) => <a className="text-brand-600 hover:text-brand-700 hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900" {...props} />,
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            )}
                                        </div>

                                        {/* Render Source metadata if it's an assistant response with sources */}
                                        {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <p className="text-[11px] font-semibold text-slate-400 mb-2.5 uppercase tracking-widest flex items-center gap-1.5"><FileText className="h-3 w-3" /> Sources Cited</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.from(new Map(msg.sources.map(s => {
                                                        const label = s.title + (s.loc?.pageNumber ? ` - Page ${s.loc.pageNumber}` : '');
                                                        return [label, { ...s, displayLabel: label }];
                                                    })).values()).map((sourceMetadata, i) => (
                                                        <span key={i} onClick={() => handleViewSourceByMetadata(sourceMetadata)} className="inline-flex items-center px-2.5 py-1.5 rounded-lg font-medium text-[11px] bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 cursor-pointer transition-colors shadow-sm active:scale-95 hover:shadow">
                                                            {sourceMetadata.displayLabel}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border border-slate-300">
                                            <User className="h-5 w-5 text-slate-600" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isThinking && (
                                <div className="flex gap-4 animate-fade-in">
                                    <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 shadow-sm border border-brand-200 mt-1">
                                        <Bot className="h-5 w-5 text-brand-600" />
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 w-24 flex items-center justify-center gap-1.5 shadow-md">
                                        <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 md:p-6 w-full z-20 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
                        <div className="max-w-3xl mx-auto relative flex items-center bg-white border border-slate-300 rounded-2xl shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all duration-300 pr-2 pl-5 py-2 overflow-hidden hover:shadow-md">
                            <input
                                type="text"
                                className="flex-1 bg-transparent py-2.5 px-2 focus:outline-none text-[15px] text-slate-900 placeholder-slate-400 disabled:opacity-50 font-medium"
                                placeholder={selectedSources.length === 0 ? "Select at least one source to chat..." : "Ask your notebook anything..."}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleChat(e); }}
                                disabled={isThinking || isUploading || selectedSources.length === 0}
                            />
                            <button
                                onClick={handleChat}
                                disabled={!query.trim() || isThinking || isUploading || selectedSources.length === 0}
                                className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 text-white p-3 rounded-xl transition-all shadow-sm ml-2 flex items-center justify-center active:scale-95"
                            >
                                <Send className="h-4 w-4 ml-0.5" />
                            </button>
                        </div>
                        <div className="text-center mt-3">
                            <span className="text-[11px] text-slate-400 font-medium tracking-wide">AI can make mistakes. Verify important information.</span>
                        </div>
                    </div>
                </main>
            </div>

            {/* Add Source Modal */}
            {isSourceModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-slide-up">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-surface-50">
                            <h3 className="text-xl font-bold font-display text-slate-900">Add Knowledge Source</h3>
                            <button onClick={() => setIsSourceModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-full shadow-sm hover:shadow transition-all" disabled={isUploading}>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddSource} className="p-6 md:p-8">

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-900 mb-3">Source Type</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {['pdf', 'url', 'youtube', 'text'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setSourceType(type)}
                                            className={`py-2.5 px-2 text-[11px] sm:text-xs font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 border transition-all duration-200 ${sourceType === type
                                                ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-md ring-1 ring-brand-500/20 scale-105'
                                                : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6 mt-4">
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={sourceTitle}
                                    onChange={(e) => setSourceTitle(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                                    placeholder="e.g. Chapter 1 Biology"
                                    required
                                />
                            </div>

                            <div className="min-h-[140px]">
                                {sourceType === 'pdf' && (
                                    <div className="animate-fade-in">
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Upload PDF</label>
                                        <label className="flex justify-center w-full min-h-[140px] px-4 transition-all bg-slate-50 hover:bg-white border-2 border-slate-200 border-dashed rounded-xl appearance-none cursor-pointer hover:border-brand-400 focus:outline-none hover:shadow-sm">
                                            <span className="flex flex-col items-center justify-center space-y-3">
                                                <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100">
                                                    <FileText className="h-8 w-8 text-brand-500" />
                                                </div>
                                                <span className="font-semibold text-slate-600 text-sm">
                                                    {sourceFile ? <span className="text-brand-600">{sourceFile.name}</span> : 'Drop files here or click to browse'}
                                                </span>
                                            </span>
                                            <input type="file" name="file" className="hidden" accept=".pdf" onChange={(e) => setSourceFile(e.target.files[0])} required />
                                        </label>
                                    </div>
                                )}

                                {sourceType === 'url' && (
                                    <div className="animate-fade-in">
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Website URL
                                        </label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <input
                                                type="url"
                                                value={sourceContent}
                                                onChange={(e) => setSourceContent(e.target.value)}
                                                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                                                placeholder="https://example.com/article"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {sourceType === 'youtube' && (
                                    <div className="animate-fade-in p-5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4 h-full">
                                        <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                                            <Youtube className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <p className="text-amber-800 font-medium text-sm leading-relaxed">The YouTube Transcript service is currently under maintenance. We are working on restoring it soon. Please try another source type for now.</p>
                                    </div>
                                )}

                                {sourceType === 'text' && (
                                    <div className="animate-fade-in">
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Raw Text Content</label>
                                        <textarea
                                            value={sourceContent}
                                            onChange={(e) => setSourceContent(e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm h-40 resize-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                                            placeholder="Paste your text documents, code snippets, or raw notes here..."
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsSourceModalOpen(false)}
                                    className="px-5 py-2.5 text-sm w-32 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl font-semibold transition-all shadow-sm"
                                    disabled={isUploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 text-sm w-40 text-white bg-brand-600 hover:bg-brand-500 focus:ring-2 focus:ring-brand-500/50 rounded-xl font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                                    disabled={isUploading || sourceType === 'youtube'}
                                >
                                    {isUploading ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Processing</>
                                    ) : (
                                        'Add Source'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Text Source Modal */}
            {viewingSourceText && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-100 animate-slide-up">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-surface-50">
                            <div>
                                <h3 className="text-xl font-bold font-display text-slate-900">{viewingSourceText.title}</h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{viewingSourceText.type}</p>
                            </div>
                            <button onClick={() => setViewingSourceText(null)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm hover:shadow transition-all">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 md:p-8 flex-1 overflow-y-auto w-full bg-white">
                            <pre className="whitespace-pre-wrap text-[15px] text-slate-700 font-sans leading-loose">
                                {viewingSourceText.content}
                            </pre>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-surface-50">
                            <button
                                onClick={() => setViewingSourceText(null)}
                                className="px-6 py-2.5 text-sm w-32 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl font-semibold transition-all shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotebookDetail;
