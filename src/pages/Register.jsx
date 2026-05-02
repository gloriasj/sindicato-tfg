// src/pages/Register.jsx
// -------------------------------------------------------
// Registro de nuevos usuarios (admin o delegados).
// El trigger handle_new_user de Supabase crea
// automáticamente la fila en la tabla profiles.
// -------------------------------------------------------

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, Stack,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { registro } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre]       = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [rol, setRol]             = useState('delegado');
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

    const { error } = await registro(email, password, {
      nombre,
      apellidos,
      rol,
    });

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
      <Paper elevation={2} sx={{ p: 4, maxWidth: 460, width: '100%' }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Crear cuenta
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Registra un nuevo usuario del sistema
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {exito && (
              <Alert severity="success">
                Cuenta creada. Redirigiendo al login...
              </Alert>
            )}

            <Stack direction="row" spacing={2}>
              <TextField
                label="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                required
                fullWidth
              />
            </Stack>

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              helperText="Mínimo 6 caracteres"
            />

            <TextField
              select
              label="Rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              fullWidth
            >
              <MenuItem value="delegado">Delegado sindical</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </TextField>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={cargando || exito}
              fullWidth
            >
              {cargando ? 'Creando cuenta...' : 'Registrarse'}
            </Button>

            <Typography variant="body2" textAlign="center" color="text.secondary">
              ¿Ya tienes cuenta?{' '}
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
