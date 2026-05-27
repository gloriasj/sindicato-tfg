// src/components/AdjuntosIncidencia.jsx
// -------------------------------------------------------
// Sección de archivos adjuntos para una incidencia.
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

const TAMANO_MAX_BYTES = 10 * 1024 * 1024; // limite de 10mb
const BUCKET = 'incidencias-adjuntos'; //nombre carpeta raiz en el storage de supabase

export default function AdjuntosIncidencia({ incidenciaId }) {
  const { profile } = useAuth();
  const { exito, error: notificarError } = useNotificacion();

  const [archivos, setArchivos]   = useState([]); //lista local de fichheros vinculados
  const [cargando, setCargando]   = useState(true);
  const [subiendo, setSubiendo]   = useState(false);
  const [aBorrar, setABorrar]     = useState(null); //guarda el archivo seleccionado temporalmente para borrar
  const [borrando, setBorrando]   = useState(false);
  const inputFileRef = useRef(null); //referencia oculta para disparar el selector de archivos

  //cada vez que cambie la incidencia abierta se trae los archivos correspondientes
  useEffect(() => { cargarArchivos(); }, [incidenciaId]);

  //consulta a la base de datos
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

  //subida del archivo
  async function handleSubirArchivo(e) {
    const archivo = e.target.files?.[0]; //se captura el archivo que eligio el usaurio
    if (!archivo) return;
  //si el archivo pesa mas de 10mb se para el proceso
    if (archivo.size > TAMANO_MAX_BYTES) {
      notificarError(`El archivo no puede superar ${formatearTamano(TAMANO_MAX_BYTES)}`);
      e.target.value = '';
      return;
    }

    setSubiendo(true);

    try {
      const extension = archivo.name.split('.').pop();
      const rutaStorage = `incidencia-${incidenciaId}/${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}.${extension}`;
      //proceso de subida
      //se guarda el archivo en el almacen fisico bucket
      const { error: errSubida } = await supabase.storage
          .from(BUCKET)
          .upload(rutaStorage, archivo, {
            cacheControl: '3600',
            upsert: false,
          });

      if (errSubida) throw errSubida;
      //2 se anota los detalles en el catalogo en bd
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
      //3 red de seguridad, si falla la base de datos se saca esos archivos

      if (errInsert) {
        await supabase.storage.from(BUCKET).remove([rutaStorage]);
        throw errInsert;
      }

      setArchivos((prev) => [data, ...prev]);
      exito(`Archivo "${archivo.name}" subido correctamente`);
    } catch (err) {
      notificarError('Error al subir el archivo: ' + err.message);
    } finally {
      setSubiendo(false);
      e.target.value = '';
    }
  }

  async function handleDescargar(archivo) {
    try {
      const { data, error } = await supabase.storage
          .from(BUCKET)
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
      notificarError('No se pudo descargar el archivo: ' + err.message);
    }
  }

  async function confirmarBorrado() {
    if (!aBorrar) return;
    setBorrando(true);

    try {
      const { error: errStorage } = await supabase.storage
          .from(BUCKET)
          .remove([aBorrar.ruta_storage]);

      if (errStorage) throw errStorage;

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
          sx={{
            p: 3,
            border: '1px solid #1e293b', // Color oscuro para borde
            bgcolor: '#131c33' // Fondo oscuro consistente
          }}
      >
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AttachFileIcon sx={{ color: '#3b82f6' }} />
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#fff' }}>
                Archivos adjuntos
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
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
              sx={{ ml: 4, flexShrink: 0 }}
          >
            {subiendo ? 'Subiendo...' : 'Subir archivo'}
          </Button>

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
            <Alert severity="info" variant="outlined" sx={{ border: 'none', bgcolor: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
              No hay archivos adjuntos en esta incidencia.
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

function FilaArchivo({ archivo, onDescargar, onBorrar }) {
  return (
      <Paper
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
          <Stack direction="row" spacing={1} mt={0.3}>
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

        <IconButton size="small" onClick={onDescargar} sx={{ color: '#fff' }}>
          <DownloadIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={onBorrar}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Paper>
  );
}


function iconoTipo(mime) {
  const props = { sx: { color: '#94a3b8', fontSize: 28 } };
  if (!mime) return <FileIcon {...props} />;
  if (mime.startsWith('image/'))    return <ImageIcon {...props} sx={{ ...props.sx, color: '#3b82f6' }} />;
  if (mime === 'application/pdf')   return <PdfIcon   {...props} sx={{ ...props.sx, color: '#ef4444' }} />;
  if (mime.includes('word') ||
      mime.includes('document'))    return <DescriptionIcon {...props} sx={{ ...props.sx, color: '#3b82f6' }} />;
  return <FileIcon {...props} />;
}

function formatearTamano(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}