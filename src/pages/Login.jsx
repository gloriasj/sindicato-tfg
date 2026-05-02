// src/pages/Login.jsx
// -------------------------------------------------------
// Pantalla de inicio de sesión con email y contraseña.
// -------------------------------------------------------

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, Stack,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f3f6fb',
        p: 2,
      }}
    >
      <Paper elevation={2} sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Portal Sindical
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Inicia sesión para acceder a tu panel
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={cargando}
              fullWidth
            >
              {cargando ? 'Entrando...' : 'Iniciar sesión'}
            </Button>

            <Typography variant="body2" textAlign="center" color="text.secondary">
              ¿No tienes cuenta?{' '}
              <Link to="/register" style={{ color: '#1976d2' }}>
                Regístrate
              </Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

function traducirError(msg) {
  if (msg.includes('Invalid login credentials')) {
    return 'Email o contraseña incorrectos';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Tienes que confirmar tu email antes de iniciar sesión';
  }
  return msg;
}
