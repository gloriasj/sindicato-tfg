
import { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Paper, List, ListItem,
  ListItemText, ListItemIcon, Chip, CircularProgress,
  Button, Stack, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Tooltip
} from '@mui/material';
import {
  Category as CategoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useNotificacion } from '../context/NotificacionContext';
import DialogoConfirmacion from '../components/DialogoConfirmacion';

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
};

const dialogPaperStyle = {
  background: '#0c1428',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 3,
  color: '#fff',
  boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
};

export default function Sectores() {
  const { exito, error: notificarError } = useNotificacion();

  const [sectores, setSectores] = useState([]);
  const [conteos, setConteos]   = useState({});
  const [cargando, setCargando] = useState(true);


  const [modalAbierto, setModalAbierto] = useState(false);
  const [sectorActual, setSectorActual] = useState(null);
  const [formulario, setFormulario]     = useState({ nombre: '', descripcion: '' });
  const [guardando, setGuardando]       = useState(false);


  const [aBorrar, setABorrar]   = useState(null);
  const [borrando, setBorrando] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    const [sectRes, contRes] = await Promise.all([
      supabase.from('sectores').select('*').order('nombre'),
      supabase.from('v_afiliados_por_sector').select('*'),
    ]);

    if (!sectRes.error) setSectores(sectRes.data ?? []);
    if (!contRes.error) {
      const map = {};
      contRes.data?.forEach((r) => { map[r.sector] = r.total; });
      setConteos(map);
    }
    setCargando(false);
  }

  function abrirModalNuevo() {
    setSectorActual(null);
    setFormulario({ nombre: '', descripcion: '' });
    setModalAbierto(true);
  }

  function abrirModalEditar(sector) {
    setSectorActual(sector);
    setFormulario({ nombre: sector.nombre, descripcion: sector.descripcion || '' });
    setModalAbierto(true);
  }

  async function guardarSector(e) {
    e.preventDefault();
    if (!formulario.nombre.trim()) return;

    setGuardando(true);
    const payload = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim() || null
    };

    let error;
    if (sectorActual) {
      // Actualizar
      const res = await supabase.from('sectores').update(payload).eq('id', sectorActual.id);
      error = res.error;
    } else {
      // Crear
      const res = await supabase.from('sectores').insert(payload);
      error = res.error;
    }

    setGuardando(false);

    if (error) {
      notificarError('Error al guardar: ' + error.message);
    } else {
      exito(sectorActual ? 'Sector actualizado' : 'Sector creado');
      setModalAbierto(false);
      cargar(); // Recargamos la lista
    }
  }


  async function confirmarBorrado() {
    if (!aBorrar) return;
    setBorrando(true);

    const { error } = await supabase.from('sectores').delete().eq('id', aBorrar.id);

    setBorrando(false);
    setABorrar(null);

    if (error) {
      if (error.code === '23503') {
        notificarError('No puedes borrar este sector porque tiene afiliados asignados.');
      } else {
        notificarError('Error al borrar: ' + error.message);
      }
    } else {
      exito('Sector eliminado correctamente');
      cargar();
    }
  }

  return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#080d1c', pt: 4, pb: 8 }}>
        <Container maxWidth="md">

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#ffffff' }}>Sectores</Typography>
              <Typography sx={{ color: '#94a3b8', mt: 0.5 }}>Catálogo de sectores profesionales del sindicato</Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={abrirModalNuevo}
                  size="small"
              >
                Nuevo Sector
              </Button>
            </Stack>
          </Box>

          <Paper sx={{ ...cardStyle, p: 0, overflow: 'hidden' }}>
            {cargando ? (
                <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>
            ) : sectores.length === 0 ? (
                <Box sx={{ p: 8, textAlign: 'center' }}>
                  <CategoryIcon sx={{ fontSize: 60, color: '#475569', mb: 2 }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                    No hay sectores registrados en el sistema.
                  </Typography>
                </Box>
            ) : (
                <List disablePadding>
                  {sectores.map((s, i) => {
                    const totalAfiliados = conteos[s.nombre] ?? 0;
                    return (
                        <ListItem
                            key={s.id}
                            sx={{
                              borderBottom: i === sectores.length - 1 ? 'none' : '1px solid #1e293b',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                              transition: 'background-color 0.2s',
                              py: 2,
                              px: 3,
                            }}
                            secondaryAction={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                    label={`${totalAfiliados} afiliado(s)`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 2, color: '#94a3b8', borderColor: '#475569' }}
                                />
                                <Tooltip title="Editar">
                                  <IconButton edge="end" onClick={() => abrirModalEditar(s)} sx={{ color: '#94a3b8', '&:hover': { color: '#fff' } }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar">
                                  <IconButton edge="end" color="error" onClick={() => setABorrar(s)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            }
                        >
                          <ListItemIcon>
                            <CategoryIcon sx={{ color: '#3b82f6' }} />
                          </ListItemIcon>
                          {/* LIST ITEM TEXT CON TYPOGRAPHY FORZADO */}
                          <ListItemText
                              primary={
                                <Typography sx={{ color: '#ffffff !important', fontWeight: '700 !important', fontSize: '1.1rem' }}>
                                  {s.nombre}
                                </Typography>
                              }
                              secondary={
                                <Typography sx={{ color: '#cbd5e1 !important', mt: 0.5 }}>
                                  {s.descripcion || 'Sin descripción'}
                                </Typography>
                              }
                          />
                        </ListItem>
                    );
                  })}
                </List>
            )}
          </Paper>

          {/* MODAL CREAR / EDITAR */}
          <Dialog
              open={modalAbierto}
              onClose={() => !guardando && setModalAbierto(false)}
              fullWidth
              maxWidth="sm"
              PaperProps={{ sx: dialogPaperStyle }}
          >
            <form onSubmit={guardarSector}>
              <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #1e293b' }}>
                {sectorActual ? 'Editar Sector' : 'Nuevo Sector'}
              </DialogTitle>
              <DialogContent sx={{ p: 4 }}>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <TextField
                      label="Nombre del sector"
                      required
                      fullWidth
                      value={formulario.nombre}
                      onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                      sx={inputStyle}
                  />
                  <TextField
                      label="Descripción (Opcional)"
                      multiline rows={3}
                      fullWidth
                      value={formulario.descripcion}
                      onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                      sx={inputStyle}
                  />
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 2, borderTop: '1px solid #1e293b' }}>
                <Button onClick={() => setModalAbierto(false)} disabled={guardando} sx={{ color: '#94a3b8' }}>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          <DialogoConfirmacion
              abierto={!!aBorrar}
              titulo="Eliminar sector"
              mensaje={`¿Seguro que quieres eliminar el sector "${aBorrar?.nombre}"? Esta acción no se puede deshacer.`}
              textoConfirmar="Eliminar"
              onConfirmar={confirmarBorrado}
              onCancelar={() => setABorrar(null)}
              cargando={borrando}
          />
        </Container>
      </Box>
  );
}