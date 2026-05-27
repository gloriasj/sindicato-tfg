
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute() {
    const { profile, loading } = useAuth();

    // mientras carga el perfil desde supabase, no mostramos nada
    if (loading) return null;

    // si es admin se le deja pasar outlet
    // Si no es admin se le redirige al dashboard
    return profile?.rol === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}