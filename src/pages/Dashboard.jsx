// src/pages/Dashboard.jsx
// -------------------------------------------------------
// Dashboard profesional con KPIs e indicadores visuales.
// Utiliza Recharts para representar datos de afiliados e
// incidencias, permitiendo una toma de decisiones rápida.
// -------------------------------------------------------

import { useEffect, useState } from 'react';
import {
  Box, Container, Grid, Paper, Typography, Stack,
  CircularProgress, Alert, Avatar,
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { supabase } from '../lib/supabase';

// Paleta corporativa
const COLORES = ['#283d61', '#f1880d', '#3f5b8a', '#f9c34e', '#1a2640', '#b1430a'];

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [datosSector, setDatosSector] = useState([]);
  const [datosIncidencias, setDatosIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    setCargando(true);
    setError(null);

    try {
      const [resRes, sectRes, incRes] = await Promise.all([
        supabase.from('v_dashboard_resumen').select('*').single(),
        supabase.from('v_afiliados_por_sector').select('*'),
        supabase.from('v_incidencias_por_sector').select('*'),
      ]);

      if (resRes.error) setError(resRes.error.message);
      else setResumen(resRes.data);

      if (!sectRes.error) {
        setDatosSector(sectRes.data.map(s => ({ name: s.sector, value: Number(s.total) })));
      }

      if (!incRes.error) {
        setDatosIncidencias(incRes.data.map(i => ({
          name: i.sector,
          pendientes: i.pendientes,
          proceso: i.en_proceso,
          resueltas: i.resueltas
        })));
      }
    } catch (err) {
      setError('Error al cargar datos del dashboard');
    } finally {
      setCargando(false);
    }
  }

  return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Panel de Control</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Estadísticas en tiempo real para la toma de decisiones.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {cargando ? (
            <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
        ) : (
            <>
              {/* KPIs */}
              <Grid container spacing={3} mb={4}>
                <Tarjeta titulo="Afiliados" valor={resumen?.afiliados_activos ?? 0} icon={<PeopleIcon />} color="#283d61" />
                <Tarjeta titulo="Incidencias" valor={resumen?.incidencias_total ?? 0} icon={<AssignmentIcon />} color="#f1880d" />
                <Tarjeta titulo="Pendientes" valor={resumen?.incidencias_pendientes ?? 0} icon={<WarningIcon />} color="#d32f2f" />
              </Grid>

              {/* Gráficos */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', height: 400 }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>Afiliados por Sector</Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <PieChart>
                        <Pie data={datosSector} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                          {datosSector.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', height: 400 }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>Resolución por Sector</Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={datosIncidencias}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="pendientes" stackId="a" fill="#ff9800" name="Pendientes" />
                        <Bar dataKey="proceso" stackId="a" fill="#2196f3" name="En proceso" />
                        <Bar dataKey="resueltas" stackId="a" fill="#4caf50" name="Resueltas" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </>
        )}
      </Container>
  );
}

function Tarjeta({ titulo, valor, icon, color }) {
  return (
      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: `${color}15`, color: color }}>{icon}</Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary">{titulo}</Typography>
            <Typography variant="h4" fontWeight={700}>{valor}</Typography>
          </Box>
        </Paper>
      </Grid>
  );
}