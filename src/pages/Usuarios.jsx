
import { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, MenuItem,
    Select, Switch, FormControlLabel, CircularProgress, Alert,
    Avatar, Stack, IconButton, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Button
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon
} from '@mui/icons-material';

import { supabase, supabaseCrearUsuarios } from '../lib/supabase';
import { useNotificacion } from '../context/NotificacionContext';


const inputStyle = {
    '& .MuiInputLabel-root': { color: '#64748b' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1d4ed8' },
    '& .MuiOutlinedInput-root': {
        color: '#000000',
        backgroundColor: '#ffffff',
        '& fieldset': { borderColor: '#cbd5e1' },
        '&:hover fieldset': { borderColor: '#94a3b8' },
        '&.Mui-focused fieldset': { borderColor: '#1d4ed8' },
    },
    '& .MuiInputBase-input': { color: '#000000' },
    '& .MuiInputBase-input:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
        WebkitTextFillColor: '#000000 !important',
        // Se elimina la propiedad transition conflictiva que congelaba la vista al poner la '@'
    },
    '& .MuiSvgIcon-root': { color: '#64748b' },
};

const cardStyle = {
    background: 'linear-gradient(180deg, #131c33 0%, #0c1428 100%)',
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
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

function ModalNuevoUsuario({ abierto, onCerrar, onUsuarioCreado }) {
    const { exito, error: notificarError } = useNotificacion();
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoApellido, setNuevoApellido] = useState('');
    const [nuevoEmailForm, setNuevoEmailForm] = useState('');
    const [nuevoPassword, setNuevoPassword] = useState('');
    const [creandoUsuario, setCreandoUsuario] = useState(false);

    async function handleCrearUsuario(e) {
        e.preventDefault();
        setCreandoUsuario(true);
        try {
            const { data: authData, error: authError } = await supabaseCrearUsuarios.auth.signUp({
                email: nuevoEmailForm,
                password: nuevoPassword,
                options: { data: { nombre: nuevoNombre, apellidos: nuevoApellido, rol: 'delegado' } }
            });
            if (authError) throw authError;
            if (authData?.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: authData.user.id,
                        nombre: nuevoNombre,
                        apellidos: nuevoApellido,
                        email: nuevoEmailForm,
                        rol: 'delegado',
                        activo: true
                    });
                if (profileError) throw profileError;
            }
            exito(`Usuario "${nuevoNombre}" registrado correctamente.`);
            setNuevoNombre('');
            setNuevoApellido('');
            setNuevoEmailForm('');
            setNuevoPassword('');
            onCerrar();
            onUsuarioCreado();
        } catch (err) {
            notificarError('Error al registrar: ' + err.message);
        } finally {
            setCreandoUsuario(false);
        }
    }

    return (
        <Dialog open={abierto} onClose={() => !creandoUsuario && onCerrar()} PaperProps={{ sx: dialogPaperStyle }} maxWidth="xs" fullWidth>
            <form onSubmit={handleCrearUsuario}>
                <DialogTitle sx={{ fontWeight: 600 }}>Registrar Nuevo Delegado</DialogTitle>
                <DialogContent dividers sx={{ borderColor: '#1e293b' }}>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label="Nombre" required fullWidth value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} sx={inputStyle} />
                        <TextField label="Apellidos" required fullWidth value={nuevoApellido} onChange={(e) => setNuevoApellido(e.target.value)} sx={inputStyle} />
                        <TextField label="Email" type="email" required fullWidth value={nuevoEmailForm} onChange={(e) => setNuevoEmailForm(e.target.value)} sx={inputStyle} />
                        <TextField label="Contraseña" type="password" required fullWidth value={nuevoPassword} onChange={(e) => setNuevoPassword(e.target.value)} sx={inputStyle} helperText="Mínimo 6 caracteres" slotProps={{ formHelperText: { sx: { color: '#64748b' } } }} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #1e293b' }}>
                    <Button onClick={onCerrar} disabled={creandoUsuario} sx={{ color: '#94a3b8' }}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={creandoUsuario}>
                        {creandoUsuario ? 'Registrando...' : 'Registrar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default function Usuarios() {
    const { exito, error: notificarError } = useNotificacion();

    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError]       = useState(null);


    const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);


    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    const [usuarioEditar, setUsuarioEditar] = useState(null);
    const [editNombre, setEditNombre]       = useState('');
    const [editApellido, setEditApellido]   = useState('');
    const [guardandoEditar, setGuardandoEditar] = useState(false);

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

    function abrirModalEditar(usuario) {
        setUsuarioEditar(usuario);
        setEditNombre(usuario.nombre || '');
        setEditApellido(usuario.apellidos || '');
        setModalEditarAbierto(true);
    }

    async function handleGuardarEditar(e) {
        e.preventDefault();
        if (!editNombre.trim() || !editApellido.trim()) return;

        setGuardandoEditar(true);

        const { error } = await supabase
            .from('profiles')
            .update({
                nombre: editNombre.trim(),
                apellidos: editApellido.trim()
            })
            .eq('id', usuarioEditar.id);

        setGuardandoEditar(false);

        if (error) {
            notificarError('No se pudo actualizar el perfil: ' + error.message);
        } else {
            setUsuarios((prev) =>
                prev.map((u) => (u.id === usuarioEditar.id ? { ...u, nombre: editNombre.trim(), apellidos: editApellido.trim() } : u))
            );
            exito('Datos de usuario actualizados correctamente');
            setModalEditarAbierto(false);
        }
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#080d1c', pt: 4, pb: 8 }}>
            <Container maxWidth="lg">

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#ffffff' }}>Gestión de Usuarios</Typography>
                        <Typography variant="body1" sx={{ color: '#94a3b8', mt: 0.5 }}>
                            Control de acceso, edición de credenciales y activación de cuentas del personal.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setModalNuevoAbierto(true)}
                            size="small"
                            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                        >
                            Nuevo Delegado
                        </Button>
                    </Stack>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Paper sx={{ ...cardStyle, p: 0, overflow: 'hidden' }}>
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
                                        <TableCell sx={tableHeadStyle}>Estado de la Cuenta</TableCell>
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
                                                                {esActivo ? 'Activa' : 'Inactiva'}
                                                            </Typography>
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={tableCellStyle}>
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Tooltip title="Editar Nombre/Apellidos">
                                                            <IconButton size="small" onClick={() => abrirModalEditar(u)} sx={{ color: '#94a3b8', '&:hover': { color: '#fff' } }}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>


                <ModalNuevoUsuario
                    abierto={modalNuevoAbierto}
                    onCerrar={() => setModalNuevoAbierto(false)}
                    onUsuarioCreado={cargarUsuarios}
                />


                <Dialog open={modalEditarAbierto} onClose={() => !guardandoEditar && setModalEditarAbierto(false)} fullWidth maxWidth="xs" PaperProps={{ sx: dialogPaperStyle }}>
                    <form onSubmit={handleGuardarEditar}>
                        <DialogTitle sx={{ fontWeight: 600 }}>Modificar Datos del Perfil</DialogTitle>
                        <DialogContent dividers sx={{ borderColor: '#1e293b' }}>
                            <Stack spacing={2} sx={{ pt: 1 }}>
                                <TextField
                                    label="Nombre"
                                    required
                                    fullWidth
                                    value={editNombre}
                                    onChange={(e) => setEditNombre(e.target.value)}
                                    sx={inputStyle}
                                />
                                <TextField
                                    label="Apellidos"
                                    required
                                    fullWidth
                                    value={editApellido}
                                    onChange={(e) => setEditApellido(e.target.value)}
                                    sx={inputStyle}
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, borderTop: '1px solid #1e293b' }}>
                            <Button onClick={() => setModalEditarAbierto(false)} disabled={guardandoEditar} sx={{ color: '#94a3b8' }}>Cancelar</Button>
                            <Button type="submit" variant="contained" disabled={guardandoEditar}>
                                {guardandoEditar ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

            </Container>
        </Box>
    );
}