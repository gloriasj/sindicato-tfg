
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, MenuItem,
  Stack, Grid, Alert, CircularProgress, Divider, Paper, IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNotificacion } from '../context/NotificacionContext';
import AdjuntosIncidencia from '../components/AdjuntosIncidencia';

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
  '& .Mui-disabled': {
    color: '#ffffff !important',
    WebkitTextFillColor: '#ffffff !important'
  },
  '& .MuiSelect-select': { color: '#fff' },
  '& .MuiSvgIcon-root': { color: '#94a3b8' },
};

const ESTADO_INICIAL = {
  afiliado_id: '', titulo: '', descripcion: '',
  estado: 'pendiente', prioridad: 'media', resolucion: '',
};

export default function IncidenciaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const esEdicion = id && id !== 'nuevo';
  const { profile } = useAuth();
  const { exito, error: notificarError } = useNotificacion();

  const [datos, setDatos] = useState(ESTADO_INICIAL);
  const [afiliados, setAfiliados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);


  const [archivosNuevos, setArchivosNuevos] = useState([]);
  const inputFileRef = useRef(null);

  useEffect(() => { cargarInicial(); }, [id]);

  async function cargarInicial() {
    setCargando(true);
    const { data: afils } = await supabase.from('afiliados').select('id, dni, nombre, apellidos').eq('activo', true);
    setAfiliados(afils ?? []);

    if (esEdicion) {
      const { data } = await supabase.from('incidencias').select('*').eq('id', id).single();
      if (data) setDatos(data);
    } else {
      const afiliadoParam = searchParams.get('afiliado');
      if (afiliadoParam) setDatos(prev => ({ ...prev, afiliado_id: Number(afiliadoParam) }));
    }
    setCargando(false);
  }

  const afiliadoSeleccionado = afiliados.find(a => a.id === datos.afiliado_id);
  const nombreAfiliado = afiliadoSeleccionado
      ? `${afiliadoSeleccionado.apellidos}, ${afiliadoSeleccionado.nombre}`
      : 'Cargando...';

  function actualizar(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleSeleccionarArchivosNuevos(e) {
    const files = Array.from(e.target.files || []);
    const validos = files.filter(f => f.size <= 10 * 1024 * 1024);
    if (validos.length !== files.length) {
      notificarError('Algunos archivos superan los 10 MB permitidos.');
    }
    setArchivosNuevos(prev => [...prev, ...validos]);
  }

  function handleQuitarArchivoNuevo(index) {
    setArchivosNuevos(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!datos.afiliado_id) {
      setErrorForm('Debes seleccionar un afiliado');
      return;
    }
    setGuardando(true);
    setErrorForm(null);

    let respuesta;
    if (esEdicion) {
      respuesta = await supabase.from('incidencias').update(datos).eq('id', id);
    } else {
      respuesta = await supabase.from('incidencias').insert(datos).select().single();
    }

    if (respuesta.error) {
      setErrorForm(respuesta.error.message);
      setGuardando(false);
      return;
    }


    if (!esEdicion && archivosNuevos.length > 0) {
      const nuevoId = respuesta.data.id;

      for (const archivo of archivosNuevos) {
        try {
          const extension = archivo.name.split('.').pop();
          const rutaStorage = `incidencia-${nuevoId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

          const { error: errSubida } = await supabase.storage
              .from('incidencias-adjuntos')
              .upload(rutaStorage, archivo);

          if (errSubida) throw errSubida;

          await supabase.from('archivos_adjuntos').insert({
            incidencia_id:   nuevoId,
            nombre_original: archivo.name,
            ruta_storage:    rutaStorage,
            tipo_mime:       archivo.type || null,
            tamano_bytes:    archivo.size,
            subido_por:      profile?.id ?? null,
          });
        } catch (err) {
          console.error("Error al procesar el archivo adjunto:", err);
        }
      }
    }

    setGuardando(false);
    exito('Guardado correctamente');
    navigate('/incidencias');
  }

  if (cargando) return <Box sx={{ minHeight: '100vh', bgcolor: '#080d1c', p: 6, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#080d1c', px: 2, py: 4 }}>
        <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/incidencias')} sx={{ mb: 3, color: '#94a3b8' }}>
            Volver al listado
          </Button>

          <Typography variant="h4" fontWeight={600} sx={{ color: '#fff' }}>
            {esEdicion ? 'Editar incidencia' : 'Nueva incidencia'}
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mt: 1, mb: 4 }}>
            {esEdicion ? 'Modifica los datos y gestiona tus archivos.' : 'Completa el formulario para registrar la incidencia.'}
          </Typography>

          <Divider sx={{ borderColor: '#1e293b', mb: 4 }} />

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {errorForm && <Alert severity="error">{errorForm}</Alert>}

              {esEdicion ? (
                  <TextField label="Afiliado afectado" value={nombreAfiliado} disabled fullWidth sx={inputStyle} />
              ) : (
                  <TextField select label="Seleccionar Afiliado" required fullWidth sx={inputStyle}
                             value={datos.afiliado_id} onChange={(e) => actualizar('afiliado_id', e.target.value)}>
                    {afiliados.map((a) => <MenuItem key={a.id} value={a.id}>{a.apellidos}, {a.nombre}</MenuItem>)}
                  </TextField>
              )}

              <TextField label="Título" sx={inputStyle} value={datos.titulo}
                         onChange={(e) => actualizar('titulo', e.target.value)} required fullWidth />

              <TextField label="Descripción" sx={inputStyle} value={datos.descripcion}
                         onChange={(e) => actualizar('descripcion', e.target.value)} required fullWidth multiline rows={4} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField select label="Estado" sx={inputStyle} value={datos.estado}
                             onChange={(e) => actualizar('estado', e.target.value)} fullWidth>
                    <MenuItem value="pendiente">Pendiente</MenuItem>
                    <MenuItem value="en_proceso">En proceso</MenuItem>
                    <MenuItem value="resuelta">Resuelta</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select label="Prioridad" sx={inputStyle} value={datos.prioridad}
                             onChange={(e) => actualizar('prioridad', e.target.value)} fullWidth>
                    <MenuItem value="baja">Baja</MenuItem>
                    <MenuItem value="media">Media</MenuItem>
                    <MenuItem value="alta">Alta</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <TextField label="Resolución / observaciones" sx={inputStyle} value={datos.resolucion}
                         onChange={(e) => actualizar('resolucion', e.target.value)} fullWidth multiline rows={3} />


              {esEdicion ? (
                  <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid #1e293b' }}>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Archivos Adjuntos</Typography>
                    <AdjuntosIncidencia incidenciaId={id} />
                  </Box>
              ) : (
                  <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid #1e293b' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#fff' }}>Archivos Adjuntos</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {archivosNuevos.length} archivo(s) seleccionados provisionalmente
                        </Typography>
                      </Box>
                      <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={() => inputFileRef.current?.click()} size="small">
                        Seleccionar archivo
                      </Button>
                      <input ref={inputFileRef} type="file" hidden multiple onChange={handleSeleccionarArchivosNuevos} />
                    </Stack>

                    <Stack spacing={1}>
                      {archivosNuevos.map((archivo, index) => (
                          <Paper key={index} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderColor: '#1e293b' }}>
                            <Typography variant="body2" sx={{ color: '#fff', flex: 1 }} noWrap>{archivo.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>{(archivo.size / 1024).toFixed(1)} KB</Typography>
                            <IconButton size="small" color="error" onClick={() => handleQuitarArchivoNuevo(index)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Paper>
                      ))}
                    </Stack>
                  </Box>
              )}

              <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
                <Button onClick={() => navigate('/incidencias')} sx={{ color: '#94a3b8' }}>Cancelar</Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Box>
  );
}