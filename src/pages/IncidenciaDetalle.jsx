// src/pages/IncidenciaDetalle.jsx
// -------------------------------------------------------
// Vista de detalle de una incidencia. Muestra toda la
// información: datos del afiliado afectado, descripción
// completa, estado, prioridad, fechas y resolución.
//
// Permite cambiar el estado rápidamente y editar.
// -------------------------------------------------------

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Stack, Paper, Grid,
  Chip, Avatar, Divider, Alert, CircularProgress, IconButton,
  MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import DialogoConfirmacion from '../components/DialogoConfirmacion';

const ESTADOS = {
  pendiente:  { label: 'Pendiente',  color: 'warning' },
  en_proceso: { label: 'En proceso', color: 'info' },
  resuelta:   { label: 'Resuelta',   color: 'success' },
};

const PRIORIDADES = {
  baja:  { label: 'Baja',  color: 'default' },
  media: { label: 'Media', color: 'primary' },
  alta:  { label: 'Alta',  color: 'error' },
};

export default function IncidenciaDetalle() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [incidencia, setIncidencia] = useState(null);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState(null);
  const [aBorrar, setABorrar]       = useState(false);
  const [borrando, setBorrando]     = useState(false);

  useEffect(() => { cargar(); }, [id]);

  async function cargar() {
    setCargando(true);
    setError(null);

    const { data, error } = await supabase
      .from('incidencias')
      .select(`
        *,
        afiliado:afiliados(
          id, dni, nombre, apellidos, email, telefono, empresa,
          sector:sectores(id, nombre)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      setError('Incidencia no encontrada: ' + error.message);
    } else {
      setIncidencia(data);
    }
    setCargando(false);
  }

  async function cambiarEstado(nuevoEstado) {
    const datos = {
      estado: nuevoEstado,
      fecha_cierre: nuevoEstado === 'resuelta' ? new Date().toISOString() : null,
    };
    const { error } = await supabase
      .from('incidencias')
      .update(datos)
      .eq('id', id);

    if (error) {
      setError('No se pudo actualizar el estado: ' + error.message);
    } else {
      setIncidencia((prev) => ({ ...prev, ...datos }));
    }
  }

  async function confirmarBorrado() {
    setBorrando(true);
    const { error } = await supabase
      .from('incidencias')
      .delete()
      .eq('id', id);

    if (error) {
      setError('No se pudo eliminar: ' + error.message);
      setBorrando(false);
      setABorrar(false);
    } else {
      navigate('/incidencias');
    }
  }

  if (cargando) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !incidencia) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/incidencias')}>
          Volver al listado
        </Button>
        <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
      </Container>
    );
  }

  const af = incidencia.afiliado;
  const iniciales = af
    ? (af.nombre[0] + af.apellidos[0]).toUpperCase()
    : '??';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/incidencias')}
        >
          Volver al listado
        </Button>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/incidencias/${id}`)}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setABorrar(true)}
          >
            Eliminar
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* === Columna principal: detalles de la incidencia === */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, border: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} mb={1}>
              <Chip
                label={ESTADOS[incidencia.estado].label}
                color={ESTADOS[incidencia.estado].color}
                size="small"
              />
              <Chip
                label={`Prioridad ${PRIORIDADES[incidencia.prioridad].label.toLowerCase()}`}
                color={PRIORIDADES[incidencia.prioridad].color}
                size="small"
              />
            </Stack>

            <Typography variant="h4" fontWeight={600} mb={2}>
              {incidencia.titulo}
            </Typography>

            <Typography variant="overline" color="text.secondary">
              Descripción
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mt: 0.5 }}>
              {incidencia.descripcion}
            </Typography>

            {incidencia.resolucion && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="overline" color="text.secondary">
                  Resolución / observaciones
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mt: 0.5 }}>
                  {incidencia.resolucion}
                </Typography>
              </>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Cambio rápido de estado */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Cambiar estado:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={incidencia.estado}
                  onChange={(e) => cambiarEstado(e.target.value)}
                >
                  {Object.entries(ESTADOS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Grid>

        {/* === Columna lateral: datos del afiliado y fechas === */}
        <Grid item xs={12} md={4}>
          {/* Tarjeta del afiliado */}
          {af && (
            <Paper elevation={0} sx={{ p: 3, mb: 2, border: 1, borderColor: 'divider' }}>
              <Typography variant="overline" color="text.secondary">
                Afiliado afectado
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center" mt={1.5} mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{iniciales}</Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body1" fontWeight={500} noWrap>
                    {af.nombre} {af.apellidos}
                  </Typography>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ fontFamily: 'monospace' }}>
                    {af.dni}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1.5} mb={2}>
                {af.sector && (
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CategoryIcon fontSize="small" color="action" />
                    <Typography variant="body2">{af.sector.nombre}</Typography>
                  </Stack>
                )}
                {af.empresa && (
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <BusinessIcon fontSize="small" color="action" />
                    <Typography variant="body2">{af.empresa}</Typography>
                  </Stack>
                )}
              </Stack>

              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<PersonIcon />}
                component={RouterLink}
                to={`/afiliados/${af.id}/detalle`}
              >
                Ver ficha completa
              </Button>
            </Paper>
          )}

          {/* Tarjeta de fechas */}
          <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
            <Typography variant="overline" color="text.secondary">
              Fechas
            </Typography>

            <Stack spacing={2} mt={1.5}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <CalendarIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Apertura
                  </Typography>
                  <Typography variant="body2">
                    {new Date(incidencia.fecha_apertura).toLocaleString('es-ES')}
                  </Typography>
                </Box>
              </Stack>

              {incidencia.fecha_cierre && (
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <CalendarIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Cierre
                    </Typography>
                    <Typography variant="body2">
                      {new Date(incidencia.fecha_cierre).toLocaleString('es-ES')}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <DialogoConfirmacion
        abierto={aBorrar}
        titulo="Eliminar incidencia"
        mensaje={`¿Seguro que quieres eliminar la incidencia "${incidencia.titulo}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        onConfirmar={confirmarBorrado}
        onCancelar={() => setABorrar(false)}
        cargando={borrando}
      />
    </Container>
  );
}
