// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert, Stack, Divider, Paper, Container
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { registro } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre]       = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState(null);
  const [exito, setExito]         = useState(false);
  const [cargando, setCargando]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setCargando(true);
    const { error } = await registro(email, password, { nombre, apellidos, rol: 'delegado' });
    if (error) {
      setError(error.message);
      setCargando(false);
    } else {
      setExito(true);
      setCargando(false);
      setTimeout(() => navigate('/login'), 1500);
    }
  }

  return (
      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#080d1c', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper sx={{ width: '100%', maxWidth: 440, p: 4, background: '#0c1428', border: '1px solid #1e293b' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#fff', mb: 1 }}>Crear cuenta</Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>Regístrate para acceder al portal.</Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              {exito && <Alert severity="success">Cuenta creada. Redirigiendo...</Alert>}

              <TextField label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required fullWidth sx={{ input: { color: '#fff' }, label: { color: '#94a3b8' } }} />
              <TextField label="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required fullWidth sx={{ input: { color: '#fff' }, label: { color: '#94a3b8' } }} />
              <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth sx={{ input: { color: '#fff' }, label: { color: '#94a3b8' } }} />
              <TextField label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth sx={{ input: { color: '#fff' }, label: { color: '#94a3b8' } }} />

              <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2 }}>
                {cargando ? 'Cargando...' : 'Registrarse'}
              </Button>

              <Button component={Link} to="/login" variant="text" fullWidth sx={{ mt: 1 }}>
                ¿Ya tienes cuenta? Inicia sesión
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
  );
}