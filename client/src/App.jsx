import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotebookDetail from './pages/NotebookDetail';
import Landing from './pages/Landing';

function App() {
  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-800 selection:bg-brand-500/30 selection:text-brand-900">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/notebook/:id" element={
          <PrivateRoute>
            <NotebookDetail />
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
