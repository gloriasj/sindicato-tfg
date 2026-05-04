// src/pages/Register.jsx
// -------------------------------------------------------
// Pantalla de registro con el mismo aspecto que el Login:
// dos columnas, branding a la izquierda, formulario a la
// derecha. En móvil colapsa a una columna.
// -------------------------------------------------------

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert, Stack,
  MenuItem, Divider,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

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

    const { error } = await registro(email, password, { nombre, apellidos, rol });

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
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>

      {/* ============== COLUMNA IZQUIERDA ============== */}
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
        <Box sx={{
          position: 'absolute', top: -120, right: -80,
          width: 320, height: 320,
          bgcolor: 'rgba(255,255,255,0.04)',
          borderRadius: '50%',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -160, left: -100,
          width: 380, height: 380,
          bgcolor: 'rgba(241,136,13,0.06)',
          borderRadius: '50%',
        }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box component="img" src="/logo.svg" alt="Portal Sindical"
              sx={{ width: 44, height: 44 }} />
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

        <Box sx={{
          position: 'relative', zIndex: 1, flex: 1,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          mt: -4,
        }}>
          <Typography variant="h3" fontWeight={700} sx={{
            color: 'white',
            letterSpacing: '-0.02em',
            mb: 2,
            maxWidth: 420,
          }}>
            Únete al equipo del sindicato.
          </Typography>
          <Typography variant="body1" sx={{
            color: 'rgba(255,255,255,0.75)',
            maxWidth: 420,
            lineHeight: 1.6,
          }}>
            Crea tu cuenta y empieza a gestionar afiliados,
            registrar incidencias y aportar al colectivo desde
            una herramienta única, segura y trazable.
          </Typography>
        </Box>

        <Typography variant="caption" sx={{
          color: 'rgba(255,255,255,0.5)',
          position: 'relative',
          zIndex: 1,
        }}>
          © {new Date().getFullYear()} Portal Sindical · Trabajo Fin de Grado
        </Typography>
      </Box>

      {/* ============== COLUMNA DERECHA ============== */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: { xs: 3, sm: 6 },
          overflowY: 'auto',
        }}
      >
        <Box sx={{ display: { md: 'none' }, mb: 4 }}>
          <Logo size="md" centrado />
        </Box>

        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Typography variant="h4" fontWeight={700} mb={1}>
            Crear cuenta
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Regístrate para acceder al portal del sindicato.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}
              {exito && (
                <Alert severity="success">
                  Cuenta creada. Redirigiendo al inicio de sesión...
                </Alert>
              )}

              <Stack direction="row" spacing={2}>
                <TextField label="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required fullWidth
                />
                <TextField label="Apellidos"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  required fullWidth
                />
              </Stack>

              <TextField label="Email" type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required fullWidth
                placeholder="tucorreo@sindicato.es"
              />

              <TextField label="Contraseña" type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required fullWidth
                helperText="Mínimo 6 caracteres"
              />

              <TextField select label="Rol"
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
                sx={{ py: 1.4, fontSize: '0.95rem' }}
              >
                {cargando ? 'Creando cuenta...' : 'Registrarse'}
              </Button>

              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  ¿Ya tienes cuenta?
                </Typography>
              </Divider>

              <Button
                component={Link}
                to="/login"
                variant="outlined"
                size="large"
                fullWidth
                sx={{ py: 1.4 }}
              >
                Iniciar sesión
              </Button>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
