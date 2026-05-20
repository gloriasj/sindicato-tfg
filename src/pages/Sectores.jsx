// src/pages/Sectores.jsx
// -------------------------------------------------------
// Gestión de sectores profesionales.
// Acceso exclusivo para administradores. Permite CRUD completo.
// -------------------------------------------------------

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

export default function Sectores() {
  const { exito, error: notificarError } = useNotificacion();

  const [sectores, setSectores] = useState([]);
  const [conteos, setConteos]   = useState({});
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal de Crear/Editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [sectorActual, setSectorActual] = useState(null); // null = Crear, objeto = Editar
  const [formulario, setFormulario]     = useState({ nombre: '', descripcion: '' });
  const [guardando, setGuardando]       = useState(false);

  // Estados para el Modal de Borrar
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

  // --- LÓGICA DE CREAR / EDITAR ---
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

  // --- LÓGICA DE BORRAR ---
  async function confirmarBorrado() {
    if (!aBorrar) return;
    setBorrando(true);

    // Al intentar borrar, si hay afiliados en este sector, PostgreSQL lanzará
    // un error de "Foreign Key" automáticamente, lo cual es muy seguro.
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={600}>Sectores</Typography>
            <Typography variant="body1" color="text.secondary">
              Catálogo de sectores profesionales del sindicato
            </Typography>
          </Box>
          <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={abrirModalNuevo}
          >
            Nuevo Sector
          </Button>
        </Stack>

        <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          {cargando ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
          ) : (
              <List disablePadding>
                {sectores.map((s, i) => {
                  const totalAfiliados = conteos[s.nombre] ?? 0;
                  return (
                      <ListItem
                          key={s.id}
                          divider={i < sectores.length - 1}
                          secondaryAction={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip label={`${totalAfiliados} afiliado(s)`} size="small" variant="outlined" sx={{ mr: 2 }} />
                              <Tooltip title="Editar">
                                <IconButton edge="end" onClick={() => abrirModalEditar(s)}>
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
                        <ListItemIcon><CategoryIcon color="primary" /></ListItemIcon>
                        <ListItemText
                            primary={s.nombre}
                            secondary={s.descripcion || 'Sin descripción'}
                            primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                  );
                })}
              </List>
          )}
        </Paper>

        {/* MODAL CREAR / EDITAR */}
        <Dialog open={modalAbierto} onClose={() => !guardando && setModalAbierto(false)} fullWidth maxWidth="sm">
          <form onSubmit={guardarSector}>
            <DialogTitle>{sectorActual ? 'Editar Sector' : 'Nuevo Sector'}</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                    label="Nombre del sector"
                    required
                    fullWidth
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                />
                <TextField
                    label="Descripción (Opcional)"
                    multiline rows={3}
                    fullWidth
                    value={formulario.descripcion}
                    onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setModalAbierto(false)} disabled={guardando}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* MODAL CONFIRMAR BORRADO */}
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
  );
}