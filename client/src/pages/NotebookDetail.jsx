import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Plus, FileText, Globe, Youtube, AlignLeft, Send, Loader2, Bot, User, Trash2, Search, Sparkles, ChevronDown, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const NotebookDetail = () => {
    const { id } = useParams();
    const [notebook, setNotebook] = useState(null);
    const [error, setError] = useState(null);
    const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
    const [viewingSourceText, setViewingSourceText] = useState(null);
    const [selectedSources, setSelectedSources] = useState([]);
    const [sourceToDelete, setSourceToDelete] = useState(null);
    const [mobileTab, setMobileTab] = useState('chat'); // 'sources' | 'chat' | 'rightPanel'
    const [rightDesktopTab, setRightDesktopTab] = useState('notes'); // 'notes' | 'quiz'

    // Token limit state
    const [tokenLimitReached, setTokenLimitReached] = useState(false);

    // Right Sidebar States
    const [notesText, setNotesText] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const notesTimeoutRef = useRef(null);

    // Quiz States
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizError, setQuizError] = useState('');

    // Source states
    const [sourceType, setSourceType] = useState('pdf'); // pdf, url, youtube, text, web_search
    const [sourceTitle, setSourceTitle] = useState('');
    const [sourceContent, setSourceContent] = useState('');
    const [inlineSearchQuery, setInlineSearchQuery] = useState('');
    const [sourceFile, setSourceFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [sourceError, setSourceError] = useState('');

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
            if (data.notes) {
                setNotesText(data.notes);
            }
            if (data.sources) {
                // Default to all sources selected
                setSelectedSources(data.sources.map(s => s._id));
            }
        } catch (err) {
            console.error('Fetch notebook details error:', err);
            setError('Notebook is not present');
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

    const handleDeleteSource = async () => {
        if (!sourceToDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/sources/${id}/${sourceToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotebookDetails();
            setSelectedSources(prev => prev.filter(sId => sId !== sourceToDelete));
            setSourceToDelete(null);
        } catch (err) {
            console.error('Failed to delete source:', err);
            alert('Failed to delete source');
        }
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

    const handleNotesChange = (e) => {
        const newText = e.target.value;
        setNotesText(newText);

        // Auto-save debounce
        if (notesTimeoutRef.current) {
            clearTimeout(notesTimeoutRef.current);
        }

        notesTimeoutRef.current = setTimeout(() => {
            saveNotes(newText);
        }, 1500); // Save after 1.5 seconds of inactivity
    };

    const saveNotes = async (textToSave) => {
        setIsSavingNotes(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/notebooks/${id}/notes`, {
                notes: textToSave
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Failed to save notes:', err);
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleGenerateQuiz = async () => {
        if (selectedSources.length === 0) return;
        setIsGeneratingQuiz(true);
        setQuizError('');
        setQuizData(null);
        setUserAnswers({});
        setCurrentQuestionIndex(0);

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/${id}/quiz`, {
                selectedSources
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data && data.quiz && data.quiz.length > 0) {
                setQuizData(data.quiz);
            } else {
                setQuizError('Could not generate quiz from the selected sources. Please ensure sources contain enough factual text.');
            }
        } catch (err) {
            console.error('Quiz generation error:', err);
            if (err.response?.status === 403) {
                setTokenLimitReached(true);
            } else {
                setQuizError(err.response?.data?.error || err.response?.data?.message || 'Failed to generate quiz. Check your connection or API keys.');
            }
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    const handleQuizOptionSelect = (option) => {
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: option
        }));
    };

    const calculateQuizScore = () => {
        if (!quizData) return 0;
        let score = 0;
        quizData.forEach((q, idx) => {
            if (userAnswers[idx] === q.answer) score++;
        });
        return score;
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
        if (e && e.preventDefault) e.preventDefault();
        setIsUploading(true);
        setSourceError('');
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
            setSourceError('');
            fetchNotebookDetails();
        } catch (err) {
            console.error(err);
            setSourceError(err.response?.data?.message || err.response?.data?.error || 'Failed to add source');
        } finally {
            setIsUploading(false);
        }
    };

    const handleInlineWebSearch = async () => {
        if (!inlineSearchQuery.trim()) return;
        setIsUploading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('type', 'web_search');
            formData.append('title', inlineSearchQuery);
            formData.append('content', inlineSearchQuery);

            await axios.post(`${import.meta.env.VITE_API_URL}/api/sources/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            setInlineSearchQuery('');
            fetchNotebookDetails();
        } catch (err) {
            console.error('Add source error:', err);
            alert(err.response?.data?.error || 'Failed to add source');
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
            if (err.response?.status === 403) {
                // Remove the initial generic user message since it failed.
                setMessages(prev => prev.slice(0, -1));
                setTokenLimitReached(true);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Error: Failed to process query.'
                }]);
            }
        } finally {
            setIsThinking(false);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 p-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full animate-fade-in">
                    <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">Notebook Not Found</h2>
                    <p className="text-slate-500 mb-6 font-medium">{error}</p>
                    <Link to="/dashboard" className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-500/20 transition-all">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

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

            {/* Mobile Tabs */}
            <div className="md:hidden flex bg-white border-b border-slate-200 z-10 sticky top-16 shadow-sm">
                <button
                    onClick={() => setMobileTab('sources')}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${mobileTab === 'sources' ? 'border-brand-600 text-brand-700 bg-brand-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    Sources
                </button>
                <button
                    onClick={() => setMobileTab('chat')}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${mobileTab === 'chat' ? 'border-brand-600 text-brand-700 bg-brand-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    Chat
                </button>
                <button
                    onClick={() => setMobileTab('rightPanel')}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${mobileTab === 'rightPanel' ? 'border-brand-600 text-brand-700 bg-brand-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    Notes & Quiz
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Decorative Background grid elements */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

                {/* Left Sidebar - Sources */}
                <aside className={`${mobileTab === 'sources' ? 'flex w-full' : 'hidden'} md:flex md:w-80 border-r border-slate-200 bg-white flex-col z-10 shadow-sm relative overflow-hidden`}>
                    <div className="p-4 flex flex-col gap-4 border-b border-slate-200">
                        <button
                            onClick={() => { setIsSourceModalOpen(true); setSourceError(''); }}
                            className="w-full py-2.5 px-4 rounded-3xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                            title="Add Source"
                        >
                            <Plus className="h-4 w-4" />
                            Add sources
                        </button>

                        <div className="bg-slate-50 rounded-[1.25rem] p-3 border border-slate-200">
                            <div className="flex items-center gap-3 px-1 mt-1">
                                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search the web for new sources"
                                    className="bg-transparent border-none text-slate-700 text-[13px] font-medium focus:outline-none focus:ring-0 w-full placeholder:text-slate-400 p-0"
                                    value={inlineSearchQuery}
                                    onChange={(e) => setInlineSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleInlineWebSearch();
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-4 ml-1">

                                <button className="flex items-center gap-1.5 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 border border-slate-200 transition-colors shadow-sm"
                                    onClick={handleInlineWebSearch}
                                    disabled={isUploading || !inlineSearchQuery.trim()}>
                                    {isUploading ? <Loader2 className="h-3.5 w-3.5 text-brand-500 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-brand-500" />}
                                    Fast research
                                </button>
                                <button className="ml-auto h-8 w-8 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-white transition-colors disabled:opacity-50"
                                    onClick={handleInlineWebSearch}
                                    disabled={isUploading || !inlineSearchQuery.trim()}>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
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
                                                source.type === 'web_search' ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-100' :
                                                    'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                                        }`}>
                                        {source.type === 'pdf' && <FileText className="h-4 w-4" />}
                                        {source.type === 'url' && <Globe className="h-4 w-4" />}
                                        {source.type === 'youtube' && <Youtube className="h-4 w-4" />}
                                        {source.type === 'text' && <AlignLeft className="h-4 w-4" />}
                                        {source.type === 'web_search' && <Search className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-700 transition-colors">{source.title}</p>
                                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-1">{source.type}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSourceToDelete(source._id);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                        title="Delete Source"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Main Content - Chat Area */}
                <main className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-transparent w-full overflow-hidden`}>
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
                                        <div className={`prose prose-sm md:prose-base max-w-none ${msg.role === 'user' ? 'text-white' : ''}`}>
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
                                                <p className="text-[11px] font-semibold text-slate-400 mb-2.5 uppercase tracking-widest flex items-center gap-1.5"><FileText className="h-3 w-3" /> Sources Used</p>
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

                {/* Right Sidebar - Notes & Quiz */}
                <aside className={`${mobileTab === 'rightPanel' ? 'flex w-full' : 'hidden'} md:flex md:w-[360px] border-l border-slate-200 bg-white flex-col z-10 shadow-sm relative overflow-hidden`}>
                    <div className="flex border-b border-slate-200 bg-slate-50/50">
                        <button
                            onClick={() => setRightDesktopTab('notes')}
                            className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-semibold border-b-2 transition-all ${rightDesktopTab === 'notes' ? 'border-brand-600 text-brand-700 bg-white shadow-sm' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                        >
                            <AlignLeft className="h-4 w-4" />
                            Notes
                        </button>
                        <button
                            onClick={() => setRightDesktopTab('quiz')}
                            className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-semibold border-b-2 transition-all ${rightDesktopTab === 'quiz' ? 'border-brand-600 text-brand-700 bg-white shadow-sm' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                        >
                            <Sparkles className="h-4 w-4" />
                            Quiz
                        </button>
                    </div>

                    <div className="flex flex-1 overflow-hidden bg-white">
                        {rightDesktopTab === 'notes' ? (
                            <div className="flex flex-col flex-1 p-4">
                                <div className="flex items-center justify-between mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    <span>Personal Notes</span>
                                    {isSavingNotes ? (
                                        <span className="flex items-center gap-1.5 text-brand-600 normal-case tracking-normal animate-pulse">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-slate-400 normal-case tracking-normal">
                                            Saved
                                        </span>
                                    )}
                                </div>
                                <textarea
                                    value={notesText}
                                    onChange={handleNotesChange}
                                    placeholder="Jot down important concepts, summaries, or questions here..."
                                    className="flex-1 w-full bg-slate-50/50 border border-slate-200 rounded-xl p-4 text-[14px] text-slate-700 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 resize-none transition-all shadow-inner"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col flex-1 p-5 overflow-y-auto w-full relative">
                                {!quizData && !isGeneratingQuiz && (
                                    <div className="text-center py-10 my-auto">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 scale-110">
                                            <Sparkles className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Knowledge Check</h3>
                                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                            Test your understanding. We'll generate a 10-question multiple-choice quiz based purely on your currently selected sources.
                                        </p>

                                        {quizError && (
                                            <div className="mb-6 p-3 bg-red-50 text-red-600 text-[13px] font-semibold rounded-xl border border-red-100 text-left">
                                                {quizError}
                                            </div>
                                        )}

                                        <button
                                            onClick={handleGenerateQuiz}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full shadow-md transition-all active:scale-95 disabled:opacity-50"
                                            disabled={selectedSources.length === 0}
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            Generate Quiz
                                        </button>

                                        {selectedSources.length === 0 && (
                                            <p className="text-xs text-red-500 mt-4 font-medium">Please select at least one source from the left sidebar first.</p>
                                        )}
                                    </div>
                                )}

                                {isGeneratingQuiz && (
                                    <div className="text-center py-10 my-auto animate-pulse flex flex-col items-center">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Analyzing Sources...</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed max-w-[250px]">Reading through your documents to synthesize intelligent questions. This takes just a moment.</p>
                                    </div>
                                )}

                                {quizData && currentQuestionIndex < quizData.length && (
                                    <div className="flex flex-col h-full animate-fade-in relative pt-2">
                                        <div className="flex items-center justify-between mb-5">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Question {currentQuestionIndex + 1} of {quizData.length}</span>
                                            <div className="flex gap-1 bg-slate-100 p-1 rounded-full">
                                                {quizData.map((_, i) => (
                                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentQuestionIndex ? 'bg-brand-600' : i < currentQuestionIndex ? 'bg-brand-300' : 'bg-slate-300'}`} />
                                                ))}
                                            </div>
                                        </div>

                                        <h4 className="text-[14px] font-bold text-slate-900 leading-relaxed mb-5">
                                            {quizData[currentQuestionIndex].question}
                                        </h4>

                                        <div className="space-y-2.5 mb-8">
                                            {quizData[currentQuestionIndex].options.map((option, idx) => {
                                                const isSelected = userAnswers[currentQuestionIndex] === option;
                                                const hasAnswered = userAnswers[currentQuestionIndex] !== undefined;
                                                const isCorrectOption = option === quizData[currentQuestionIndex].answer;

                                                let optionStyles = "bg-white border-slate-200 hover:border-brand-300 hover:bg-slate-50 text-slate-700";

                                                if (hasAnswered) {
                                                    if (isCorrectOption) {
                                                        optionStyles = "bg-green-50 border-green-300 text-green-800 ring-1 ring-green-500/20 shadow-sm";
                                                    } else if (isSelected && !isCorrectOption) {
                                                        optionStyles = "bg-red-50 border-red-300 text-red-800 opacity-80";
                                                    } else {
                                                        optionStyles = "bg-slate-50/50 border-slate-200 text-slate-400 opacity-60";
                                                    }
                                                } else if (isSelected) {
                                                    optionStyles = "bg-brand-50 border-brand-400 text-brand-800 ring-1 ring-brand-500/20";
                                                }

                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => !hasAnswered && handleQuizOptionSelect(option)}
                                                        disabled={hasAnswered}
                                                        className={`w-full text-left p-3.5 rounded-xl border text-[13px] font-medium transition-all ${optionStyles}`}
                                                    >
                                                        {option}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {userAnswers[currentQuestionIndex] !== undefined && (
                                            <div className="mt-auto animate-slide-up pb-4">
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 shadow-inner">
                                                    <p className="text-[13px] text-slate-700 leading-relaxed"><span className="font-bold">Explanation:</span> {quizData[currentQuestionIndex].explanation}</p>
                                                </div>
                                                <button
                                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm"
                                                >
                                                    {currentQuestionIndex === quizData.length - 1 ? 'See Final Score' : 'Next Question'} <ArrowRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {quizData && currentQuestionIndex >= quizData.length && (
                                    <div className="text-center flex flex-col items-center justify-center h-full animate-slide-up pb-10">
                                        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 relative shadow-inner">
                                            <Sparkles className="h-10 w-10 text-brand-600" />
                                            {calculateQuizScore() >= (quizData.length / 2) && (
                                                <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🎉</div>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-bold font-display text-slate-900 mb-2">Quiz Complete!</h3>
                                        <p className="text-slate-500 font-medium mb-8">You scored <span className="text-brand-600 font-bold text-lg">{calculateQuizScore()}</span> out of {quizData.length}</p>

                                        <div className="flex flex-col gap-3 w-full max-w-[200px] mx-auto">
                                            <button
                                                onClick={() => {
                                                    setQuizData(null);
                                                    setCurrentQuestionIndex(0);
                                                    setUserAnswers({});
                                                }}
                                                className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                                            >
                                                Close Quiz
                                            </button>
                                            <button
                                                onClick={handleGenerateQuiz}
                                                className="w-full py-2.5 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-500 transition-all shadow-md active:scale-95"
                                            >
                                                Generate New Quiz
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* Add Source Modal */}
            {isSourceModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-slide-up">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-surface-50">
                            <h3 className="text-xl font-bold font-display text-slate-900">Add Knowledge Source</h3>
                            <button onClick={() => { setIsSourceModalOpen(false); setSourceError(''); }} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-full shadow-sm hover:shadow transition-all" disabled={isUploading}>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddSource} className="p-6 md:p-8">
                            {sourceError && (
                                <div className="mb-5 p-3 bg-red-50 text-red-600 text-[13px] font-medium rounded-xl border border-red-100 flex items-start gap-2 animate-fade-in">
                                    <span className="mt-0.5 shrink-0">⚠️</span>
                                    <span>{sourceError}</span>
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-900 mb-3">Source Type</label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                                        <p className="mt-2 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                                            <Globe className="h-3 w-3" />
                                            Only websites that allow web crawling/scraping can be analyzed. Sites with strict bot protection may fail to import.
                                        </p>
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

                                {sourceType === 'web_search' && (
                                    <div className="animate-fade-in">
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Search Query
                                        </label>
                                        <div className="relative flex items-center">
                                            <Search className="absolute left-3 h-5 w-5 text-slate-400 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={sourceContent}
                                                onChange={(e) => setSourceContent(e.target.value)}
                                                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                                                placeholder="e.g. Latest news on Artificial Intelligence 2026..."
                                                required
                                            />
                                        </div>
                                        <p className="mt-2 text-[11px] text-slate-500 font-medium">
                                            Provide a detailed query. The top results will be automatically scraped and summarized into your notebook index.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => { setIsSourceModalOpen(false); setSourceError(''); }}
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

            {/* Delete Source Confirmation Modal */}
            {sourceToDelete && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 border border-slate-100 animate-slide-up p-6">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Delete Source</h3>
                        <p className="text-slate-500 text-center text-sm mb-6">Are you sure you want to delete this source? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSourceToDelete(null)}
                                className="flex-1 px-4 py-2.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteSource}
                                className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-500 rounded-lg font-semibold shadow-md transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Token Limit Modal */}
            {tokenLimitReached && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all scale-100 border border-slate-100 animate-slide-up p-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <Bot className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Daily Token Limit Reached</h3>
                        <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">You have hit the 100k daily token limit. Read-only mode has been activated until tomorrow.</p>
                        <button
                            onClick={() => setTokenLimitReached(false)}
                            className="w-full inline-flex justify-center rounded-xl border border-transparent bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none transition-all active:scale-95"
                        >
                            Okay, got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotebookDetail;
