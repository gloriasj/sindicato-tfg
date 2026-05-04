// src/pages/AfiliadoForm.jsx
// -------------------------------------------------------
// Formulario para crear / editar un afiliado.
// Usa el sistema global de notificaciones para los avisos
// de éxito y error, en lugar de Alerts dentro del form.
// -------------------------------------------------------

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Container, Typography, Button, TextField, MenuItem,
  Stack, Paper, Grid, Alert, FormControlLabel, Switch,
  CircularProgress, Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useNotificacion } from '../context/NotificacionContext';

const ESTADO_INICIAL = {
  dni: '', nombre: '', apellidos: '', email: '', telefono: '',
  sector_id: '', empresa: '', activo: true, notas: '',
};

export default function AfiliadoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = id && id !== 'nuevo';
  const { exito, error: notificarError } = useNotificacion();

  const [datos, setDatos]       = useState(ESTADO_INICIAL);
  const [sectores, setSectores] = useState([]);
  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  useEffect(() => { cargarInicial(); }, [id]);

  async function cargarInicial() {
    setErrorForm(null);

    const { data: sects, error: errSect } = await supabase
      .from('sectores')
      .select('*')
      .order('nombre');

    if (errSect) {
      setErrorForm('No se pudieron cargar los sectores: ' + errSect.message);
      return;
    }
    setSectores(sects ?? []);

    if (esEdicion) {
      const { data, error } = await supabase
        .from('afiliados')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setErrorForm('Afiliado no encontrado: ' + error.message);
      } else {
        setDatos({
          dni: data.dni,
          nombre: data.nombre,
          apellidos: data.apellidos,
          email: data.email ?? '',
          telefono: data.telefono ?? '',
          sector_id: data.sector_id,
          empresa: data.empresa ?? '',
          activo: data.activo,
          notas: data.notas ?? '',
        });
      }
      setCargando(false);
    }
  }

  function actualizar(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorForm(null);

    if (!validarDNI(datos.dni)) {
      setErrorForm('El DNI no tiene un formato válido (8 dígitos + letra)');
      return;
    }
    if (!datos.sector_id) {
      setErrorForm('Debes seleccionar un sector');
      return;
    }

    setGuardando(true);

    const payload = {
      ...datos,
      email:    datos.email?.trim()    || null,
      telefono: datos.telefono?.trim() || null,
      empresa:  datos.empresa?.trim()  || null,
      notas:    datos.notas?.trim()    || null,
    };

    let respuesta;
    if (esEdicion) {
      respuesta = await supabase.from('afiliados').update(payload).eq('id', id);
    } else {
      respuesta = await supabase.from('afiliados').insert(payload);
    }

    setGuardando(false);

    if (respuesta.error) {
      const msg = traducirError(respuesta.error.message);
      setErrorForm(msg);
      notificarError(msg);
    } else {
      exito(esEdicion ? 'Afiliado actualizado correctamente' : 'Afiliado creado correctamente');
      navigate('/afiliados');
    }
  }

  if (cargando) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/afiliados')}
        sx={{ mb: 2 }}
      >
        Volver al listado
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, border: 1, borderColor: 'divider' }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {esEdicion ? 'Editar afiliado' : 'Nuevo afiliado'}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          {esEdicion
            ? 'Modifica los datos del afiliado y guarda los cambios.'
            : 'Rellena los datos para registrar un nuevo afiliado.'}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {errorForm && <Alert severity="error">{errorForm}</Alert>}

            <Typography variant="overline" color="text.secondary">
              Datos personales
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="DNI"
                  value={datos.dni}
                  onChange={(e) => actualizar('dni', e.target.value.toUpperCase())}
                  required fullWidth
                  inputProps={{ maxLength: 9 }}
                  placeholder="12345678A"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Nombre"
                  value={datos.nombre}
                  onChange={(e) => actualizar('nombre', e.target.value)}
                  required fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Apellidos"
                  value={datos.apellidos}
                  onChange={(e) => actualizar('apellidos', e.target.value)}
                  required fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email" type="email"
                  value={datos.email}
                  onChange={(e) => actualizar('email', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Teléfono"
                  value={datos.telefono}
                  onChange={(e) => actualizar('telefono', e.target.value)}
                  fullWidth placeholder="600 000 000"
                />
              </Grid>
            </Grid>

            <Typography variant="overline" color="text.secondary">
              Datos laborales
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField select label="Sector"
                  value={datos.sector_id}
                  onChange={(e) => actualizar('sector_id', e.target.value)}
                  required fullWidth
                >
                  <MenuItem value="" disabled>Selecciona un sector</MenuItem>
                  {sectores.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Empresa"
                  value={datos.empresa}
                  onChange={(e) => actualizar('empresa', e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField label="Notas internas"
              value={datos.notas}
              onChange={(e) => actualizar('notas', e.target.value)}
              fullWidth multiline rows={3}
              helperText="Información interna no visible para el afiliado"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={datos.activo}
                  onChange={(e) => actualizar('activo', e.target.checked)}
                />
              }
              label={datos.activo ? 'Afiliación activa' : 'Afiliación inactiva'}
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
              <Button onClick={() => navigate('/afiliados')} disabled={guardando}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />}
                disabled={guardando}>
                {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear afiliado'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

function validarDNI(dni) {
  if (!dni) return false;
  const limpio = dni.toUpperCase().trim();
  if (!/^\d{8}[A-Z]$/.test(limpio)) return false;
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const numero = parseInt(limpio.slice(0, 8), 10);
  return letras[numero % 23] === limpio[8];
}

function traducirError(msg) {
  if (msg.includes('duplicate key') && msg.includes('dni'))
    return 'Ya existe un afiliado con ese DNI';
  if (msg.includes('duplicate key') && msg.includes('email'))
    return 'Ya existe un afiliado con ese email';
  return msg;
}
