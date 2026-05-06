// src/components/AdjuntosIncidencia.jsx
// -------------------------------------------------------
// Sección de archivos adjuntos para una incidencia.
// Permite subir archivos (cualquier tipo, máximo 10 MB),
// listarlos, descargarlos y borrarlos.
//
// Los archivos se guardan en el bucket privado de Supabase
// Storage llamado 'incidencias-adjuntos'. Para descargarlos
// se generan enlaces firmados temporales (válidos 60 seg).
// -------------------------------------------------------

import { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Button, Stack, Paper, IconButton, Tooltip,
  CircularProgress, Chip, Alert, LinearProgress,
} from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNotificacion } from '../context/NotificacionContext';
import DialogoConfirmacion from './DialogoConfirmacion';

const TAMANO_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const BUCKET = 'incidencias-adjuntos';

export default function AdjuntosIncidencia({ incidenciaId }) {
  const { profile } = useAuth();
  const { exito, error: notificarError } = useNotificacion();

  const [archivos, setArchivos]   = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [subiendo, setSubiendo]   = useState(false);
  const [aBorrar, setABorrar]     = useState(null);
  const [borrando, setBorrando]   = useState(false);
  const inputFileRef = useRef(null);

  useEffect(() => { cargarArchivos(); }, [incidenciaId]);

  // === Cargar archivos de la incidencia ===
  async function cargarArchivos() {
    setCargando(true);
    const { data, error } = await supabase
      .from('archivos_adjuntos')
      .select('*')
      .eq('incidencia_id', incidenciaId)
      .order('subido_at', { ascending: false });

    if (error) {
      notificarError('No se pudieron cargar los archivos: ' + error.message);
    } else {
      setArchivos(data ?? []);
    }
    setCargando(false);
  }

  // === Subir archivo ===
  async function handleSubirArchivo(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    // Validación de tamaño
    if (archivo.size > TAMANO_MAX_BYTES) {
      notificarError(`El archivo no puede superar ${formatearTamano(TAMANO_MAX_BYTES)}`);
      e.target.value = '';
      return;
    }

    setSubiendo(true);

    try {
      // Generamos un nombre único para evitar colisiones en el bucket
      const extension = archivo.name.split('.').pop();
      const rutaStorage =
        `incidencia-${incidenciaId}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${extension}`;

      // 1. Subimos el archivo físico al bucket de Storage
      const { error: errSubida } = await supabase.storage
        .from(BUCKET)
        .upload(rutaStorage, archivo, {
          cacheControl: '3600',
          upsert: false,
        });

      if (errSubida) throw errSubida;

      // 2. Guardamos los metadatos en la tabla archivos_adjuntos
      const { data, error: errInsert } = await supabase
        .from('archivos_adjuntos')
        .insert({
          incidencia_id:   incidenciaId,
          nombre_original: archivo.name,
          ruta_storage:    rutaStorage,
          tipo_mime:       archivo.type || null,
          tamano_bytes:    archivo.size,
          subido_por:      profile?.id ?? null,
        })
        .select()
        .single();

      if (errInsert) {
        // Si falla el insert, intentamos borrar el archivo subido para no
        // dejar archivos huérfanos en Storage
        await supabase.storage.from(BUCKET).remove([rutaStorage]);
        throw errInsert;
      }

      setArchivos((prev) => [data, ...prev]);
      exito(`Archivo "${archivo.name}" subido correctamente`);
    } catch (err) {
      notificarError('Error al subir el archivo: ' + err.message);
    } finally {
      setSubiendo(false);
      e.target.value = '';   // Reseteamos el input para permitir resubir
    }
  }

  // === Descargar archivo ===
  async function handleDescargar(archivo) {
    try {
      // Generamos una URL firmada (válida 60 segundos) porque el
      // bucket es privado.
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(archivo.ruta_storage, 60);

      if (error) throw error;

      // Forzamos descarga con el nombre original del archivo
      const enlace = document.createElement('a');
      enlace.href = data.signedUrl;
      enlace.download = archivo.nombre_original;
      enlace.target = '_blank';
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
    } catch (err) {
      notificarError('No se pudo descargar el archivo: ' + err.message);
    }
  }

  // === Borrar archivo ===
  async function confirmarBorrado() {
    if (!aBorrar) return;
    setBorrando(true);

    try {
      // 1. Borrar el archivo físico de Storage
      const { error: errStorage } = await supabase.storage
        .from(BUCKET)
        .remove([aBorrar.ruta_storage]);

      if (errStorage) throw errStorage;

      // 2. Borrar el registro de la tabla
      const { error: errBd } = await supabase
        .from('archivos_adjuntos')
        .delete()
        .eq('id', aBorrar.id);

      if (errBd) throw errBd;

      setArchivos((prev) => prev.filter((a) => a.id !== aBorrar.id));
      exito('Archivo eliminado correctamente');
    } catch (err) {
      notificarError('No se pudo eliminar: ' + err.message);
    } finally {
      setBorrando(false);
      setABorrar(null);
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, border: 1, borderColor: 'divider' }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <AttachFileIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Archivos adjuntos
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {archivos.length} archivo(s) · Máx 10 MB por archivo
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => inputFileRef.current?.click()}
          disabled={subiendo}
          size="small"
        >
          {subiendo ? 'Subiendo...' : 'Subir archivo'}
        </Button>

        {/* input oculto que se dispara al pulsar el botón */}
        <input
          ref={inputFileRef}
          type="file"
          hidden
          onChange={handleSubirArchivo}
        />
      </Stack>

      {subiendo && (
        <Box mb={2}>
          <LinearProgress />
        </Box>
      )}

      {cargando ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      ) : archivos.length === 0 ? (
        <Alert severity="info" variant="outlined" sx={{ border: 'none', bgcolor: 'background.default' }}>
          No hay archivos adjuntos en esta incidencia. Sube partes médicos,
          contratos, nóminas o cualquier otro documento relacionado.
        </Alert>
      ) : (
        <Stack spacing={1}>
          {archivos.map((archivo) => (
            <FilaArchivo
              key={archivo.id}
              archivo={archivo}
              onDescargar={() => handleDescargar(archivo)}
              onBorrar={() => setABorrar(archivo)}
            />
          ))}
        </Stack>
      )}

      <DialogoConfirmacion
        abierto={!!aBorrar}
        titulo="Eliminar archivo"
        mensaje={
          aBorrar
            ? `¿Seguro que quieres eliminar el archivo "${aBorrar.nombre_original}"? Esta acción no se puede deshacer.`
            : ''
        }
        textoConfirmar="Eliminar"
        onConfirmar={confirmarBorrado}
        onCancelar={() => setABorrar(null)}
        cargando={borrando}
      />
    </Paper>
  );
}

// =========================================================
// Fila de un archivo en la lista
// =========================================================
function FilaArchivo({ archivo, onDescargar, onBorrar }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        '&:hover': { bgcolor: 'background.default' },
        transition: 'background-color 0.15s',
      }}
    >
      {iconoTipo(archivo.tipo_mime)}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {archivo.nombre_original}
        </Typography>
        <Stack direction="row" spacing={1} mt={0.3}>
          <Chip
            label={formatearTamano(archivo.tamano_bytes)}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
          <Typography variant="caption" color="text.secondary">
            Subido el {new Date(archivo.subido_at).toLocaleString('es-ES')}
          </Typography>
        </Stack>
      </Box>

      <Tooltip title="Descargar">
        <IconButton size="small" onClick={onDescargar}>
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Eliminar">
        <IconButton size="small" color="error" onClick={onBorrar}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Paper>
  );
}

// === Helpers ===

function iconoTipo(mime) {
  const props = { sx: { color: 'text.secondary', fontSize: 28 } };
  if (!mime) return <FileIcon {...props} />;
  if (mime.startsWith('image/'))    return <ImageIcon {...props} sx={{ ...props.sx, color: '#2196f3' }} />;
  if (mime === 'application/pdf')   return <PdfIcon   {...props} sx={{ ...props.sx, color: '#e53935' }} />;
  if (mime.includes('word') ||
      mime.includes('document'))    return <DescriptionIcon {...props} sx={{ ...props.sx, color: '#1565c0' }} />;
  return <FileIcon {...props} />;
}

function formatearTamano(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
