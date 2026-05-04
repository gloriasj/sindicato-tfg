// src/pages/RecuperarPassword.jsx
// -------------------------------------------------------
// Pantalla donde el usuario pide un email con enlace
// para restablecer su contraseña. Supabase envía el email
// automáticamente con un enlace que lleva a /restablecer.
// -------------------------------------------------------

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, Stack,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';

export default function RecuperarPassword() {
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [error, setError]       = useState(null);
  const [exito, setExito]       = useState(false);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    // El redirectTo debe coincidir con la URL de la app.
    // Supabase añadirá un token al enlace que se incluye en el email.
    const { error: errSupabase } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/restablecer`,
      },
    );

    if (errSupabase) {
      setError(errSupabase.message);
      setCargando(false);
    } else {
      setExito(true);
      setCargando(false);
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: '#f3f6fb', p: 2,
    }}>
      <Paper elevation={2} sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/login')}
          size="small"
          sx={{ mb: 1 }}
        >
          Volver al inicio de sesión
        </Button>

        <Typography variant="h5" fontWeight={600} gutterBottom>
          Recuperar contraseña
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Introduce tu email y te enviaremos un enlace para
          restablecer tu contraseña.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {exito && (
              <Alert severity="success">
                Si la cuenta existe, recibirás un email con el enlace en unos minutos.
                Revisa también la carpeta de spam.
              </Alert>
            )}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoFocus
              disabled={exito}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={cargando || exito}
              fullWidth
            >
              {cargando ? 'Enviando...' : 'Enviar enlace'}
            </Button>

            <Typography variant="body2" textAlign="center" color="text.secondary">
              ¿Recuerdas tu contraseña?{' '}
              <Link to="/login" style={{ color: '#1976d2' }}>
                Inicia sesión
              </Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
