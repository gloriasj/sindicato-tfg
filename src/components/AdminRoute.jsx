// src/components/AdminRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute() {
    const { profile, loading } = useAuth();

    // Mientras carga el perfil desde Supabase, no mostramos nada para evitar parpadeos
    if (loading) return null;

    // Si tiene el carnet de 'admin', le abrimos la puerta (<Outlet /> renderiza la página que pidió)
    // Si no es admin (ej. delegado), le damos un portazo y lo mandamos al dashboard
    return profile?.rol === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}