// src/pages/AfiliadoDetalle.jsx
// -------------------------------------------------------
// Ficha de afiliado con sus incidencias asociadas.
// Ahora con opción de Exportar a PDF y sin botón de edición.
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
  Add as AddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  AssignmentLate as AssignmentLateIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { usePermisos } from '../lib/usePermisos';
import { exportarPDF } from '../lib/exportarPDF';
import { useNotificacion } from '../context/NotificacionContext';

// --- ESTILOS VISUALES ---
const cardStyle = {
  background: 'linear-gradient(180deg, #131c33 0%, #0c1428 100%)',
  borderRadius: 4,
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
};

const tableHeadStyle = { color: '#94a3b8', borderBottom: '1px solid #1e293b', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.2)' };
const tableCellStyle = { color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' };
// ------------------------

const ESTADOS = {
  pendiente:  { label: 'Pendiente',  color: '#f59e0b', bgcolor: 'rgba(245, 158, 11, 0.1)' },
  en_proceso: { label: 'En proceso', color: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' },
  resuelta:   { label: 'Resuelta',   color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.1)' },
};

const PRIORIDADES = {
  baja:  { label: 'Baja',  color: '#94a3b8', bgcolor: 'rgba(148, 163, 184, 0.1)' },
  media: { label: 'Media', color: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' },
  alta:  { label: 'Alta',  color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' },
};

export default function AfiliadoDetalle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { exito, error: notificarError } = useNotificacion();
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

  // --- FUNCIÓN PARA EXPORTAR A PDF ---
  function handleExportarPDF() {
    try {
      const fecha = new Date().toISOString().slice(0, 10);

      exportarPDF({
        titulo: `Ficha de Afiliado: ${afiliado.nombre} ${afiliado.apellidos}`,
        subtitulo: `DNI: ${afiliado.dni}  |  Email: ${afiliado.email || '—'}  |  Teléfono: ${afiliado.telefono || '—'}  |  Incidencias: ${incidencias.length}`,
        filas: incidencias,
        columnas: [
          { clave: 'titulo',         etiqueta: 'Título de la incidencia', ancho: 80 },
          { clave: 'estado',         etiqueta: 'Estado',    formato: (v) => ESTADOS[v]?.label || v, ancho: 25 },
          { clave: 'prioridad',      etiqueta: 'Prioridad', formato: (v) => PRIORIDADES[v]?.label || v, ancho: 25 },
          { clave: 'fecha_apertura', etiqueta: 'Apertura',  formato: (v) => new Date(v).toLocaleDateString('es-ES'), ancho: 25 },
          { clave: 'fecha_cierre',   etiqueta: 'Cierre',    formato: (v) => v ? new Date(v).toLocaleDateString('es-ES') : '—', ancho: 25 },
        ],
        nombreArchivo: `ficha-afiliado-${afiliado.dni}-${fecha}.pdf`,
      });

      exito('PDF generado correctamente');
    } catch (e) {
      notificarError('Error generando el PDF: ' + e.message);
    }
  }

  if (cargando) {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#080d1c', p: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#080d1c', py: 4 }}>
          <Container maxWidth="md">
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/afiliados')} sx={{ color: '#94a3b8' }}>
              Volver al listado
            </Button>
            <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
          </Container>
        </Box>
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
      <Box sx={{ minHeight: '100vh', bgcolor: '#080d1c', pt: 4, pb: 8 }}>
        <Container maxWidth="lg">
          <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/afiliados')}
              sx={{ mb: 3, color: '#94a3b8', '&:hover': { color: '#fff' } }}
          >
            Volver al listado
          </Button>

          {/* CABECERA Y DATOS DEL AFILIADO */}
          <Paper sx={{ ...cardStyle, p: { xs: 3, sm: 4 }, mb: 5 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
              <Avatar sx={{
                bgcolor: '#3b82f6',
                width: 80, height: 80,
                fontSize: 28, fontWeight: 600,
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
              }}>
                {iniciales}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#fff' }}>
                    {afiliado.nombre} {afiliado.apellidos}
                  </Typography>
                  {afiliado.activo ? (
                      <Chip label="Activo" size="small" sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.2)' }} />
                  ) : (
                      <Chip label="Inactivo" size="small" sx={{ bgcolor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.2)' }} />
                  )}
                </Stack>
                <Typography variant="body1" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                  {afiliado.dni}
                </Typography>
              </Box>

              {/* BOTÓN EXPORTAR PDF (Reemplaza al antiguo Editar) */}
              <Tooltip title="Descargar ficha completa en PDF">
                <Button
                    variant="outlined"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={handleExportarPDF}
                    sx={{ color: '#fff', borderColor: '#1e293b' }}
                >
                  Exportar PDF
                </Button>
              </Tooltip>
            </Stack>

            <Divider sx={{ my: 4, borderColor: '#1e293b' }} />

            <Grid container spacing={3}>
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

            {/* CAJA DE NOTAS INTERNAS (AHORA SIEMPRE VISIBLE) */}
            <Box sx={{ mt: 5, p: 3, bgcolor: 'rgba(0, 0, 0, 0.2)', borderRadius: 2, border: '1px solid #1e293b' }}>
              <Typography variant="overline" sx={{ color: '#3b82f6', fontWeight: 700, display: 'block', mb: 1 }}>
                Notas internas
              </Typography>
              <Typography variant="body2" sx={{ color: afiliado.notas ? '#e2e8f0' : '#475569', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {afiliado.notas || 'No hay notas internas registradas para este afiliado.'}
              </Typography>
            </Box>
          </Paper>

          {/* CONTADORES DE INCIDENCIAS */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <TarjetaContador titulo="Total Histórico" valor={conteo.total}      color="#fff" />
            <TarjetaContador titulo="Pendientes" valor={conteo.pendiente}  color="#f59e0b" />
            <TarjetaContador titulo="En Proceso" valor={conteo.en_proceso} color="#3b82f6" />
            <TarjetaContador titulo="Resueltas" valor={conteo.resuelta}    color="#10b981" />
          </Grid>

          {/* TABLA DE INCIDENCIAS DEL AFILIADO */}
          <Paper sx={{ ...cardStyle, p: 0, overflow: 'hidden' }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                sx={{ p: 3, borderBottom: '1px solid #1e293b' }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <AssignmentIcon sx={{ color: '#3b82f6' }} />
                <Typography variant="h6" fontWeight={600} sx={{ color: '#fff' }}>
                  Incidencias vinculadas
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
                <Box sx={{ p: 8, textAlign: 'center' }}>
                  <AssignmentLateIcon sx={{ fontSize: 50, color: '#475569', mb: 2 }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                    Este afiliado aún no tiene incidencias registradas.
                  </Typography>
                </Box>
            ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableHeadStyle}>Título</TableCell>
                        <TableCell sx={tableHeadStyle}>Estado</TableCell>
                        <TableCell sx={tableHeadStyle}>Prioridad</TableCell>
                        <TableCell sx={tableHeadStyle}>Apertura</TableCell>
                        <TableCell sx={tableHeadStyle}>Cierre</TableCell>
                        <TableCell align="right" sx={tableHeadStyle}>Ver</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {incidencias.map((i) => (
                          <TableRow key={i.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, transition: 'background-color 0.2s' }}>
                            <TableCell sx={tableCellStyle}>
                              <Typography variant="body2" fontWeight={500} sx={{ color: '#fff' }}>
                                {i.titulo}
                              </Typography>
                            </TableCell>
                            <TableCell sx={tableCellStyle}>
                              <Chip
                                  label={ESTADOS[i.estado].label}
                                  size="small"
                                  sx={{ color: ESTADOS[i.estado].color, bgcolor: ESTADOS[i.estado].bgcolor, border: `1px solid ${ESTADOS[i.estado].bgcolor}` }}
                              />
                            </TableCell>
                            <TableCell sx={tableCellStyle}>
                              <Chip
                                  label={PRIORIDADES[i.prioridad].label}
                                  size="small"
                                  sx={{ color: PRIORIDADES[i.prioridad].color, bgcolor: PRIORIDADES[i.prioridad].bgcolor, border: `1px solid ${PRIORIDADES[i.prioridad].bgcolor}` }}
                              />
                            </TableCell>
                            <TableCell sx={{ ...tableCellStyle, color: '#94a3b8' }}>
                              {new Date(i.fecha_apertura).toLocaleDateString('es-ES')}
                            </TableCell>
                            <TableCell sx={{ ...tableCellStyle, color: '#94a3b8' }}>
                              {i.fecha_cierre
                                  ? new Date(i.fecha_cierre).toLocaleDateString('es-ES')
                                  : '—'}
                            </TableCell>
                            <TableCell align="right" sx={tableCellStyle}>
                              <Tooltip title="Ver detalle">
                                <IconButton size="small"
                                            onClick={() => navigate(`/incidencias/${i.id}/detalle`)}
                                            sx={{ color: '#94a3b8', '&:hover': { color: '#fff' } }}>
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
      </Box>
  );
}

// === Componentes Auxiliares ===

function DatoCampo({ icono, etiqueta, valor }) {
  return (
      <Grid item xs={12} sm={6} md={4}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box sx={{ color: '#94a3b8', mt: 0.3 }}>{icono}</Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>
              {etiqueta}
            </Typography>
            <Typography variant="body2" fontWeight={500} sx={{ color: '#fff' }}>
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
        <Paper sx={{ ...cardStyle, p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h3" fontWeight={700} sx={{ color, mb: 1 }}>
            {valor}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            {titulo}
          </Typography>
        </Paper>
      </Grid>
  );
}