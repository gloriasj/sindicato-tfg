// src/pages/Dashboard.jsx
import {
    Box, Typography, Grid, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, InputBase, Avatar, IconButton
} from '@mui/material';
import {
    Assignment, LocalFireDepartment, CheckCircle, People, Schedule,
    ArrowUpward, ArrowDownward, Search, NotificationsNone,
    Person, Check
} from '@mui/icons-material';
import {
    ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
    CartesianGrid, XAxis, YAxis, Tooltip
} from 'recharts';

// -----------------------------------------------------
// DATOS MOCK (Para que se vea idéntico a la imagen)
// -----------------------------------------------------

const sparklineData = [{v: 10},{v: 15},{v: 8},{v: 25},{v: 18},{v: 30},{v: 20}];

const kpis = [
    { title: 'Incidencias abiertas', value: '42', trend: '+12%', isUp: true, icon: <Assignment />, color: '#a855f7', sparkline: sparklineData },
    { title: 'Incidencias urgentes', value: '8', trend: '+33%', isUp: true, icon: <LocalFireDepartment />, color: '#ef4444', sparkline: sparklineData },
    { title: 'Incidencias resueltas este mes', value: '128', trend: '+18%', isUp: true, icon: <CheckCircle />, color: '#10b981', sparkline: sparklineData },
    { title: 'Afiliados activos', value: '94', trend: '+7%', isUp: true, icon: <People />, color: '#3b82f6', sparkline: sparklineData },
    { title: 'Tiempo medio de resolución', value: '2.3 días', trend: '-8%', isUp: false, icon: <Schedule />, color: '#f59e0b', sparkline: sparklineData },
];

const incidenciasMes = [
    { mes: 'Ene', total: 12 }, { mes: 'Feb', total: 19 }, { mes: 'Mar', total: 28 },
    { mes: 'Abr', total: 38 }, { mes: 'May', total: 30 }, { mes: 'Jun', total: 21 },
];

const incidenciasSector = [
    { name: 'Sanidad', value: 45, percent: '36%', color: '#8b5cf6' },
    { name: 'Educación', value: 22, percent: '18%', color: '#3b82f6' },
    { name: 'Transporte', value: 15, percent: '12%', color: '#10b981' },
    { name: 'Administración', value: 9, percent: '7%', color: '#f59e0b' },
    { name: 'Servicios', value: 18, percent: '15%', color: '#ef4444' },
    { name: 'Otros', value: 16, percent: '12%', color: '#64748b' },
];

const estadoIncidencias = [
    { name: 'Abiertas', value: 35, percent: '20%', color: '#8b5cf6' },
    { name: 'En proceso', value: 12, percent: '7%', color: '#3b82f6' },
    { name: 'Cerradas', value: 140, percent: '73%', color: '#10b981' },
];

const incidenciasRecientes = [
    { id: '#INC-2024-021', titulo: 'Problema con nómina de abril', afiliado: 'José García', sector: 'Sanidad', prioridad: 'URGENTE', estado: 'ABIERTA', fecha: '12/05/2024' },
    { id: '#INC-2024-020', titulo: 'Duda sobre convenio colectivo', afiliado: 'María López', sector: 'Educación', prioridad: 'ALTA', estado: 'EN PROCESO', fecha: '11/05/2024' },
    { id: '#INC-2024-019', titulo: 'Solicitud de documentación', afiliado: 'Carlos Martín', sector: 'Administración', prioridad: 'MEDIA', estado: 'ABIERTA', fecha: '10/05/2024' },
    { id: '#INC-2024-018', titulo: 'Incidencia con aplicación', afiliado: 'Lucía Fernández', sector: 'Servicios', prioridad: 'MEDIA', estado: 'CERRADA', fecha: '09/05/2024' },
    { id: '#INC-2024-017', titulo: 'Consulta sobre permisos', afiliado: 'Antonio Ruiz', sector: 'Transporte', prioridad: 'BAJA', estado: 'CERRADA', fecha: '08/05/2024' },
];

const actividades = [
    { user: 'Marta Gómez', action: 'creó una nueva incidencia', time: 'Hace 10 min', icon: <Assignment sx={{ fontSize: 16 }}/>, color: '#8b5cf6' },
    { user: 'Pedro Sánchez', action: 'cambió la prioridad a Urgente', time: 'Hace 25 min', icon: <ArrowUpward sx={{ fontSize: 16 }}/>, color: '#f59e0b' },
    { user: 'Laura Pérez', action: 'asignó la incidencia a Juan López', time: 'Hace 1 hora', icon: <Person sx={{ fontSize: 16 }}/>, color: '#3b82f6' },
    { user: 'Ana Martínez', action: 'cerró la incidencia #INC-2024-015', time: 'Hace 2 horas', icon: <Check sx={{ fontSize: 16 }}/>, color: '#10b981' },
    { user: 'Nuevo archivo adjunto', action: 'en la incidencia #INC-2024-018', time: 'Hace 3 horas', icon: <Assignment sx={{ fontSize: 16 }}/>, color: '#8b5cf6' },
];

// -----------------------------------------------------
// COMPONENTE PRINCIPAL
// -----------------------------------------------------

export default function Dashboard() {
    return (
        <Box sx={{ width: '100%', px: { xs: 2, md: 4, lg: 5 }, py: 4 }}>

            {/* HEADER SUPERIOR */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 3,
                    mb: 5
                }}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#ffffff' }}>
                        Dashboard
                    </Typography>
                    <Typography sx={{ color: '#94a3b8', mt: 0.5, fontSize: '0.9rem' }}>
                        Resumen general del sistema
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: { xs: 2, md: 3 }, width: { xs: '100%', md: 'auto' } }}>
                    <Paper sx={{ display: 'flex', alignItems: 'center', bgcolor: '#111827', border: '1px solid #1e293b', borderRadius: '8px', px: 2, py: 0.75, width: { xs: '100%', md: 280 }, boxShadow: 'none' }}>
                        <InputBase placeholder="Buscar..." sx={{ flex: 1, color: '#fff', fontSize: '0.9rem' }} />
                        <Search sx={{ color: '#64748b', fontSize: 20 }} />
                    </Paper>

                    <IconButton sx={{ color: '#94a3b8', position: 'relative' }}>
                        <NotificationsNone />
                        <Box sx={{ position: 'absolute', top: 4, right: 6, width: 16, height: 16, bgcolor: '#a855f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0f172a' }}>
                            <Typography sx={{ fontSize: '9px', color: '#fff', fontWeight: 'bold' }}>3</Typography>
                        </Box>
                    </IconButton>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#a855f7', fontSize: '1.1rem', fontWeight: 600 }}>L</Avatar>
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Typography sx={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.2 }}>Laura Pérez</Typography>
                            <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }}>Administradora</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* 1. ROW: TARJETAS KPI */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2.5, mb: 4 }}>
                {kpis.map((kpi, index) => (
                    <Paper key={index} sx={{ ...cardStyle, position: 'relative', overflow: 'hidden', p: 0, minHeight: 230, display: 'flex', flexDirection: 'column' }}>

                        {/* Contenido de texto */}
                        <Box sx={{ p: 3.5, position: 'relative', zIndex: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 2.5 }}>
                                <Box sx={{ bgcolor: kpi.color, color: '#ffffff', width: 54, height: 54, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 10px ${kpi.color}40` }}>
                                    {kpi.icon}
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.2, mb: 0.5 }}>
                                        {kpi.title}
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700} sx={{ color: '#ffffff', lineHeight: 1 }}>
                                        {kpi.value}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 3 }}>
                                <Typography sx={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ color: kpi.isUp ? (kpi.color === '#ef4444' ? '#ef4444' : '#10b981') : '#f59e0b', display: 'flex', alignItems: 'center', marginRight: '6px', fontWeight: 600 }}>
                                        {kpi.isUp ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
                                        {kpi.trend}
                                    </span>
                                    desde el mes pasado
                                </Typography>
                            </Box>
                        </Box>

                        {/* Sparkline */}
                        <Box sx={{ height: 75, width: '100%', position: 'absolute', bottom: 0, left: 0, zIndex: 1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={kpi.sparkline}>
                                    <defs>
                                        <linearGradient id={`gradienteSparkline${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={kpi.color} stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor={kpi.color} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="v" stroke={kpi.color} strokeWidth={2} fillOpacity={1} fill={`url(#gradienteSparkline${index})`} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                ))}
            </Box>
            {/* 2. MAIN LAYOUT: Izquierda (Gráficos y Tabla) | Derecha (Actividad) */}
            <Grid container spacing={3}>

                {/* 2. COLUMNA IZQUIERDA - Vuelve a ser de 9 para que la derecha respire */}
                <Grid item xs={12} lg={9}>

                    {/* FILA DE 3 GRÁFICOS (Iguales, 1/3 cada uno) */}
                    <Grid container spacing={3} mb={3}>

                        {/* Gráfico 1: Área (Meses) */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ ...cardStyle, height: 360, display: 'flex', flexDirection: 'column' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography fontWeight={600} sx={{ color: '#ffffff' }}>Incidencias por mes</Typography>
                                    <Chip label="Este año" size="small" sx={{ bgcolor: '#1e293b', color: '#94a3b8', borderRadius: 1 }} />
                                </Box>
                                {/* TRUCO ANTIMONSTRUOS: Posición relativa y absoluta para aislar Recharts */}
                                <Box sx={{ flexGrow: 1, position: 'relative' }}>
                                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={incidenciasMes} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid stroke="#1e293b" vertical={false} />
                                                <XAxis dataKey="mes" stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 12, dy: 10 }} />
                                                <YAxis stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: 8 }} />
                                                <Area type="monotone" dataKey="total" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Gráfico 2: Donut (Sectores) */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ ...cardStyle, height: 360, display: 'flex', flexDirection: 'column' }}>
                                <Typography fontWeight={600} mb={3} sx={{ color: '#ffffff' }}>Incidencias por sector</Typography>
                                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                                    {/* Quesito */}
                                    <Box sx={{ width: '50%', height: '100%', position: 'relative' }}>
                                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={incidenciasSector} dataKey="value" innerRadius="60%" outerRadius="90%" paddingAngle={2}>
                                                        {incidenciasSector.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: 8 }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Box>
                                    {/* Leyenda Derecha */}
                                    <Box sx={{ width: '50%', pl: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.5 }}>
                                        {incidenciasSector.map((s, i) => (
                                            <Box key={i} display="flex" alignItems="center" justifyContent="space-between">
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
                                                    <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</Typography>
                                                </Box>
                                                <Box display="flex" gap={0.5} ml={1}>
                                                    <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>{s.value}</Typography>
                                                    <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>({s.percent})</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Gráfico 3: Donut (Estados) */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ ...cardStyle, height: 360, display: 'flex', flexDirection: 'column' }}>
                                <Typography fontWeight={600} mb={2} sx={{ color: '#ffffff' }}>Estado de incidencias</Typography>
                                {/* Quesito (Ocupa la parte superior) */}
                                <Box sx={{ flexGrow: 1, position: 'relative', mb: 2 }}>
                                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={estadoIncidencias} dataKey="value" innerRadius="60%" outerRadius="90%" paddingAngle={2}>
                                                    {estadoIncidencias.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: 8 }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </Box>
                                {/* Leyenda (Abajo) */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {estadoIncidencias.map((s, i) => (
                                        <Box key={i} display="flex" alignItems="center" justifyContent="space-between">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
                                                <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>{s.name}</Typography>
                                            </Box>
                                            <Box display="flex" gap={1}>
                                                <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>{s.value}</Typography>
                                                <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>({s.percent})</Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>
                        </Grid>

                    </Grid>

                    {/* TABLA DE ÚLTIMAS INCIDENCIAS */}
                    <Paper sx={{ ...cardStyle, p: 0, overflow: 'hidden' }}>
                        <Box p={2.5} borderBottom="1px solid #1e293b">
                            <Typography fontWeight={600} sx={{ color: '#ffffff' }}>Últimas incidencias</Typography>
                        </Box>
                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table size="small" sx={{ minWidth: 800 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={tableHeader}>ID</TableCell>
                                        <TableCell sx={tableHeader}>Título</TableCell>
                                        <TableCell sx={tableHeader}>Afiliado</TableCell>
                                        <TableCell sx={tableHeader}>Sector</TableCell>
                                        <TableCell sx={tableHeader}>Prioridad</TableCell>
                                        <TableCell sx={tableHeader}>Estado</TableCell>
                                        <TableCell sx={tableHeader}>Fecha</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {incidenciasRecientes.map((i, index) => (
                                        <TableRow key={index} sx={{ '& td, & th': { borderBottom: '1px solid #1e293b', py: 2 } }}>
                                            <TableCell sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>{i.id}</TableCell>
                                            <TableCell sx={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{i.titulo}</TableCell>
                                            <TableCell sx={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{i.afiliado}</TableCell>
                                            <TableCell sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>{i.sector}</TableCell>
                                            <TableCell>
                                                <Chip label={i.prioridad} size="small" sx={{
                                                    bgcolor: i.prioridad === 'URGENTE' ? '#ef444420' : i.prioridad === 'ALTA' ? '#f59e0b20' : i.prioridad === 'MEDIA' ? '#eab30820' : '#10b98120',
                                                    color: i.prioridad === 'URGENTE' ? '#ef4444' : i.prioridad === 'ALTA' ? '#f59e0b' : i.prioridad === 'MEDIA' ? '#eab308' : '#10b981',
                                                    fontWeight: 700, borderRadius: 1, fontSize: '0.7rem', height: 24
                                                }} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={i.estado} size="small" sx={{
                                                    bgcolor: i.estado === 'ABIERTA' ? '#a855f720' : i.estado === 'EN PROCESO' ? '#3b82f620' : '#10b98120',
                                                    color: i.estado === 'ABIERTA' ? '#a855f7' : i.estado === 'EN PROCESO' ? '#3b82f6' : '#10b981',
                                                    fontWeight: 700, borderRadius: 1, fontSize: '0.7rem', height: 24
                                                }} />
                                            </TableCell>
                                            <TableCell sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>{i.fecha}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box p={2} textAlign="center" sx={{ bgcolor: 'rgba(17, 24, 39, 0.5)' }}>
                            <Typography sx={{ color: '#a855f7', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                                Ver todas las incidencias
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* 3. COLUMNA DERECHA - Proporción correcta (3 de 12) para que respire */}
                <Grid item xs={12} lg={3}>
                    <Paper sx={{ ...cardStyle, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography fontWeight={600} mb={4} sx={{ color: '#ffffff' }}>Actividad reciente</Typography>

                        <Box sx={{ flex: 1 }}>
                            {actividades.map((act, index) => (
                                <Box key={index} display="flex" gap={2} mb={4} position="relative">
                                    {/* Línea conectora */}
                                    {index !== actividades.length - 1 && (
                                        <Box sx={{ position: 'absolute', left: 16, top: 32, bottom: -32, width: 2, bgcolor: '#1e293b' }} />
                                    )}
                                    {/* Icono */}
                                    <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: `${act.color}15`, color: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, border: `1px solid ${act.color}30` }}>
                                        {act.icon}
                                    </Box>
                                    {/* Contenido */}
                                    <Box>
                                        <Typography sx={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.3 }}>
                                            {act.user} <span style={{ color: '#94a3b8', fontWeight: 400 }}>{act.action}</span>
                                        </Typography>
                                        <Typography sx={{ color: '#64748b', fontSize: '0.75rem', mt: 0.5 }}>
                                            {act.time}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        <Box mt={3} pt={3} textAlign="center">
                            <Box sx={{ display: 'inline-block', border: '1px solid #a855f750', borderRadius: 2, px: 3, py: 1.5, cursor: 'pointer', '&:hover': { bgcolor: '#a855f710' } }}>
                                <Typography sx={{ color: '#a855f7', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Ver todas las actividades
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
}

// -----------------------------------------------------
// ESTILOS GLOBALES REUTILIZABLES
// -----------------------------------------------------
const cardStyle = {
    bgcolor: '#111827',
    borderRadius: 3,
    p: 3,
    border: '1px solid #1e293b',
    boxShadow: 'none',
};

const tableHeader = {
    color: '#94a3b8',
    fontWeight: 600,
    fontSize: '0.75rem',
    borderBottom: '1px solid #1e293b',
};