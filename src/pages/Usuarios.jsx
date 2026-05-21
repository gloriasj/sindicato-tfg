// src/pages/Usuarios.jsx
// -------------------------------------------------------
// Panel de gestión de usuarios del sistema.
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

// --- ESTILOS VISUALES ---
const cardStyle = {
    background: 'linear-gradient(180deg, #131c33 0%, #0c1428 100%)',
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
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
    },
    '& .MuiSvgIcon-root': { color: '#94a3b8' },
};

const dialogPaperStyle = {
    background: '#0c1428',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 3,
    color: '#fff',
    boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
};

const tableHeadStyle = { color: '#94a3b8', borderBottom: '1px solid #1e293b', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.2)' };
const tableCellStyle = { color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' };

export default function Usuarios() {
    const { exito, error: notificarError } = useNotificacion();

    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError]       = useState(null);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioEditar, setUsuarioEditar] = useState(null);
    const [nuevoEmail, setNuevoEmail]       = useState('');
    const [guardandoEmail, setGuardandoEmail] = useState(false);

    useEffect(() => { cargarUsuarios(); }, []);

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
            exito(`Rol actualizado correctamente`);
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
            exito(nuevoEstado ? 'Usuario activado' : 'Usuario desactivado');
        }
    }

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
            exito('Correo actualizado');
            setModalAbierto(false);
        }
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#080d1c', pt: 4, pb: 8 }}>
            <Container maxWidth="lg">

                <Box mb={8}>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#ffffff' }}>Gestión de Usuarios</Typography>
                    <Typography variant="body1" sx={{ color: '#94a3b8', mt: 0.5 }}>
                        Control de acceso, edición de credenciales y activación de cuentas del personal.
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {/* AÑADIDO mt: 4 PARA SEPARAR EL PAPER DEL SUBTÍTULO */}
                <Paper sx={{ ...cardStyle, p: 0, overflow: 'hidden', mt: 4 }}>
                    {cargando ? (
                        <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>
                    ) : usuarios.length === 0 ? (
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                            <Typography sx={{ color: '#94a3b8' }}>No hay usuarios registrados.</Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={tableHeadStyle}>Usuario</TableCell>
                                        <TableCell sx={tableHeadStyle}>Email</TableCell>
                                        <TableCell sx={tableHeadStyle}>Rol del Sistema</TableCell>
                                        <TableCell sx={tableHeadStyle}>Estado</TableCell>
                                        <TableCell align="right" sx={tableHeadStyle}>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {usuarios.map((u) => {
                                        const iniciales = ((u.nombre?.[0] ?? '') + (u.apellidos?.[0] ?? '')).toUpperCase();
                                        const esActivo = u.activo ?? true;
                                        return (
                                            <TableRow key={u.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                                <TableCell sx={tableCellStyle}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar sx={{ bgcolor: u.rol === 'admin' ? '#3b82f6' : '#94a3b8', width: 36, height: 36, fontSize: 14 }}>
                                                            {iniciales || '?'}
                                                        </Avatar>
                                                        <Typography variant="body2" fontWeight={600} sx={{ color: '#ffffff' }}>
                                                            {u.apellidos ? `${u.apellidos}, ${u.nombre}` : u.nombre || 'Sin nombre'}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ color: '#94a3b8' }}>{u.email || '—'}</TableCell>
                                                <TableCell sx={tableCellStyle}>
                                                    <Select
                                                        value={u.rol || 'delegado'}
                                                        onChange={(e) => cambiarRol(u.id, e.target.value)}
                                                        size="small"
                                                        sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#1e293b' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } }}
                                                    >
                                                        <MenuItem value="admin">Administrador</MenuItem>
                                                        <MenuItem value="delegado">Delegado</MenuItem>
                                                    </Select>
                                                </TableCell>
                                                <TableCell sx={tableCellStyle}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={esActivo}
                                                                onChange={(e) => cambiarEstadoActivo(u.id, e.target.checked)}
                                                                color="success"
                                                            />
                                                        }
                                                        label={
                                                            <Typography
                                                                variant="body2"
                                                                sx={{ color: esActivo ? '#22c55e' : '#94a3b8', fontWeight: 600 }}
                                                            >
                                                                {esActivo ? 'Activo' : 'Inactivo'}
                                                            </Typography>
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={tableCellStyle}>
                                                    <Tooltip title="Editar Email">
                                                        <IconButton size="small" onClick={() => abrirModalEmail(u)} sx={{ color: '#94a3b8', '&:hover': { color: '#fff' } }}>
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

                <Dialog open={modalAbierto} onClose={() => !guardandoEmail && setModalAbierto(false)} fullWidth maxWidth="xs" PaperProps={{ sx: dialogPaperStyle }}>
                    <form onSubmit={guardarEmail}>
                        <DialogTitle>Modificar Correo Electrónico</DialogTitle>
                        <DialogContent dividers sx={{ borderColor: '#1e293b' }}>
                            <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 2 }}>
                                Estás editando el email de <strong>{usuarioEditar?.nombre}</strong>.
                            </Typography>
                            <TextField
                                label="Nuevo Email"
                                type="email"
                                required
                                fullWidth
                                value={nuevoEmail}
                                onChange={(e) => setNuevoEmail(e.target.value)}
                                sx={inputStyle}
                            />
                        </DialogContent>
                        <DialogActions sx={{ p: 2, borderTop: '1px solid #1e293b' }}>
                            <Button onClick={() => setModalAbierto(false)} disabled={guardandoEmail} sx={{ color: '#94a3b8' }}>Cancelar</Button>
                            <Button type="submit" variant="contained" disabled={guardandoEmail}>
                                {guardandoEmail ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Container>
        </Box>
    );
}