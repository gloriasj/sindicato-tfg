// src/components/Layout.jsx
// -------------------------------------------------------
// Layout principal con menú lateral filtrado por rol:
// - Admin: ve todas las secciones
// - Delegado: NO ve Sectores
// -------------------------------------------------------

import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, IconButton, Typography, Drawer,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, Button, Avatar, Stack, Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotificacion } from '../context/NotificacionContext';
import { usePermisos } from '../lib/usePermisos';
import DialogoConfirmacion from './DialogoConfirmacion';
import Logo from './Logo';

const ANCHO_DRAWER = 240;

export default function Layout() {
  const { profile, logout } = useAuth();
  const { info } = useNotificacion();
  const { esAdmin, puedeAdministrarSectores } = usePermisos();
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [confirmarLogout, setConfirmarLogout] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  // Construimos el menú dinámicamente según el rol
  const opcionesMenu = [
    { ruta: '/dashboard',   etiqueta: 'Dashboard',   icono: <DashboardIcon /> },
    { ruta: '/afiliados',   etiqueta: 'Afiliados',   icono: <PeopleIcon /> },
    { ruta: '/incidencias', etiqueta: 'Incidencias', icono: <AssignmentIcon /> },
    // Sectores solo lo ven los administradores
    ...(puedeAdministrarSectores
      ? [{ ruta: '/sectores', etiqueta: 'Sectores', icono: <CategoryIcon /> }]
      : []),
  ];

  function handleNavegar(ruta) {
    navigate(ruta);
    setDrawerAbierto(false);
  }

  async function handleLogout() {
    setCerrandoSesion(true);
    await logout();
    setCerrandoSesion(false);
    setConfirmarLogout(false);
    info('Sesión cerrada correctamente');
    navigate('/login');
  }

  const contenidoDrawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2.5 }}>
        <Logo size="sm" />
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, py: 1 }}>
        {opcionesMenu.map((opcion) => (
          <ListItem key={opcion.ruta} disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(opcion.ruta)}
              onClick={() => handleNavegar(opcion.ruta)}
              sx={{
                mx: 1, borderRadius: 1.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{opcion.icono}</ListItemIcon>
              <ListItemText primary={opcion.etiqueta} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{
            bgcolor: esAdmin ? 'secondary.main' : 'primary.main',
            width: 36, height: 36
          }}>
            {profile?.nombre?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {profile?.nombre} {profile?.apellidos}
            </Typography>
            {/* Badge de rol con color distinto según admin/delegado */}
            <Chip
              label={esAdmin ? 'Administrador' : 'Delegado'}
              size="small"
              color={esAdmin ? 'secondary' : 'default'}
              sx={{ height: 18, fontSize: '0.65rem', mt: 0.3 }}
            />
          </Box>
        </Stack>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={() => setConfirmarLogout(true)}
          sx={{ mt: 1.5 }}
          color="inherit"
          size="small"
        >
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          display: { md: 'none' },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => setDrawerAbierto(true)}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ ml: 1 }}>
            <Logo size="sm" />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: ANCHO_DRAWER,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: '0 0 12px rgba(0,0,0,0.04)',
          },
        }}
        open
      >
        {contenidoDrawer}
      </Drawer>

      <Drawer
        variant="temporary"
        open={drawerAbierto}
        onClose={() => setDrawerAbierto(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: ANCHO_DRAWER, boxSizing: 'border-box' },
        }}
      >
        {contenidoDrawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${ANCHO_DRAWER}px)` },
          ml: { md: `${ANCHO_DRAWER}px` },
          mt: { xs: 7, md: 0 },
          minHeight: '100vh', 
        }}
      >
        <Outlet />
      </Box>

      <DialogoConfirmacion
        abierto={confirmarLogout}
        titulo="Cerrar sesión"
        mensaje="¿Seguro que quieres cerrar tu sesión? Tendrás que volver a iniciar sesión para acceder a la aplicación."
        textoConfirmar="Cerrar sesión"
        onConfirmar={handleLogout}
        onCancelar={() => setConfirmarLogout(false)}
        cargando={cerrandoSesion}
      />
    </Box>
  );
}
