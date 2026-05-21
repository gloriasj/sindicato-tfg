// src/pages/IncidenciaDetalle.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Stack, Paper, Grid,
  Chip, Avatar, Divider, Alert, CircularProgress, Tooltip, IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  InsertDriveFile as FileIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

const cardStyle = {
  background: 'linear-gradient(180deg, #131c33 0%, #0c1428 100%)',
  borderRadius: 4,
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
  p: 3,
  mb: 3
};

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
  const [archivos, setArchivos]     = useState([]); // Estado para los archivos
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => { cargar(); }, [id]);

  async function cargar() {
    setCargando(true);
    setError(null);

    // 1. Cargamos los datos de la incidencia y del afiliado
    const { data: dataIncidencia, error: errIncidencia } = await supabase
        .from('incidencias')
        .select(`
        *,
        afiliado:afiliados(id, dni, nombre, apellidos, email, telefono, empresa, sector:sectores(id, nombre))
      `)
        .eq('id', id)
        .single();

    if (errIncidencia) {
      setError('Incidencia no encontrada');
      setCargando(false);
      return;
    }

    setIncidencia(dataIncidencia);

    // 2. Cargamos los archivos adjuntos directamente asociados a esta incidencia
    const { data: dataArchivos } = await supabase
        .from('archivos_adjuntos')
        .select('*')
        .eq('incidencia_id', id)
        .order('subido_at', { ascending: false });

    setArchivos(dataArchivos ?? []);
    setCargando(false);
  }

  // Función exclusiva para descargar el archivo mediante una URL firmada temporal
  async function handleDescargar(archivo) {
    try {
      const { data, error } = await supabase.storage
          .from('incidencias-adjuntos')
          .createSignedUrl(archivo.ruta_storage, 60);

      if (error) throw error;

      const enlace = document.createElement('a');
      enlace.href = data.signedUrl;
      enlace.download = archivo.nombre_original;
      enlace.target = '_blank';
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
    } catch (err) {
      console.error('No se pudo descargar el archivo:', err.message);
    }
  }

  if (cargando) return <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error || !incidencia) return <Container maxWidth="xl" sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;

  const af = incidencia.afiliado;
  const iniciales = af ? (af.nombre[0] + af.apellidos[0]).toUpperCase() : '??';

  return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack direction="row" alignItems="center" mb={4}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/incidencias')} sx={{ color: '#fff' }}>
            Volver al listado
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {/* Columna Principal */}
          <Grid item xs={12} md={8}>
            <Paper sx={cardStyle}>
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Chip
                    label={ESTADOS[incidencia.estado].label}
                    color={ESTADOS[incidencia.estado].color}
                    sx={{ fontWeight: 'bold', color: incidencia.estado === 'pendiente' ? '#000' : '#fff' }}
                />
                <Chip
                    label={`Prioridad ${PRIORIDADES[incidencia.prioridad].label}`}
                    color={PRIORIDADES[incidencia.prioridad].color}
                    sx={{ color: '#fff', bgcolor: incidencia.prioridad === 'baja' ? '#475569' : undefined }}
                />
              </Stack>

              <Typography variant="h4" fontWeight={700} sx={{ color: '#fff', mb: 3 }}>
                {incidencia.titulo}
              </Typography>

              <Typography variant="overline" sx={{ color: '#94a3b8' }}>Descripción</Typography>
              <Typography variant="body1" sx={{ color: '#fff', whiteSpace: 'pre-line', mt: 0.5, mb: 3 }}>
                {incidencia.descripcion}
              </Typography>

              {incidencia.resolucion && (
                  <>
                    <Divider sx={{ borderColor: '#1e293b', my: 3 }} />
                    <Typography variant="overline" sx={{ color: '#94a3b8' }}>Resolución / observaciones</Typography>
                    <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>{incidencia.resolucion}</Typography>
                  </>
              )}
            </Paper>

            {/* SECCIÓN DE CONSULTA DE ARCHIVOS (100% LECTURA Y DESCARGA) */}
            <Paper sx={{ p: 3, border: '1px solid #1e293b', bgcolor: '#131c33', borderRadius: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                <AttachFileIcon sx={{ color: '#3b82f6' }} />
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ color: '#fff' }}>
                    Documentación adjunta
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {archivos.length} archivo(s) vinculados a la incidencia
                  </Typography>
                </Box>
              </Stack>

              {archivos.length === 0 ? (
                  <Alert severity="info" variant="outlined" sx={{ border: 'none', bgcolor: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                    No se han adjuntado archivos en esta incidencia.
                  </Alert>
              ) : (
                  <Stack spacing={1.5}>
                    {archivos.map((archivo) => (
                        <Paper
                            key={archivo.id}
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              bgcolor: 'rgba(255,255,255,0.03)',
                              borderColor: '#1e293b',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                              transition: 'background-color 0.15s',
                            }}
                        >
                          {iconoTipo(archivo.tipo_mime)}

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={500} sx={{ color: '#fff' }} noWrap>
                              {archivo.nombre_original}
                            </Typography>
                            <Stack direction="row" spacing={1} mt={0.3} alignItems="center">
                              <Chip
                                  label={formatearTamano(archivo.tamano_bytes)}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem', color: '#94a3b8', borderColor: '#475569' }}
                              />
                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                Subido el {new Date(archivo.subido_at).toLocaleString('es-ES')}
                              </Typography>
                            </Stack>
                          </Box>

                          <Tooltip title="Descargar archivo">
                            <IconButton size="small" onClick={() => handleDescargar(archivo)} sx={{ color: '#fff' }}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Paper>
                    ))}
                  </Stack>
              )}
            </Paper>
          </Grid>

          {/* Columna Lateral */}
          <Grid item xs={12} md={4}>
            <Paper sx={cardStyle}>
              <Typography variant="overline" sx={{ color: '#94a3b8' }}>Afiliado afectado</Typography>
              <Stack direction="row" spacing={2} alignItems="center" mt={1.5} mb={2}>
                <Avatar sx={{ bgcolor: '#3b82f6' }}>{iniciales}</Avatar>
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>{af?.nombre} {af?.apellidos}</Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>{af?.dni}</Typography>
                </Box>
              </Stack>
              <Button fullWidth variant="outlined" size="small" sx={{ color: '#fff', borderColor: '#1e293b' }}
                      component={RouterLink} to={`/afiliados/${af?.id}/detalle`}>
                Ver ficha completa
              </Button>
            </Paper>

            {/* Fechas */}
            <Paper sx={cardStyle}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <CalendarIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                <Typography variant="overline" sx={{ color: '#94a3b8', m: 0 }}>Fechas</Typography>
              </Stack>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Apertura</Typography>
                  <Typography sx={{ color: '#fff' }}>{new Date(incidencia.fecha_apertura).toLocaleString('es-ES')}</Typography>
                </Box>
                {incidencia.fecha_cierre && (
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>Cierre</Typography>
                      <Typography sx={{ color: '#fff' }}>{new Date(incidencia.fecha_cierre).toLocaleString('es-ES')}</Typography>
                    </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
  );
}

// === Funciones auxiliares locales para mantener el aislamiento visual ===
function iconoTipo(mime) {
  const props = { sx: { color: '#94a3b8', fontSize: 28 } };
  if (!mime) return <FileIcon {...props} />;
  if (mime.startsWith('image/'))    return <ImageIcon {...props} sx={{ ...props.sx, color: '#3b82f6' }} />;
  if (mime === 'application/pdf')   return <PdfIcon   {...props} sx={{ ...props.sx, color: '#ef4444' }} />;
  if (mime.includes('word') || mime.includes('document')) return <DescriptionIcon {...props} sx={{ ...props.sx, color: '#3b82f6' }} />;
  return <FileIcon {...props} />;
}

function formatearTamano(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}