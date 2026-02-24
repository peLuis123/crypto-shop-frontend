import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex-1 flex flex-col justify-center items-center text-white bg-brand-dark h-full animate-fade-in">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-primary to-brand-secondary mb-4">
                Dashboard
            </h1>

            {user && (
                <div className="text-center space-y-2 mb-8">
                    <p className="text-brand-muted">Welcome back,</p>
                    <p className="text-xl font-medium">{user.username}</p>
                    <div className="text-xs px-3 py-1 bg-brand-surface rounded-full inline-block border border-white/5 text-brand-muted mt-2">
                        {user.email}
                    </div>
                </div>
            )}

            <button
                onClick={handleLogout}
                className="px-6 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm text-brand-muted hover:text-white"
            >
                Log Out
            </button>
        </div>
    );
};

export default Dashboard;
