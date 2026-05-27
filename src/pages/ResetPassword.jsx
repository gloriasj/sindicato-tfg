
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, Stack,
} from '@mui/material';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError]         = useState(null);
  const [exito, setExito]         = useState(false);
  const [cargando, setCargando]   = useState(false);
  const [sesionLista, setSesionLista] = useState(false);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSesionLista(true);
      } else {
        setError('Enlace inválido o caducado. Solicita uno nuevo.');
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);

    const { error: errSupabase } = await supabase.auth.updateUser({
      password,
    });

    if (errSupabase) {
      setError(errSupabase.message);
      setCargando(false);
    } else {
      setExito(true);
      setCargando(false);
      // Cerrar sesión por seguridad y redirigir a login
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/login');
      }, 1800);
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: '#f3f6fb', p: 2,
    }}>
      <Paper elevation={2} sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Nueva contraseña
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Introduce tu nueva contraseña.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && (
              <Alert severity="error" action={
                <Link to="/recuperar" style={{ color: 'inherit' }}>
                  Pedir uno nuevo
                </Link>
              }>
                {error}
              </Alert>
            )}
            {exito && (
              <Alert severity="success">
                Contraseña actualizada. Redirigiendo al inicio de sesión...
              </Alert>
            )}

            <TextField
              label="Nueva contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoFocus
              disabled={!sesionLista || exito}
              helperText="Mínimo 6 caracteres"
            />

            <TextField
              label="Repetir contraseña"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              fullWidth
              disabled={!sesionLista || exito}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={cargando || exito || !sesionLista}
              fullWidth
            >
              {cargando ? 'Actualizando...' : 'Cambiar contraseña'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
