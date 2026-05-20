// src/App.jsx
// -------------------------------------------------------
// Configuración global: Providers, Router y Tema MUI.
// -------------------------------------------------------

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Contextos
import { AuthProvider } from './context/AuthContext';
import { NotificacionProvider } from './context/NotificacionContext';

// Componentes de protección
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute     from './components/AdminRoute';
import Layout         from './components/Layout';

// Páginas
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
import Usuarios           from './pages/Usuarios';

// =========================================================
// TEMA REFINADO
// =========================================================
const theme = createTheme({
  palette: {
    primary: {
      light: '#3f5b8a',
      main:  '#283d61',
      dark:  '#1a2640',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#f9c34e',
      main:  '#f1880d',
      dark:  '#b1430a',
    },
    background: {
      default: '#f7f8fb',
      paper:   '#ffffff',
    },
    text: {
      primary:   '#11192c',
      secondary: '#6a7794',
    },
    divider: 'rgba(17, 25, 44, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, transition: 'all 0.15s' },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none', border: '1px solid rgba(17, 25, 44, 0.08)' },
      },
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
                {/* Rutas Públicas */}
                <Route path="/login"       element={<Login />} />
                <Route path="/register"    element={<Register />} />
                <Route path="/recuperar"   element={<RecuperarPassword />} />
                <Route path="/restablecer" element={<ResetPassword />} />

                {/* Rutas Protegidas (Dashboard y gestión) */}
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

                  <Route element={<AdminRoute />}>
                    <Route path="/sectores" element={<Sectores />} />
                    <Route path="/usuarios" element={<Usuarios />} />
                  </Route>
                </Route>

                {/* Ruta 404 */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AuthProvider>
          </NotificacionProvider>
        </BrowserRouter>
      </ThemeProvider>
  );
}