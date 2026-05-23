// src/pages/Login.jsx
// -------------------------------------------------------
// Pantalla de inicio de sesión con estilo oscuro aplicado.
// -------------------------------------------------------

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, Stack,
  Divider, Container,
} from '@mui/material';
import {
  PeopleAltOutlined as PeopleIcon,
  AssignmentOutlined as AssignmentIcon,
  InsightsOutlined as InsightsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

// --- ESTILOS COMPARTIDOS ---
const cardStyle = {
  background: 'linear-gradient(180deg, #131c33 0%, #0c1428 100%)',
  borderRadius: 4,
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
  p: 4
};

const inputStyle = {
  '& .MuiInputLabel-root': { color: '#94a3b8' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    '& fieldset': { borderColor: '#1e293b' },
    '&:hover fieldset': { borderColor: '#475569' },
    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
    '& input': { color: '#ffffff !important' }
  },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const { error } = await login(email, password);

    if (error) {
      setError(traducirError(error.message));
      setCargando(false);
    } else {
      navigate('/dashboard');
    }
  }

  return (
      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#080d1c' }}>

        {/* ============== COLUMNA IZQUIERDA: branding ============== */}
        <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              flex: 1,
              bgcolor: '#0c1428',
              position: 'relative',
              overflow: 'hidden',
              p: 6,
              borderRight: '1px solid rgba(255,255,255,0.05)'
            }}
        >
          <Box sx={{ position: 'absolute', top: -120, right: -80, width: 320, height: 320, bgcolor: 'rgba(59, 130, 246, 0.03)', borderRadius: '50%' }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box component="img" src="/logo.svg" alt="Portal Sindical" sx={{ width: 44, height: 44 }} />
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#ffffff' }}>Portal Sindical</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Gestión de afiliados</Typography>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', mt: -4 }}>
            <Typography variant="h3" fontWeight={700} sx={{ color: '#ffffff', letterSpacing: '-0.02em', mb: 2, maxWidth: 420 }}>
              La voz de los trabajadores, organizada.
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: 420, lineHeight: 1.6, mb: 5 }}>
              Centraliza la gestión de tus afiliados, registra incidencias laborales y sigue su evolución desde un único lugar.
            </Typography>

            <Stack spacing={2} sx={{ maxWidth: 420 }}>
              <Ventaja icono={<PeopleIcon />} texto="Gestión completa de afiliados por sectores" />
              <Ventaja icono={<AssignmentIcon />} texto="Seguimiento de incidencias y resoluciones" />
              <Ventaja icono={<InsightsIcon />} texto="Estadísticas en tiempo real" />
            </Stack>
          </Box>
        </Box>

        {/* ============== COLUMNA DERECHA: formulario ============== */}
        <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 3, sm: 6 },
            }}
        >
          <Paper sx={{ ...cardStyle, width: '100%', maxWidth: 400 }}>
            <Typography variant="h4" fontWeight={700} mb={1} sx={{ color: '#ffffff' }}>
              Bienvenida de nuevo
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 4 }}>
              Inicia sesión con tu cuenta para acceder.
            </Typography>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                {error && <Alert severity="error" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>{error}</Alert>}

                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    sx={inputStyle}
                />

                <TextField
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    sx={inputStyle}
                />

                <Box sx={{ textAlign: 'right' }}>
                  <Link to="/recuperar" style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none' }}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </Box>

                <Button type="submit" variant="contained" size="large" disabled={cargando} fullWidth sx={{ py: 1.4 }}>
                  {cargando ? 'Entrando...' : 'Iniciar sesión'}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Box>
      </Box>
  );
}

function Ventaja({ icono, texto }) {
  return (
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: 1.5, p: 0.8, display: 'flex', color: '#3b82f6' }}>
          {icono}
        </Box>
        <Typography variant="body2" sx={{ color: '#e2e8f0' }}>{texto}</Typography>
      </Stack>
  );
}

function traducirError(msg) {
    if (msg === 'CUENTA_INACTIVA') return 'Tu cuenta ha sido desactivada por un Administrador.';
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos';
  if (msg.includes('Email not confirmed')) return 'Confirma tu email antes de entrar';
  return msg;
}