// src/App.jsx
// -------------------------------------------------------
// Configuración global y rutas con tema MUI refinado.
// -------------------------------------------------------

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { NotificacionProvider } from './context/NotificacionContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import AdminRoute from './components/AdminRoute'; // <-- NUEVO: Importamos la protección de rutas admin

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
import Usuarios           from './pages/Usuarios'; // <-- NUEVO: Importamos la página de usuarios

// =========================================================
// TEMA REFINADO
// =========================================================
// Paleta: azul "midnight" institucional + ámbar de acento.
// Sombras suaves y bordes sutiles (estilo Notion/Linear).
// Tipografía Inter (la fuente "moderna" más usada en SaaS).
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
      default: '#f7f8fb',         // ligeramente más cálido que el gris azulado anterior
      paper:   '#ffffff',
    },
    text: {
      primary:   '#11192c',
      secondary: '#6a7794',
    },
    divider: 'rgba(17, 25, 44, 0.08)',  // bordes muy sutiles
  },

  typography: {
    fontFamily:
        '"Inter", "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    button: { textTransform: 'none', fontWeight: 500 },
    overline: {
      fontSize: '0.7rem',
      fontWeight: 600,
      letterSpacing: '0.08em',
    },
  },

  shape: { borderRadius: 10 },

  shadows: [
    'none',
    '0 1px 2px rgba(17,25,44,0.04)',                                            // 1
    '0 1px 3px rgba(17,25,44,0.06)',                                            // 2
    '0 2px 4px rgba(17,25,44,0.06), 0 1px 2px rgba(17,25,44,0.04)',             // 3
    '0 4px 6px -1px rgba(17,25,44,0.06), 0 2px 4px -1px rgba(17,25,44,0.04)',   // 4
    '0 6px 12px -2px rgba(17,25,44,0.08), 0 3px 6px -2px rgba(17,25,44,0.04)',  // 5
    '0 8px 16px -4px rgba(17,25,44,0.10), 0 4px 8px -2px rgba(17,25,44,0.04)',  // 6
    ...Array(18).fill('0 12px 24px -4px rgba(17,25,44,0.10)'),                  // 7-24
  ],

  components: {
    // Botones más limpios, sin sombras agresivas
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          transition: 'all 0.15s ease-out',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 2px 8px rgba(40,61,97,0.20)' },
        },
        outlined: {
          borderColor: 'rgba(17, 25, 44, 0.16)',
          '&:hover': {
            borderColor: 'rgba(17, 25, 44, 0.32)',
            backgroundColor: 'rgba(17, 25, 44, 0.03)',
          },
        },
      },
    },

    // Tarjetas con borde sutil en vez de sombra fuerte
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: 'rgba(17, 25, 44, 0.08)',
        },
      },
    },

    // Inputs más alargados y suaves
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#ffffff',
          '& fieldset': {
            borderColor: 'rgba(17, 25, 44, 0.12)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(17, 25, 44, 0.24)',
          },
        },
      },
    },

    // Chips redondeados elegantes
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.78rem',
        },
      },
    },

    // Tabla con hover más sutil
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(17, 25, 44, 0.06)',
        },
        head: {
          fontWeight: 600,
          fontSize: '0.82rem',
          color: '#3a4660',
          backgroundColor: '#fafbfd',
        },
      },
    },

    // Drawer del menú lateral con sombra suave a la derecha
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },

    // Avatares un pelín más suaves
    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },

    // Tooltips más legibles
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
          padding: '6px 10px',
          backgroundColor: '#1a2640',
        },
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
                <Route path="/login"        element={<Login />} />
                <Route path="/register"     element={<Register />} />
                <Route path="/recuperar"    element={<RecuperarPassword />} />
                <Route path="/restablecer"  element={<ResetPassword />} />

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

                  {/* <-- Rutas exclusivas para el Administrador --> */}
                  <Route element={<AdminRoute />}>
                    <Route path="/sectores" element={<Sectores />} />
                    <Route path="/usuarios" element={<Usuarios />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AuthProvider>
          </NotificacionProvider>
        </BrowserRouter>
      </ThemeProvider>
  );
}