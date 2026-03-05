import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Search, LogOut, BookOpen, Clock, Settings, Bell, LayoutDashboard, Trash2 } from 'lucide-react';

const Dashboard = () => {
    const [notebooks, setNotebooks] = useState([]);
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notebookToDelete, setNotebookToDelete] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const navigate = useNavigate();

    useEffect(() => {
        fetchUser();
        fetchNotebooks();
    }, []);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(data);
        } catch (err) {
            console.error('Fetch user error:', err);
        }
    };

    const fetchNotebooks = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/notebooks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotebooks(data);
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    const handleCreateNotebook = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/notebooks`, { title, description }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            setTitle('');
            setDescription('');
            fetchNotebooks();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteNotebook = async () => {
        if (!notebookToDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/notebooks/${notebookToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotebooks();
            setNotebookToDelete(null);
        } catch (err) {
            console.error('Failed to delete notebook:', err);
            alert('Failed to delete notebook');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const filteredNotebooks = notebooks.filter(nb =>
        nb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (nb.description && nb.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredNotebooks.length / itemsPerPage);
    const paginatedNotebooks = filteredNotebooks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-surface-50 flex h-screen overflow-hidden text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col hidden md:flex z-10 relative">
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="bg-brand-600 p-1.5 rounded-lg shadow-sm">
                            <BookOpen className="text-white h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">ThinkNote AI</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</div>
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-brand-50 text-brand-700 rounded-lg font-medium transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                    </Link>
                    {/* <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors">
                        <Clock className="h-5 w-5 text-slate-400" />
                        Recent Activity
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors">
                        <Settings className="h-5 w-5 text-slate-400" />
                        Settings
                    </a> */}
                </div>

                <div className="p-4 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-slate-50">
                        <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm uppercase">
                            {user?.username ? user.username.substring(0, 2) : 'ME'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{user?.username || 'My Account'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email || 'Free Plan'}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium">
                        <LogOut className="h-5 w-5" />
                        Log out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center md:hidden gap-2">
                        <div className="bg-brand-600 p-1.5 rounded-lg">
                            <BookOpen className="text-white h-5 w-5" />
                        </div>
                    </div>

                    <div className="flex-1 flex justify-center max-w-2xl mx-auto px-4">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search notebooks..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-slate-50 focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors hidden sm:block">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium shadow-sm hover:shadow active:scale-95"
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">New Notebook</span>
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
                    {/* Decorative Background grid elements */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

                    <div className="relative z-10 max-w-6xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-2xl font-display font-bold text-slate-900">Your Notebooks</h2>
                            <p className="text-slate-500 text-sm mt-1">Manage and chat with your document collections.</p>
                        </div>

                        {notebooks.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm animate-fade-in relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-transparent opacity-50"></div>
                                <div className="relative z-10">
                                    <div className="h-16 w-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 scale-110">
                                        <BookOpen className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">No notebooks yet</h3>
                                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">Create your first notebook to start adding sources and asking questions about your data.</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-lg hover:bg-brand-500 font-semibold shadow-md transition-all active:scale-95"
                                    >
                                        <PlusCircle className="h-5 w-5" />
                                        Create First Notebook
                                    </button>
                                </div>
                            </div>
                        ) : filteredNotebooks.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
                                <Search className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">No matching notebooks</h3>
                                <p className="text-slate-500">Try adjusting your search query.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
                                    {paginatedNotebooks.map((nb) => (
                                        <Link
                                            key={nb._id}
                                            to={`/notebook/${nb._id}`}
                                            className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-brand-900/5 hover:-translate-y-1 hover:border-brand-200 transition-all duration-300 block relative overflow-hidden h-[200px] flex flex-col justify-between"
                                        >
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="p-2 bg-brand-50 rounded-lg text-brand-600 group-hover:bg-brand-100 transition-colors">
                                                        <BookOpen className="h-5 w-5" />
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setNotebookToDelete(nb._id);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Delete Notebook"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">{nb.title}</h3>
                                                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed flex-1">{nb.description || "No description provided."}</p>
                                            </div>
                                            <div className="px-5 py-3 text-xs font-medium text-slate-400 flex items-center justify-between border-t border-slate-100 bg-slate-50/50 group-hover:bg-brand-50/30 transition-colors">
                                                <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(nb.createdAt).toLocaleDateString()}</span>
                                                <span className="text-brand-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">Open &rarr;</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-10">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm shadow-sm"
                                        >
                                            Previous
                                        </button>
                                        <div className="px-4 text-sm text-slate-600 font-medium">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm shadow-sm"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-slate-100 animate-slide-up">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold font-display text-slate-900">Create New Notebook</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateNotebook} className="p-6">
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Notebook Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                                    placeholder="e.g. Machine Learning Basics"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none h-28 resize-none transition-all shadow-sm"
                                    placeholder="Briefly describe the purpose of this notebook..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-white bg-brand-600 hover:bg-brand-500 rounded-lg font-semibold shadow-md transition-colors w-32"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {notebookToDelete && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 border border-slate-100 animate-slide-up p-6">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Delete Notebook</h3>
                        <p className="text-slate-500 text-center text-sm mb-6">Are you sure you want to delete this notebook? This action cannot be undone and will delete all associated sources.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setNotebookToDelete(null)}
                                className="flex-1 px-4 py-2.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteNotebook}
                                className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-500 rounded-lg font-semibold shadow-md transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
