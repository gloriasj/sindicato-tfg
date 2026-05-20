// src/pages/Usuarios.jsx
// -------------------------------------------------------
// Panel de gestión de usuarios del sistema.
// Acceso exclusivo para el Administrador. Permite listar usuarios,
// modificar su rol operativo, cambiar su email y activar/desactivar cuentas.
// -------------------------------------------------------

import { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, MenuItem,
    Select, Switch, FormControlLabel, CircularProgress, Alert,
    Avatar, Stack, IconButton, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Button
} from '@mui/material';
import {
    AdminPanelSettings as AdminIcon,
    Badge as DelegadoIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useNotificacion } from '../context/NotificacionContext';

export default function Usuarios() {
    const { exito, error: notificarError } = useNotificacion();

    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError]       = useState(null);

    // Estados para el Modal de Editar Email
    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioEditar, setUsuarioEditar] = useState(null);
    const [nuevoEmail, setNuevoEmail]       = useState('');
    const [guardandoEmail, setGuardandoEmail] = useState(false);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    async function cargarUsuarios() {
        setCargando(true);
        setError(null);

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('apellidos', { ascending: true });

        if (error) {
            setError('No se pudo cargar la lista de usuarios: ' + error.message);
        } else {
            setUsuarios(data ?? []);
        }
        setCargando(false);
    }

    async function cambiarRol(usuarioId, nuevoRol) {
        const { error } = await supabase
            .from('profiles')
            .update({ rol: nuevoRol })
            .eq('id', usuarioId);

        if (error) {
            notificarError('No se pudo actualizar el rol: ' + error.message);
        } else {
            setUsuarios((prev) =>
                prev.map((u) => (u.id === usuarioId ? { ...u, rol: nuevoRol } : u))
            );
            exito(`Rol actualizado correctamente a ${nuevoRol}`);
        }
    }

    async function cambiarEstadoActivo(usuarioId, nuevoEstado) {
        const { error } = await supabase
            .from('profiles')
            .update({ activo: nuevoEstado })
            .eq('id', usuarioId);

        if (error) {
            notificarError('No se pudo cambiar el estado: ' + error.message);
        } else {
            setUsuarios((prev) =>
                prev.map((u) => (u.id === usuarioId ? { ...u, activo: nuevoEstado } : u))
            );
            exito(nuevoEstado ? 'Usuario activado correctamente' : 'Usuario desactivado correctamente');
        }
    }

    // --- LÓGICA PARA ABRIR MODAL Y GUARDAR EL EMAIL ---
    function abrirModalEmail(usuario) {
        setUsuarioEditar(usuario);
        setNuevoEmail(usuario.email || '');
        setModalAbierto(true);
    }

    async function guardarEmail(e) {
        e.preventDefault();
        if (!nuevoEmail.trim()) return;

        setGuardandoEmail(true);

        const { error } = await supabase
            .from('profiles')
            .update({ email: nuevoEmail.trim() })
            .eq('id', usuarioEditar.id);

        setGuardandoEmail(false);

        if (error) {
            notificarError('No se pudo actualizar el email: ' + error.message);
        } else {
            setUsuarios((prev) =>
                prev.map((u) => (u.id === usuarioEditar.id ? { ...u, email: nuevoEmail.trim() } : u))
            );
            exito('Correo electrónico actualizado con éxito');
            setModalAbierto(false);
        }
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight={600}>Gestión de Usuarios</Typography>
                <Typography variant="body1" color="text.secondary">
                    Control de acceso, edición de credenciales y activación de cuentas del personal sindical.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                {cargando ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>
                ) : usuarios.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No hay usuarios registrados en el sistema.</Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.50' }}>
                                    <TableCell><strong>Usuario</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Rol del Sistema</strong></TableCell>
                                    <TableCell><strong>Estado de Cuenta</strong></TableCell>
                                    <TableCell align="right"><strong>Acciones</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {usuarios.map((u) => {
                                    const iniciales = ((u.nombre?.[0] ?? '') + (u.apellidos?.[0] ?? '')).toUpperCase();
                                    return (
                                        <TableRow key={u.id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{ bgcolor: u.rol === 'admin' ? 'primary.main' : 'orange.main', width: 36, height: 36, fontSize: 14 }}>
                                                        {iniciales || '?'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {u.apellidos ? `${u.apellidos}, ${u.nombre}` : u.nombre || 'Usuario sin nombre'}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{u.email || '—'}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={u.rol || 'delegado'}
                                                    onChange={(e) => cambiarRol(u.id, e.target.value)}
                                                    size="small"
                                                    startAdornment={
                                                        u.rol === 'admin' ?
                                                            <AdminIcon color="primary" fontSize="small" sx={{ mr: 1 }} /> :
                                                            <DelegadoIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                                                    }
                                                    sx={{ minWidth: 140 }}
                                                >
                                                    <MenuItem value="admin">Administrador</MenuItem>
                                                    <MenuItem value="delegado">Delegado</MenuItem>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={u.activo ?? true}
                                                            onChange={(e) => cambiarEstadoActivo(u.id, e.target.checked)}
                                                            color="success"
                                                        />
                                                    }
                                                    label={u.activo ?? true ? 'Activo' : 'Inactivo'}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Editar Email">
                                                    <IconButton size="small" onClick={() => abrirModalEmail(u)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* MODAL PARA EDITAR EMAIL */}
            <Dialog open={modalAbierto} onClose={() => !guardandoEmail && setModalAbierto(false)} fullWidth maxWidth="xs">
                <form onSubmit={guardarEmail}>
                    <DialogTitle>Modificar Correo Electrónico</DialogTitle>
                    <DialogContent dividers>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Estás editando las credenciales de contacto de <strong>{usuarioEditar?.nombre} {usuarioEditar?.apellidos}</strong>.
                        </Typography>
                        <TextField
                            label="Nuevo Email"
                            type="email"
                            required
                            fullWidth
                            value={nuevoEmail}
                            onChange={(e) => setNuevoEmail(e.target.value)}
                            placeholder="correo@sindicato.es"
                            sx={{ mt: 1 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setModalAbierto(false)} disabled={guardandoEmail}>Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={guardandoEmail}>
                            {guardandoEmail ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
}