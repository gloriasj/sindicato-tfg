// src/App.jsx
// -------------------------------------------------------
// Configuración global y rutas. Ahora con
// NotificacionProvider envolviendo toda la aplicación.
// -------------------------------------------------------

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { NotificacionProvider } from './context/NotificacionContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login              from './pages/Login';
import Register           from './pages/Register';
import RecuperarPassword  from './pages/RecuperarPassword';
import ResetPassword      from './pages/ResetPassword';
import Dashboard          from './pages/Dashboard';
import Afiliados          from './pages/Afiliados';
import AfiliadoForm       from './pages/AfiliadoForm';
import AfiliadoDetalle    from './pages/AfiliadoDetalle';
import Incidencias        from './pages/Incidencias';
import IncidenciaForm     from './pages/IncidenciaForm';
import IncidenciaDetalle  from './pages/IncidenciaDetalle';
import Sectores           from './pages/Sectores';

const theme = createTheme({
  palette: {
    primary:   { main: '#283d61' },
    secondary: { main: '#f1880d' },
    background:{ default: '#f3f6fb' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NotificacionProvider>
          <AuthProvider>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login"        element={<Login />} />
              <Route path="/register"     element={<Register />} />
              <Route path="/recuperar"    element={<RecuperarPassword />} />
              <Route path="/restablecer"  element={<ResetPassword />} />

              {/* Rutas protegidas */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/afiliados"             element={<Afiliados />} />
                <Route path="/afiliados/nuevo"       element={<AfiliadoForm />} />
                <Route path="/afiliados/:id"         element={<AfiliadoForm />} />
                <Route path="/afiliados/:id/detalle" element={<AfiliadoDetalle />} />

                <Route path="/incidencias"             element={<Incidencias />} />
                <Route path="/incidencias/nuevo"       element={<IncidenciaForm />} />
                <Route path="/incidencias/:id"         element={<IncidenciaForm />} />
                <Route path="/incidencias/:id/detalle" element={<IncidenciaDetalle />} />

                <Route path="/sectores" element={<Sectores />} />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </NotificacionProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
