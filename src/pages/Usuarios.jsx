// src/pages/Usuarios.jsx
// -------------------------------------------------------
// Panel de gestión de usuarios del sistema.
// Acceso exclusivo para el Administrador. Permite listar usuarios,
// modificar su rol operativo y activar/desactivar sus cuentas.
// -------------------------------------------------------

import { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, MenuItem,
    Select, Switch, FormControlLabel, CircularProgress, Alert,
    Avatar, Stack
} from '@mui/material';
import { AdminPanelSettings as AdminIcon, Badge as DelegadoIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useNotificacion } from '../context/NotificacionContext';

export default function Usuarios() {
    const { exito, error: notificarError } = useNotificacion();

    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError]       = useState(null);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    async function cargarUsuarios() {
        setCargando(true);
        setError(null);

        // Consultamos la tabla profiles de Supabase
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
        // Nota: Asumimos que tu tabla profiles tiene una columna booleana 'activo'
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

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight={600}>Gestión de Usuarios</Typography>
                <Typography variant="body1" color="text.secondary">
                    Control de acceso, asignación de roles y activación de cuentas del personal sindical.
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
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
}