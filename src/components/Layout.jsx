// src/components/Layout.jsx
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, AppBar, Toolbar, IconButton, Drawer,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Typography
} from '@mui/material';
import {
    Menu as MenuIcon,
    HomeOutlined as HomeIcon,
    AssignmentOutlined as AssignmentIcon,
    PeopleOutlined as PeopleIcon,
    GridViewOutlined as CategoryIcon,
    PersonOutlineOutlined as AdminIcon,
    SettingsOutlined as SettingsIcon,
    LogoutOutlined as LogoutIcon,
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import { useNotificacion } from '../context/NotificacionContext';
import { usePermisos } from '../lib/usePermisos';
import DialogoConfirmacion from './DialogoConfirmacion';
import Logo from './Logo';

const ANCHO_DRAWER = 260;

export default function Layout() {
    const { logout } = useAuth(); // Quitamos 'profile' si no lo mostramos aquí abajo
    const { info } = useNotificacion();
    const { puedeAdministrarSectores, puedeGestionarUsuarios } = usePermisos();

    const navigate = useNavigate();
    const location = useLocation();

    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [confirmarLogout, setConfirmarLogout] = useState(false);
    const [cerrandoSesion, setCerrandoSesion] = useState(false);

    // Mantenemos tu lógica de permisos, pero ajustamos nombres y orden a la imagen
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

    const contenidoDrawer = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0b1121' }}>

            {/* Cabecera del Logo (Ajustada a la imagen) */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
                <Logo size="sm" />
                {/* Si tu componente Logo no incluye el texto "Gestión de Incidencias",
                    puedes añadirlo aquí al lado modificando el componente Logo */}
            </Box>

            {/* Lista Principal de Navegación */}
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
                                        bgcolor: '#3b2e7e', // El morado sólido de la imagen
                                        '&:hover': {
                                            bgcolor: '#3b2e7e',
                                        },
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

            {/* Footer del Sidebar (Ajustes y Cerrar sesión) */}
            <Box sx={{ px: 2, pb: 3 }}>
                <List disablePadding>
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            sx={{
                                borderRadius: '10px',
                                color: '#94a3b8',
                                py: 1.2,
                                px: 2.5,
                                '& .MuiListItemIcon-root': { color: '#94a3b8', minWidth: 40 },
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    color: '#ffffff',
                                    '& .MuiListItemIcon-root': { color: '#ffffff' }
                                },
                            }}
                        >
                            <ListItemIcon><SettingsIcon /></ListItemIcon>
                            <ListItemText primary="Ajustes" primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }} />
                        </ListItemButton>
                    </ListItem>

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
                                    bgcolor: 'rgba(239, 68, 68, 0.1)', // Fondo rojo sutil al hacer hover
                                    color: '#ef4444',
                                    '& .MuiListItemIcon-root': { color: '#ef4444' }
                                },
                            }}
                        >
                            <ListItemIcon><LogoutIcon /></ListItemIcon>
                            <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a'}}>
            {/* AppBar (Mobile) */}
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
                    <IconButton edge="start" onClick={() => setDrawerAbierto(true)} sx={{ color: '#fff' }}>
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ ml: 1 }}>
                        <Logo size="sm" />
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar Desktop */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: ANCHO_DRAWER,
                        boxSizing: 'border-box',
                        borderRight: '1px solid #1e293b', // Borde súper sutil casi invisible
                        bgcolor: '#0b1121', // Fondo oscuro idéntico a la imagen
                    },
                }}
                open
            >
                {contenidoDrawer}
            </Drawer>

            {/* Sidebar Mobile */}
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

            {/* Contenido Principal */}
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
                    bgcolor: '#0f172a' // Fondo del Dashboard, un pelo más claro que el sidebar
                }}
            >
                <Outlet />
            </Box>

            {/* Modal de Cierre de Sesión */}
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