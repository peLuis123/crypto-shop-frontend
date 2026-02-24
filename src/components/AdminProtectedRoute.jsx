import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
