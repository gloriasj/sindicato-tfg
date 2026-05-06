// src/pages/AfiliadoDetalle.jsx
// -------------------------------------------------------
// Ficha de afiliado con sus incidencias asociadas.
// El botón "Editar" solo es visible para administradores.
// -------------------------------------------------------

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Stack, Paper, Grid,
  Chip, Avatar, Divider, Alert, CircularProgress, IconButton,
  Tooltip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  AssignmentLate as AssignmentLateIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { usePermisos } from '../lib/usePermisos';

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

export default function AfiliadoDetalle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { puedeGestionarAfiliados } = usePermisos();

  const [afiliado, setAfiliado]       = useState(null);
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => { cargarDatos(); }, [id]);

  async function cargarDatos() {
    setCargando(true);
    setError(null);

    const [afilRes, incRes] = await Promise.all([
      supabase
        .from('afiliados')
        .select('*, sector:sectores(id, nombre)')
        .eq('id', id)
        .single(),
      supabase
        .from('incidencias')
        .select('*')
        .eq('afiliado_id', id)
        .order('created_at', { ascending: false }),
    ]);

    if (afilRes.error) {
      setError('Afiliado no encontrado: ' + afilRes.error.message);
      setCargando(false);
      return;
    }

    setAfiliado(afilRes.data);
    setIncidencias(incRes.data ?? []);
    setCargando(false);
  }

  if (cargando) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/afiliados')}>
          Volver al listado
        </Button>
        <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
      </Container>
    );
  }

  const conteo = {
    total:      incidencias.length,
    pendiente:  incidencias.filter((i) => i.estado === 'pendiente').length,
    en_proceso: incidencias.filter((i) => i.estado === 'en_proceso').length,
    resuelta:   incidencias.filter((i) => i.estado === 'resuelta').length,
  };

  const iniciales = (afiliado.nombre[0] + afiliado.apellidos[0]).toUpperCase();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/afiliados')}
        sx={{ mb: 2 }}
      >
        Volver al listado
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, mb: 3, border: 1, borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
          <Avatar sx={{
            bgcolor: 'primary.main',
            width: 80, height: 80,
            fontSize: 28, fontWeight: 600,
          }}>
            {iniciales}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Typography variant="h4" fontWeight={600}>
                {afiliado.nombre} {afiliado.apellidos}
              </Typography>
              {afiliado.activo ? (
                <Chip label="Activo" color="success" size="small" />
              ) : (
                <Chip label="Inactivo" size="small" />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {afiliado.dni}
            </Typography>
          </Box>

          {/* Botón editar SOLO para admin */}
          {puedeGestionarAfiliados && (
            <Tooltip title="Editar afiliado">
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/afiliados/${afiliado.id}`)}
              >
                Editar
              </Button>
            </Tooltip>
          )}
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          <DatoCampo
            icono={<EmailIcon fontSize="small" />}
            etiqueta="Email"
            valor={afiliado.email || '—'}
          />
          <DatoCampo
            icono={<PhoneIcon fontSize="small" />}
            etiqueta="Teléfono"
            valor={afiliado.telefono || '—'}
          />
          <DatoCampo
            icono={<CategoryIcon fontSize="small" />}
            etiqueta="Sector"
            valor={afiliado.sector?.nombre || '—'}
          />
          <DatoCampo
            icono={<BusinessIcon fontSize="small" />}
            etiqueta="Empresa"
            valor={afiliado.empresa || '—'}
          />
          <DatoCampo
            icono={<CalendarIcon fontSize="small" />}
            etiqueta="Fecha de alta"
            valor={new Date(afiliado.fecha_alta).toLocaleDateString('es-ES')}
          />
        </Grid>

        {afiliado.notas && (
          <Box mt={3}>
            <Typography variant="overline" color="text.secondary">
              Notas internas
            </Typography>
            <Typography variant="body2" mt={0.5}>
              {afiliado.notas}
            </Typography>
          </Box>
        )}
      </Paper>

      <Grid container spacing={2} mb={3}>
        <TarjetaContador titulo="Total" valor={conteo.total}      color="text.primary" />
        <TarjetaContador titulo="Pendientes" valor={conteo.pendiente}  color="warning.main" />
        <TarjetaContador titulo="En proceso" valor={conteo.en_proceso} color="info.main" />
        <TarjetaContador titulo="Resueltas" valor={conteo.resuelta}    color="success.main" />
      </Grid>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <AssignmentIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Incidencias del afiliado
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            component={RouterLink}
            to={`/incidencias/nuevo?afiliado=${afiliado.id}`}
          >
            Nueva incidencia
          </Button>
        </Stack>

        {incidencias.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <AssignmentLateIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography color="text.secondary" mt={1}>
              Este afiliado aún no tiene incidencias registradas.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Título</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Prioridad</strong></TableCell>
                  <TableCell><strong>Apertura</strong></TableCell>
                  <TableCell><strong>Cierre</strong></TableCell>
                  <TableCell align="right"><strong>Ver</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incidencias.map((i) => (
                  <TableRow key={i.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {i.titulo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ESTADOS[i.estado].label}
                        color={ESTADOS[i.estado].color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={PRIORIDADES[i.prioridad].label}
                        color={PRIORIDADES[i.prioridad].color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(i.fecha_apertura).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      {i.fecha_cierre
                        ? new Date(i.fecha_cierre).toLocaleDateString('es-ES')
                        : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Ver detalle">
                        <IconButton size="small"
                          onClick={() => navigate(`/incidencias/${i.id}/detalle`)}>
                          <AssignmentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}

function DatoCampo({ icono, etiqueta, valor }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ color: 'text.secondary', mt: 0.3 }}>{icono}</Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {etiqueta}
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {valor}
          </Typography>
        </Box>
      </Stack>
    </Grid>
  );
}

function TarjetaContador({ titulo, valor, color }) {
  return (
    <Grid item xs={6} sm={3}>
      <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider' }}>
        <Typography variant="h4" fontWeight={600} sx={{ color }}>
          {valor}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {titulo}
        </Typography>
      </Paper>
    </Grid>
  );
}
