// src/pages/RecuperarPassword.jsx
// -------------------------------------------------------
// Pantalla de recuperación de contraseña con estilo oscuro.
// -------------------------------------------------------

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, Stack,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#080d1c',
        p: 2
      }}>
        <Paper sx={{ ...cardStyle, maxWidth: 420, width: '100%' }}>
          <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/login')}
              size="small"
              sx={{ mb: 2, color: '#94a3b8', '&:hover': { color: '#ffffff' } }}
          >
            Volver al inicio de sesión
          </Button>

          <Typography variant="h5" fontWeight={700} sx={{ color: '#ffffff', mb: 1 }}>
            Recuperar contraseña
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {error && <Alert severity="error" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>{error}</Alert>}
              {exito && (
                  <Alert severity="success" sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80' }}>
                    Si la cuenta existe, recibirás un email con el enlace en unos minutos. Revisa tu carpeta de spam.
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
                  sx={inputStyle}
              />

              <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={cargando || exito}
                  fullWidth
                  sx={{ py: 1.4 }}
              >
                {cargando ? 'Enviando...' : 'Enviar enlace'}
              </Button>

              <Typography variant="body2" textAlign="center" sx={{ color: '#64748b', mt: 1 }}>
                ¿Recuerdas tu contraseña?{' '}
                <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
                  Inicia sesión
                </Link>
              </Typography>
            </Stack>
          </form>
        </Paper>
      </Box>
  );
}