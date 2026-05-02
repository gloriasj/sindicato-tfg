// src/pages/Dashboard.jsx
// -------------------------------------------------------
// Dashboard con KPIs, afiliados por sector e
// incidencias por sector (cumple el objetivo del
// anteproyecto: estadísticas sobre los problemas más
// frecuentes en cada área).
// -------------------------------------------------------

import { useEffect, useState } from 'react';
import {
  Box, Container, Grid, Paper, Typography, Stack,
  CircularProgress, Alert, Chip,
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  Pending as PendingIcon,
  Loop as LoopIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [resumen, setResumen]     = useState(null);
  const [porSector, setPorSector] = useState([]);
  const [incPorSector, setIncPorSector] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    setCargando(true);
    setError(null);

    const [resRes, sectRes, incSectRes] = await Promise.all([
      supabase.from('v_dashboard_resumen').select('*').single(),
      supabase.from('v_afiliados_por_sector').select('*'),
      supabase.from('v_incidencias_por_sector').select('*'),
    ]);

    if (resRes.error)   setError(resRes.error.message);
    else                setResumen(resRes.data);
    if (!sectRes.error) setPorSector(sectRes.data ?? []);
    if (!incSectRes.error) setIncPorSector(incSectRes.data ?? []);

    setCargando(false);
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Panel de control
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Resumen general del sistema
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {cargando ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* KPIs */}
          <Grid container spacing={3} mb={4}>
            <Tarjeta
              icono={<PeopleIcon fontSize="large" />}
              color="#283d61"
              titulo="Afiliados activos"
              valor={resumen?.afiliados_activos ?? 0}
              subtitulo={`${resumen?.afiliados_total ?? 0} en total`}
            />
            <Tarjeta
              icono={<PendingIcon fontSize="large" />}
              color="#ed6c02"
              titulo="Pendientes"
              valor={resumen?.incidencias_pendientes ?? 0}
            />
            <Tarjeta
              icono={<LoopIcon fontSize="large" />}
              color="#0288d1"
              titulo="En proceso"
              valor={resumen?.incidencias_en_proceso ?? 0}
            />
            <Tarjeta
              icono={<CheckIcon fontSize="large" />}
              color="#2e7d32"
              titulo="Resueltas"
              valor={resumen?.incidencias_resueltas ?? 0}
            />
          </Grid>

          {/* Estadísticas por sector */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Afiliados por sector
                </Typography>
                {porSector.length === 0 ? (
                  <Typography color="text.secondary" mt={2}>
                    Aún no hay afiliados registrados.
                  </Typography>
                ) : (
                  <Stack spacing={1.5} mt={2}>
                    {porSector.map((s) => {
                      const max = Math.max(...porSector.map((x) => Number(x.total) || 0), 1);
                      const ancho = (Number(s.total) / max) * 100;
                      return (
                        <Box key={s.sector}>
                          <Stack direction="row" justifyContent="space-between" mb={0.5}>
                            <Typography variant="body2">{s.sector}</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {s.total}
                            </Typography>
                          </Stack>
                          <Box sx={{ height: 8, bgcolor: 'grey.100', borderRadius: 4, overflow: 'hidden' }}>
                            <Box sx={{
                              height: '100%', width: `${ancho}%`,
                              bgcolor: 'primary.main', transition: 'width 0.4s',
                            }}/>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Incidencias por sector
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Áreas con más actividad
                </Typography>

                {incPorSector.filter((s) => s.total_incidencias > 0).length === 0 ? (
                  <Typography color="text.secondary" mt={2}>
                    Aún no hay incidencias registradas.
                  </Typography>
                ) : (
                  <Stack spacing={2} mt={2}>
                    {incPorSector
                      .filter((s) => s.total_incidencias > 0)
                      .sort((a, b) => b.total_incidencias - a.total_incidencias)
                      .map((s) => (
                        <Box key={s.sector}>
                          <Stack direction="row" justifyContent="space-between" mb={0.5}>
                            <Typography variant="body2" fontWeight={500}>
                              {s.sector}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {s.total_incidencias}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1}>
                            {s.pendientes > 0 && (
                              <Chip size="small" color="warning"
                                label={`${s.pendientes} pendiente(s)`} />
                            )}
                            {s.en_proceso > 0 && (
                              <Chip size="small" color="info"
                                label={`${s.en_proceso} en proceso`} />
                            )}
                            {s.resueltas > 0 && (
                              <Chip size="small" color="success"
                                label={`${s.resueltas} resuelta(s)`} />
                            )}
                          </Stack>
                        </Box>
                      ))}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}

function Tarjeta({ icono, color, titulo, valor, subtitulo }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ color }}>{icono}</Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {titulo}
            </Typography>
            <Typography variant="h4" fontWeight={600}>
              {valor}
            </Typography>
            {subtitulo && (
              <Typography variant="caption" color="text.secondary">
                {subtitulo}
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>
    </Grid>
  );
}
