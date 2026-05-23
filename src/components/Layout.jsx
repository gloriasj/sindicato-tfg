// src/components/Layout.jsx
// -------------------------------------------------------
// Layout principal con menú lateral y tarjeta de usuario
// logueado en la parte inferior, mostrando avatar con
// iniciales, nombre completo y rol obtenidos de la BD.
// -------------------------------------------------------

import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, AppBar, Toolbar, IconButton, Drawer, Divider,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Typography, Avatar, Stack,
} from '@mui/material';
import {
    Menu as MenuIcon,
    HomeOutlined as HomeIcon,
    AssignmentOutlined as AssignmentIcon,
    PeopleOutlined as PeopleIcon,
    GridViewOutlined as CategoryIcon,
    PersonOutlineOutlined as AdminIcon,
    LogoutOutlined as LogoutIcon,
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import { useNotificacion } from '../context/NotificacionContext';
import { usePermisos } from '../lib/usePermisos';
import DialogoConfirmacion from './DialogoConfirmacion';
import Logo from './Logo';

const ANCHO_DRAWER = 260;

// =========================================================
// Colores de avatar según el rol del usuario.
// Generamos un color estable a partir del rol para que sea
// consistente en cada sesión.
// =========================================================
function colorPorRol(rol) {
    if (rol === 'admin') return '#a855f7';   // morado (admin)
    return '#5b8def';                          // azul (delegado)
}

function iniciales(nombre, apellidos) {
    const ini1 = nombre?.[0]?.toUpperCase()    ?? '?';
    const ini2 = apellidos?.[0]?.toUpperCase() ?? '';
    return ini1 + ini2;
}

export default function Layout() {
    const { profile, logout } = useAuth();
    const { info } = useNotificacion();
    const { puedeAdministrarSectores, puedeGestionarUsuarios } = usePermisos();

    const navigate = useNavigate();
    const location = useLocation();

    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [confirmarLogout, setConfirmarLogout] = useState(false);
    const [cerrandoSesion, setCerrandoSesion] = useState(false);

    const opcionesMenu = [
        { ruta: '/dashboard',   etiqueta: 'Dashboard',   icono: <HomeIcon /> },
        { ruta: '/incidencias', etiqueta: 'Incidencias', icono: <AssignmentIcon /> },
        { ruta: '/afiliados',   etiqueta: 'Afiliados',   icono: <PeopleIcon /> },
        ...(puedeAdministrarSectores ? [{ ruta: '/sectores', etiqueta: 'Sectores', icono: <CategoryIcon /> }] : []),
        ...(puedeGestionarUsuarios ? [{ ruta: '/usuarios', etiqueta: 'Perfiles', icono: <AdminIcon /> }] : []),
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

    // === Datos del usuario logueado (vienen de la BD vía AuthContext) ===
    const nombreCompleto = profile
        ? `${profile.nombre ?? ''} ${profile.apellidos ?? ''}`.trim()
        : 'Usuario';
    const rolTexto = profile?.rol === 'admin' ? 'Administrador' : 'Delegado';
    const avatarColor = colorPorRol(profile?.rol);
    const avatarIniciales = iniciales(profile?.nombre, profile?.apellidos);

    const contenidoDrawer = (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            bgcolor: '#0b1121',
        }}>

            {/* === Cabecera del sidebar con logo === */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
                <Logo size="sm" />
            </Box>

            {/* === Menú principal === */}
            <List sx={{ flexGrow: 1, px: 2, pt: 0 }}>
                {opcionesMenu.map((opcion) => {
                    const isSelected = location.pathname.startsWith(opcion.ruta);
                    return (
                        <ListItem key={opcion.ruta} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                selected={isSelected}
                                onClick={() => handleNavegar(opcion.ruta)}
                                sx={{
                                    borderRadius: '10px',
                                    color: isSelected ? '#ffffff' : '#94a3b8',
                                    py: 1.2,
                                    px: 2.5,
                                    transition: 'all 0.2s',
                                    '& .MuiListItemIcon-root': {
                                        color: isSelected ? '#ffffff' : '#94a3b8',
                                        minWidth: 40,
                                        transition: 'all 0.2s',
                                    },
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                        color: '#ffffff',
                                        '& .MuiListItemIcon-root': { color: '#ffffff' }
                                    },
                                    '&.Mui-selected': {
                                        bgcolor: '#3b2e7e',
                                        '&:hover': { bgcolor: '#3b2e7e' },
                                    },
                                }}
                            >
                                <ListItemIcon>{opcion.icono}</ListItemIcon>
                                <ListItemText
                                    primary={opcion.etiqueta}
                                    primaryTypographyProps={{
                                        fontSize: '0.95rem',
                                        fontWeight: isSelected ? 600 : 500
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* === Acciones del footer (Cerrar sesión) === */}
            <Box sx={{ px: 2 }}>
                <List disablePadding>
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => setConfirmarLogout(true)}
                            sx={{
                                borderRadius: '10px',
                                color: '#94a3b8',
                                py: 1.2,
                                px: 2.5,
                                '& .MuiListItemIcon-root': { color: '#94a3b8', minWidth: 40 },
                                '&:hover': {
                                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    '& .MuiListItemIcon-root': { color: '#ef4444' }
                                },
                            }}
                        >
                            <ListItemIcon><LogoutIcon /></ListItemIcon>
                            <ListItemText
                                primary="Cerrar sesión"
                                primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }}
                            />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>

            {/* === Separador antes de la tarjeta de usuario === */}
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2, my: 2 }} />

            {/* === Tarjeta del usuario logueado === */}
            <Box sx={{ px: 3, pb: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{
                        bgcolor: avatarColor,
                        width: 44,
                        height: 44,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        boxShadow: `0 4px 12px ${avatarColor}40`,
                    }}>
                        {avatarIniciales}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{
                            color: '#ffffff',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {nombreCompleto}
                        </Typography>
                        <Typography sx={{
                            color: '#94a3b8',
                            fontSize: '0.78rem',
                            mt: 0.3,
                        }}>
                            {rolTexto}
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a' }}>
            {/* AppBar mobile */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    display: { md: 'none' },
                    borderBottom: '1px solid #1e293b',
                    bgcolor: '#0b1121',
                }}
            >
                <Toolbar>
                    <IconButton edge="start" onClick={() => setDrawerAbierto(true)}
                                sx={{ color: '#fff' }}>
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ ml: 1 }}>
                        <Logo size="sm" />
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar permanente (desktop) */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: ANCHO_DRAWER,
                        boxSizing: 'border-box',
                        borderRight: '1px solid #1e293b',
                        bgcolor: '#0b1121',
                    },
                }}
                open
            >
                {contenidoDrawer}
            </Drawer>

            {/* Sidebar temporal (mobile) */}
            <Drawer
                variant="temporary"
                open={drawerAbierto}
                onClose={() => setDrawerAbierto(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: ANCHO_DRAWER,
                        boxSizing: 'border-box',
                        bgcolor: '#0b1121'
                    },
                }}
            >
                {contenidoDrawer}
            </Drawer>

            {/* Contenido principal */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${ANCHO_DRAWER}px)` },
                    ml: { md: `${ANCHO_DRAWER}px` },
                    mt: { xs: 7, md: 0 },
                    minHeight: '100vh',
                    px: { xs: 2, md: 4 },
                    py: 4,
                    bgcolor: '#0f172a',
                }}
            >
                <Outlet />
            </Box>

            {/* Modal de cierre de sesión */}
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