
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Container, Typography, Button, TextField, MenuItem,
  Stack, Grid, Alert, FormControlLabel, Switch,
  CircularProgress, Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useNotificacion } from '../context/NotificacionContext';


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
  '& .MuiSelect-select': { color: '#fff' },
  '& .MuiSvgIcon-root': { color: '#94a3b8' },
  '& .MuiInputBase-input::placeholder': { color: '#94a3b8', opacity: 0.7 },
  '& .MuiFormHelperText-root': { color: '#94a3b8' },
};


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
        <Box sx={{ minHeight: '100vh', bgcolor: '#080d1c', p: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
    );
  }

  return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#080d1c', py: 4 }}>
        <Container maxWidth="md">
          <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/afiliados')}
              sx={{ mb: 4, color: '#94a3b8', '&:hover': { color: '#fff' } }}
          >
            Volver al listado
          </Button>

          {/* CONTENEDOR PLANO EN LUGAR DE PAPER (TARJETA) */}
          <Box sx={{ pb: 4 }}>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#fff', mb: 1 }}>
              {esEdicion ? 'Editar afiliado' : 'Nuevo afiliado'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
              {esEdicion
                  ? 'Modifica los datos del afiliado y guarda los cambios.'
                  : 'Rellena los datos para registrar un nuevo afiliado.'}
            </Typography>

            <Divider sx={{ borderColor: '#1e293b', mb: 5 }} />

            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                {errorForm && <Alert severity="error">{errorForm}</Alert>}

                {/* DATOS PERSONALES */}
                <Box>
                  <Typography variant="overline" sx={{ color: '#3b82f6', fontWeight: 600, display: 'block', mb: 2 }}>
                    Datos personales
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                          label="DNI"
                          value={datos.dni}
                          onChange={(e) => actualizar('dni', e.target.value.toUpperCase())}
                          required fullWidth
                          inputProps={{ maxLength: 9 }}
                          placeholder="12345678A"
                          sx={inputStyle}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField label="Nombre"
                                 value={datos.nombre}
                                 onChange={(e) => actualizar('nombre', e.target.value)}
                                 required fullWidth
                                 sx={inputStyle}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField label="Apellidos"
                                 value={datos.apellidos}
                                 onChange={(e) => actualizar('apellidos', e.target.value)}
                                 required fullWidth
                                 sx={inputStyle}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Email" type="email"
                                 value={datos.email}
                                 onChange={(e) => actualizar('email', e.target.value)}
                                 fullWidth
                                 sx={inputStyle}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Teléfono"
                                 value={datos.telefono}
                                 onChange={(e) => actualizar('telefono', e.target.value)}
                                 fullWidth placeholder="600 000 000"
                                 sx={inputStyle}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ borderColor: '#1e293b' }} />

                {/* DATOS LABORALES */}
                <Box>
                  <Typography variant="overline" sx={{ color: '#3b82f6', fontWeight: 600, display: 'block', mb: 2 }}>
                    Datos laborales
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField select label="Sector"
                                 value={datos.sector_id}
                                 onChange={(e) => actualizar('sector_id', e.target.value)}
                                 required fullWidth
                                 sx={inputStyle}
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
                                 sx={inputStyle}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ borderColor: '#1e293b' }} />

                {/* NOTAS Y ESTADO */}
                <Box>
                  <TextField label="Notas internas"
                             value={datos.notas}
                             onChange={(e) => actualizar('notas', e.target.value)}
                             fullWidth multiline rows={3}
                             helperText="Información interna no visible para el afiliado"
                             sx={{ ...inputStyle, mb: 3 }}
                  />

                  <FormControlLabel
                      control={
                        <Switch
                            checked={datos.activo}
                            onChange={(e) => actualizar('activo', e.target.checked)}
                            color="primary"
                        />
                      }
                      label={
                        <Typography sx={{ color: datos.activo ? '#fff' : '#94a3b8' }}>
                          {datos.activo ? 'Afiliación activa' : 'Afiliación inactiva'}
                        </Typography>
                      }
                  />
                </Box>

                <Stack direction="row" spacing={2} justifyContent="flex-end" pt={3} borderTop="1px solid #1e293b" mt={4}>
                  <Button onClick={() => navigate('/afiliados')} disabled={guardando} sx={{ color: '#94a3b8' }}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={guardando}>
                    {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear afiliado'}
                  </Button>
                </Stack>

              </Stack>
            </form>
          </Box>
        </Container>
      </Box>
  );
}

function validarDNI(dni) {
  if (!dni) return false;
  const limpio = dni.toUpperCase().trim();
  return /^\d{8}[A-Z]$/.test(limpio);
}

function traducirError(msg) {
  if (msg.includes('duplicate key') && msg.includes('dni'))
    return 'Ya existe un afiliado con ese DNI';
  if (msg.includes('duplicate key') && msg.includes('email'))
    return 'Ya existe un afiliado con ese email';
  return msg;
}