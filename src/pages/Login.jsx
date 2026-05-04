// src/pages/Login.jsx
// -------------------------------------------------------
// Pantalla de inicio de sesión rediseñada.
// Layout en dos columnas:
//   - Izquierda: branding (logo, lema, ilustración decorativa)
//   - Derecha:  formulario limpio
// En móvil colapsa a una sola columna y oculta la izquierda.
// -------------------------------------------------------

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, Stack,
  Divider, Container,
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  PeopleOutlined as PeopleIcon,
  AssignmentOutlined as AssignmentIcon,
  InsightsOutlined as InsightsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

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
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>

      {/* ============== COLUMNA IZQUIERDA: branding ============== */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          flex: 1,
          bgcolor: 'primary.main',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          p: 6,
        }}
      >
        {/* Decoración de fondo: círculos suaves */}
        <Box sx={{
          position: 'absolute',
          top: -120, right: -80,
          width: 320, height: 320,
          bgcolor: 'rgba(255,255,255,0.04)',
          borderRadius: '50%',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -160, left: -100,
          width: 380, height: 380,
          bgcolor: 'rgba(241,136,13,0.06)',
          borderRadius: '50%',
        }} />

        {/* Logo arriba */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              component="img"
              src="/logo.svg"
              alt="Portal Sindical"
              sx={{ width: 44, height: 44 }}
            />
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: 'white', lineHeight: 1.2 }}>
                Portal Sindical
              </Typography>
              <Typography variant="caption" sx={{
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}>
                Gestión de afiliados
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Lema central */}
        <Box sx={{
          position: 'relative', zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          mt: -4,
        }}>
          <Typography variant="h3" fontWeight={700} sx={{
            color: 'white',
            letterSpacing: '-0.02em',
            mb: 2,
            maxWidth: 420,
          }}>
            La voz de los trabajadores, organizada.
          </Typography>
          <Typography variant="body1" sx={{
            color: 'rgba(255,255,255,0.75)',
            maxWidth: 420,
            lineHeight: 1.6,
            mb: 5,
          }}>
            Centraliza la gestión de tus afiliados, registra incidencias
            laborales y sigue su evolución desde un único lugar.
          </Typography>

          {/* Tres ventajas clave */}
          <Stack spacing={2} sx={{ maxWidth: 420 }}>
            <Ventaja icono={<PeopleIcon />} texto="Gestión completa de afiliados por sectores" />
            <Ventaja icono={<AssignmentIcon />} texto="Seguimiento de incidencias y resoluciones" />
            <Ventaja icono={<InsightsIcon />} texto="Estadísticas en tiempo real para tomar decisiones" />
          </Stack>
        </Box>

        {/* Pie de la columna */}
        <Typography variant="caption" sx={{
          color: 'rgba(255,255,255,0.5)',
          position: 'relative',
          zIndex: 1,
        }}>
          © {new Date().getFullYear()} Portal Sindical · Trabajo Fin de Grado
        </Typography>
      </Box>

      {/* ============== COLUMNA DERECHA: formulario ============== */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: { xs: 3, sm: 6 },
        }}
      >
        {/* Logo en móvil (la columna izquierda no se ve) */}
        <Box sx={{ display: { md: 'none' }, mb: 4 }}>
          <Logo size="md" centrado />
        </Box>

        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography variant="h4" fontWeight={700} mb={1}>
            Bienvenida de nuevo
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Inicia sesión con tu cuenta para acceder a tu panel.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoFocus
                placeholder="tucorreo@sindicato.es"
              />

              <Box>
                <TextField
                  label="Contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />
                <Box sx={{ textAlign: 'right', mt: 0.5 }}>
                  <Link
                    to="/recuperar"
                    style={{
                      fontSize: 13,
                      color: '#283d61',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </Box>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={cargando}
                fullWidth
                sx={{ py: 1.4, fontSize: '0.95rem' }}
              >
                {cargando ? 'Entrando...' : 'Iniciar sesión'}
              </Button>

              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  ¿Aún no tienes cuenta?
                </Typography>
              </Divider>

              <Button
                component={Link}
                to="/register"
                variant="outlined"
                size="large"
                fullWidth
                sx={{ py: 1.4 }}
              >
                Crear cuenta nueva
              </Button>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

// === Ventaja clave en la columna izquierda ===
function Ventaja({ icono, texto }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box sx={{
        bgcolor: 'rgba(255,255,255,0.08)',
        borderRadius: 1.5,
        p: 0.8,
        display: 'flex',
        color: '#f9c34e',
      }}>
        {icono}
      </Box>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
        {texto}
      </Typography>
    </Stack>
  );
}

function traducirError(msg) {
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos';
  if (msg.includes('Email not confirmed')) return 'Tienes que confirmar tu email antes de iniciar sesión';
  return msg;
}
