// src/pages/IncidenciaForm.jsx
// -------------------------------------------------------
// Formulario para crear / editar una incidencia.
// /incidencias/nuevo                 → modo crear
// /incidencias/nuevo?afiliado=42     → modo crear con afiliado preseleccionado
// /incidencias/:id                   → modo editar
// -------------------------------------------------------

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box, Container, Typography, Button, TextField, MenuItem,
  Stack, Paper, Grid, Alert, CircularProgress, Divider,
  Autocomplete,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';

const ESTADO_INICIAL = {
  afiliado_id: '',
  titulo: '',
  descripcion: '',
  estado: 'pendiente',
  prioridad: 'media',
  resolucion: '',
};

export default function IncidenciaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const esEdicion = id && id !== 'nuevo';

  const [datos, setDatos]         = useState(ESTADO_INICIAL);
  const [afiliados, setAfiliados] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState(null);
  const [exito, setExito]         = useState(false);

  useEffect(() => { cargarInicial(); }, [id]);

  async function cargarInicial() {
    setCargando(true);
    setError(null);

    const { data: afils, error: errAfil } = await supabase
      .from('afiliados')
      .select('id, dni, nombre, apellidos, sector:sectores(nombre)')
      .eq('activo', true)
      .order('apellidos');

    if (errAfil) {
      setError('No se pudieron cargar los afiliados: ' + errAfil.message);
      setCargando(false);
      return;
    }
    setAfiliados(afils ?? []);

    if (esEdicion) {
      const { data, error } = await supabase
        .from('incidencias')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError('Incidencia no encontrada: ' + error.message);
      } else {
        setDatos({
          afiliado_id: data.afiliado_id,
          titulo: data.titulo,
          descripcion: data.descripcion,
          estado: data.estado,
          prioridad: data.prioridad,
          resolucion: data.resolucion ?? '',
        });
      }
    } else {
      // Si viene de la ficha de un afiliado, se preselecciona
      const afiliadoParam = searchParams.get('afiliado');
      if (afiliadoParam) {
        setDatos((prev) => ({ ...prev, afiliado_id: Number(afiliadoParam) }));
      }
    }

    setCargando(false);
  }

  function actualizar(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setExito(false);

    if (!datos.afiliado_id) {
      setError('Debes seleccionar un afiliado');
      return;
    }

    setGuardando(true);

    const payload = {
      ...datos,
      resolucion: datos.resolucion?.trim() || null,
      fecha_cierre: datos.estado === 'resuelta' ? new Date().toISOString() : null,
    };

    let respuesta;
    if (esEdicion) {
      respuesta = await supabase
        .from('incidencias')
        .update(payload)
        .eq('id', id);
    } else {
      respuesta = await supabase
        .from('incidencias')
        .insert(payload);
    }

    if (respuesta.error) {
      setError(respuesta.error.message);
      setGuardando(false);
    } else {
      setExito(true);
      setGuardando(false);
      setTimeout(() => navigate('/incidencias'), 900);
    }
  }

  if (cargando) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const afiliadoSeleccionado = afiliados.find((a) => a.id === datos.afiliado_id) ?? null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/incidencias')}
        sx={{ mb: 2 }}
      >
        Volver al listado
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, border: 1, borderColor: 'divider' }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {esEdicion ? 'Editar incidencia' : 'Nueva incidencia'}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          {esEdicion
            ? 'Modifica los datos y guarda los cambios.'
            : 'Registra una nueva consulta, queja o problema laboral.'}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            {exito && <Alert severity="success">Guardado correctamente</Alert>}

            <Autocomplete
              options={afiliados}
              value={afiliadoSeleccionado}
              onChange={(_e, val) => actualizar('afiliado_id', val?.id ?? '')}
              getOptionLabel={(a) => a ? `${a.apellidos}, ${a.nombre} (${a.dni})` : ''}
              renderOption={(props, a) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body2">
                      {a.apellidos}, {a.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {a.dni} · {a.sector?.nombre ?? '—'}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Afiliado afectado"
                  required
                  helperText={
                    afiliados.length === 0
                      ? 'No hay afiliados activos. Crea uno antes desde la sección Afiliados.'
                      : 'Busca por nombre, apellido o DNI'
                  }
                />
              )}
              isOptionEqualToValue={(opt, val) => opt.id === val?.id}
            />

            <TextField
              label="Título"
              value={datos.titulo}
              onChange={(e) => actualizar('titulo', e.target.value)}
              required fullWidth
              placeholder="Ej.: Consulta sobre horas extras"
            />

            <TextField
              label="Descripción"
              value={datos.descripcion}
              onChange={(e) => actualizar('descripcion', e.target.value)}
              required fullWidth multiline rows={4}
              placeholder="Detalla el problema, consulta o queja del afiliado"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField select label="Estado"
                  value={datos.estado}
                  onChange={(e) => actualizar('estado', e.target.value)}
                  fullWidth
                >
                  <MenuItem value="pendiente">Pendiente</MenuItem>
                  <MenuItem value="en_proceso">En proceso</MenuItem>
                  <MenuItem value="resuelta">Resuelta</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Prioridad"
                  value={datos.prioridad}
                  onChange={(e) => actualizar('prioridad', e.target.value)}
                  fullWidth
                >
                  <MenuItem value="baja">Baja</MenuItem>
                  <MenuItem value="media">Media</MenuItem>
                  <MenuItem value="alta">Alta</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Resolución / observaciones"
              value={datos.resolucion}
              onChange={(e) => actualizar('resolucion', e.target.value)}
              fullWidth multiline rows={3}
              helperText="Cómo se ha resuelto o qué se ha hecho hasta ahora (opcional)"
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
              <Button onClick={() => navigate('/incidencias')} disabled={guardando}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />}
                disabled={guardando}>
                {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear incidencia'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
