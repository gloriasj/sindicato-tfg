
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Grid, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, CircularProgress,
} from '@mui/material';
import {
    Assignment, LocalFireDepartment, CheckCircle, People, Schedule,
} from '@mui/icons-material';
import {
    ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
    CartesianGrid, XAxis, YAxis, Tooltip,
} from 'recharts';
import { supabase } from '../lib/supabase';

const COLORES = {
    primario: '#5b8def',
    ambar:    '#f1880d',
    verde:    '#10b981',
    rojo:     '#ef4444',
    amarillo: '#f59e0b',
    morado:   '#a855f7',
    cian:     '#06b6d4',
};

const PALETA_SECTORES = [
    '#5b8def', '#f1880d', '#10b981',
    '#a855f7', '#ef4444', '#06b6d4',
];


const cardStyle = {
    background:   'linear-gradient(180deg, #131c33 0%, #0c1428 100%)',
    borderRadius: 4,
    border:       '1px solid rgba(255,255,255,0.06)',
    boxShadow:    '0 12px 40px rgba(0,0,0,0.35)',
    overflow:     'hidden',
};

const tableHeader = {
    color: '#94a3b8',
    fontWeight: 600,
    fontSize: '0.72rem',
    borderBottom: '1px solid #1e293b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    py: 2,
};

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];



export default function Dashboard() {
    const navigate = useNavigate();

    const [afiliados, setAfiliados]     = useState([]);
    const [incidencias, setIncidencias] = useState([]);
    const [cargando, setCargando]       = useState(true);

    useEffect(() => { cargar(); }, []);

    async function cargar() {
        setCargando(true);

        const [afilRes, incRes] = await Promise.all([
            supabase
                .from('afiliados')
                .select('id, activo, sector:sectores(id, nombre)'),
            supabase
                .from('incidencias')
                .select(`
          id, titulo, estado, prioridad,
          fecha_apertura, fecha_cierre, created_at,
          afiliado:afiliados(
            id, nombre, apellidos,
            sector:sectores(id, nombre)
          )
        `)
                .order('created_at', { ascending: false }),
        ]);

        if (!afilRes.error) setAfiliados(afilRes.data ?? []);
        if (!incRes.error)  setIncidencias(incRes.data  ?? []);

        setCargando(false);
    }



    const stats = useMemo(() => {
        const afiliadosActivos = afiliados.filter(a => a.activo).length;
        const pendientes = incidencias.filter(i => i.estado === 'pendiente').length;
        const enProceso  = incidencias.filter(i => i.estado === 'en_proceso').length;
        const resueltas  = incidencias.filter(i => i.estado === 'resuelta').length;
        const urgentes   = incidencias.filter(
            i => i.prioridad === 'alta' && i.estado !== 'resuelta'
        ).length;

        const cerradas = incidencias.filter(i => i.fecha_cierre);
        let tiempoMedio = 0;
        if (cerradas.length > 0) {
            const sumaMs = cerradas.reduce((acc, i) => {
                return acc +
                    (new Date(i.fecha_cierre).getTime() -
                        new Date(i.fecha_apertura).getTime());
            }, 0);
            tiempoMedio = sumaMs / cerradas.length / (1000 * 60 * 60 * 24);
        }

        return {
            afiliadosActivos,
            pendientes, enProceso, resueltas, urgentes,
            tiempoMedio: tiempoMedio.toFixed(1),
        };
    }, [afiliados, incidencias]);


    const incidenciasPorMes = useMemo(() => {
        const hoy = new Date();
        const datos = [];
        for (let i = 5; i >= 0; i--) {
            const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
            const total = incidencias.filter(inc => {
                const f = new Date(inc.created_at);
                return f.getMonth() === fecha.getMonth() &&
                    f.getFullYear() === fecha.getFullYear();
            }).length;
            datos.push({ mes: MESES_CORTOS[fecha.getMonth()], total });
        }
        return datos;
    }, [incidencias]);



    const incidenciasPorSector = useMemo(() => {
        const agrupado = {};
        incidencias.forEach(i => {
            const sector = i.afiliado?.sector?.nombre ?? 'Sin sector';
            agrupado[sector] = (agrupado[sector] ?? 0) + 1;
        });
        return Object.entries(agrupado)
            .map(([nombre, valor], idx) => ({
                nombre, valor,
                color: PALETA_SECTORES[idx % PALETA_SECTORES.length],
            }))
            .sort((a, b) => b.valor - a.valor);
    }, [incidencias]);



    const estadoIncidencias = useMemo(() => ([
        { nombre: 'Pendientes', valor: stats.pendientes, color: COLORES.amarillo },
        { nombre: 'En proceso', valor: stats.enProceso,  color: COLORES.primario },
        { nombre: 'Resueltas',  valor: stats.resueltas,  color: COLORES.verde },
    ].filter(x => x.valor > 0)), [stats]);



    const sparkData = incidenciasPorMes.map(m => ({ v: m.total }));

    const kpis = [
        {
            title:    'Incidencias abiertas',
            value:    stats.pendientes + stats.enProceso,
            icon:     <Assignment sx={{ fontSize: 26 }} />,
            color:    COLORES.primario,
            sparkline: sparkData,
        },
        {
            title:    'Incidencias urgentes',
            value:    stats.urgentes,
            icon:     <LocalFireDepartment sx={{ fontSize: 26 }} />,
            color:    COLORES.rojo,
            sparkline: sparkData,
        },
        {
            title:    'Incidencias resueltas',
            value:    stats.resueltas,
            icon:     <CheckCircle sx={{ fontSize: 26 }} />,
            color:    COLORES.verde,
            sparkline: sparkData,
        },
        {
            title:    'Afiliados activos',
            value:    stats.afiliadosActivos,
            icon:     <People sx={{ fontSize: 26 }} />,
            color:    COLORES.morado,
            sparkline: sparkData,
        },
        {
            title:    'Tiempo medio resolución',
            value:    stats.tiempoMedio > 0 ? `${stats.tiempoMedio} d` : '—',
            icon:     <Schedule sx={{ fontSize: 26 }} />,
            color:    COLORES.ambar,
            sparkline: sparkData,
        },
    ];

    // Listas de incidencias para las tablas inferiores
    const ultimas = incidencias.slice(0, 5);

    const ultimasResueltas = useMemo(() => {
        return incidencias
            .filter(i => i.estado === 'resuelta')
            .sort((a, b) => new Date(b.fecha_cierre || b.created_at) - new Date(a.fecha_cierre || a.created_at))
            .slice(0, 5);
    }, [incidencias]);


    if (cargando) {
        return (
            <Box sx={{
                minHeight: '100vh',
                bgcolor: '#080d1c',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <CircularProgress sx={{ color: COLORES.primario }} />
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#080d1c',
            backgroundImage: `
        radial-gradient(circle at 20% 0%, rgba(91,141,239,0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 50%, rgba(241,136,13,0.05) 0%, transparent 50%)
      `,
            px: { xs: 2, md: 4, lg: 5 },
            py: 4,
        }}>

            <Box mb={5}>
                <Typography variant="h4" fontWeight={700} sx={{
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                }}>
                    Dashboard
                </Typography>
                <Typography sx={{
                    color: '#94a3b8', mt: 0.5,
                    fontSize: '0.95rem',
                }}>
                    Resumen del Portal Sindical en tiempo real
                </Typography>
            </Box>


            <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    xl: 'repeat(5, 1fr)',
                },
                gap: 3,
                mb: 5,
            }}>
                {kpis.map((kpi, idx) => (
                    <TarjetaKPI key={idx} kpi={kpi} index={idx} />
                ))}
            </Box>


            <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(3, 1fr)',
                },
                gap: 3,
                mb: 5,
            }}>

                <Paper sx={{
                    ...cardStyle, p: 3.5, height: 400,
                    display: 'flex', flexDirection: 'column',
                }}>
                    <Box mb={2}>
                        <Typography fontWeight={700} sx={{
                            color: '#fff', fontSize: '1.05rem',
                        }}>
                            Incidencias por mes
                        </Typography>
                        <Typography sx={{
                            color: '#64748b', fontSize: '0.75rem', mt: 0.3,
                        }}>
                            Evolución últimos 6 meses
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        {incidenciasPorMes.every(m => m.total === 0) ? (
                            <MensajeVacio texto="Aún no hay incidencias registradas" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={incidenciasPorMes}
                                           margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorMes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor={COLORES.primario} stopOpacity={0.5} />
                                            <stop offset="95%" stopColor={COLORES.primario} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="mes" stroke="#64748b" tickLine={false}
                                           axisLine={false} tick={{ fontSize: 12, dy: 8 }} />
                                    <YAxis stroke="#64748b" tickLine={false}
                                           axisLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #1e293b',
                                        borderRadius: 8,
                                        color: '#fff',
                                    }} />
                                    <Area type="monotone" dataKey="total"
                                          stroke={COLORES.primario} strokeWidth={3}
                                          fill="url(#colorMes)"
                                          dot={{ r: 4, fill: COLORES.primario, strokeWidth: 0 }}
                                          activeDot={{ r: 7, fill: COLORES.primario,
                                              stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Box>
                </Paper>


                <Paper sx={{
                    ...cardStyle, p: 3.5, height: 400,
                    display: 'flex', flexDirection: 'column',
                }}>
                    <Box mb={2}>
                        <Typography fontWeight={700} sx={{
                            color: '#fff', fontSize: '1.05rem',
                        }}>
                            Incidencias por sector
                        </Typography>
                        <Typography sx={{
                            color: '#64748b', fontSize: '0.75rem', mt: 0.3,
                        }}>
                            Distribución actual
                        </Typography>
                    </Box>
                    {incidenciasPorSector.length === 0 ? (
                        <MensajeVacio texto="No hay datos por sector" />
                    ) : (
                        <>
                            <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={incidenciasPorSector}
                                             dataKey="valor"
                                             innerRadius={55}
                                             outerRadius={82}
                                             paddingAngle={3}>
                                            {incidenciasPorSector.map((s, idx) => (
                                                <Cell key={idx} fill={s.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{
                                            backgroundColor: '#0f172a',
                                            border: '1px solid #1e293b',
                                            borderRadius: 8,
                                            color: '#fff',
                                        }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Total en el centro */}
                                <Box sx={{
                                    position: 'absolute', top: '50%', left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center', pointerEvents: 'none',
                                }}>
                                    <Typography sx={{
                                        color: '#fff', fontWeight: 700,
                                        fontSize: '1.8rem', lineHeight: 1,
                                    }}>
                                        {incidenciasPorSector.reduce((a, c) => a + c.valor, 0)}
                                    </Typography>
                                    <Typography sx={{
                                        color: '#64748b', fontSize: '0.7rem', mt: 0.3,
                                    }}>
                                        Total
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{
                                mt: 1.5,
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 1,
                            }}>
                                {incidenciasPorSector.map((s, idx) => {
                                    const total = incidenciasPorSector
                                        .reduce((acc, c) => acc + c.valor, 0);
                                    const pct = ((s.valor / total) * 100).toFixed(0);
                                    return (
                                        <Box key={idx} sx={{
                                            display: 'flex', alignItems: 'center', gap: 1,
                                        }}>
                                            <Box sx={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                bgcolor: s.color, flexShrink: 0,
                                                boxShadow: `0 0 8px ${s.color}80`,
                                            }} />
                                            <Typography sx={{
                                                color: '#cbd5e1', fontSize: '0.72rem', flex: 1,
                                                overflow: 'hidden', textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {s.nombre}
                                            </Typography>
                                            <Typography sx={{
                                                color: '#fff', fontSize: '0.72rem',
                                                fontWeight: 600,
                                            }}>
                                                {s.valor}{' '}
                                                <span style={{ color: '#64748b' }}>({pct}%)</span>
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </>
                    )}
                </Paper>


                <Paper sx={{
                    ...cardStyle, p: 3.5, height: 400,
                    display: 'flex', flexDirection: 'column',
                }}>
                    <Box mb={2}>
                        <Typography fontWeight={700} sx={{
                            color: '#fff', fontSize: '1.05rem',
                        }}>
                            Estado de incidencias
                        </Typography>
                        <Typography sx={{
                            color: '#64748b', fontSize: '0.75rem', mt: 0.3,
                        }}>
                            Pendientes, en curso y cerradas
                        </Typography>
                    </Box>
                    {estadoIncidencias.length === 0 ? (
                        <MensajeVacio texto="No hay incidencias" />
                    ) : (
                        <>
                            <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={estadoIncidencias}
                                             dataKey="valor"
                                             innerRadius={55}
                                             outerRadius={82}
                                             paddingAngle={3}>
                                            {estadoIncidencias.map((s, idx) => (
                                                <Cell key={idx} fill={s.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{
                                            backgroundColor: '#0f172a',
                                            border: '1px solid #1e293b',
                                            borderRadius: 8,
                                            color: '#fff',
                                        }} />
                                    </PieChart>
                                </ResponsiveContainer>

                                <Box sx={{
                                    position: 'absolute', top: '50%', left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center', pointerEvents: 'none',
                                }}>
                                    <Typography sx={{
                                        color: '#fff', fontWeight: 700,
                                        fontSize: '1.8rem', lineHeight: 1,
                                    }}>
                                        {estadoIncidencias.reduce((a, c) => a + c.valor, 0)}
                                    </Typography>
                                    <Typography sx={{
                                        color: '#64748b', fontSize: '0.7rem', mt: 0.3,
                                    }}>
                                        Total
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ mt: 1.5 }}>
                                {estadoIncidencias.map((s, idx) => {
                                    const total = estadoIncidencias
                                        .reduce((acc, c) => acc + c.valor, 0);
                                    const pct = ((s.valor / total) * 100).toFixed(0);
                                    return (
                                        <Box key={idx} sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            mb: 0.8,
                                        }}>
                                            <Box sx={{
                                                display: 'flex', alignItems: 'center', gap: 1,
                                            }}>
                                                <Box sx={{
                                                    width: 8, height: 8, borderRadius: '50%',
                                                    bgcolor: s.color,
                                                    boxShadow: `0 0 8px ${s.color}80`,
                                                }} />
                                                <Typography sx={{
                                                    color: '#cbd5e1', fontSize: '0.78rem',
                                                }}>
                                                    {s.nombre}
                                                </Typography>
                                            </Box>
                                            <Typography sx={{
                                                color: '#fff', fontSize: '0.78rem',
                                                fontWeight: 600,
                                            }}>
                                                {s.valor}{' '}
                                                <span style={{ color: '#64748b' }}>({pct}%)</span>
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>


            <Box sx={{ height: { xs: 16, md: 32 } }} />


            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                gap: 3,
            }}>

                <Paper sx={{ ...cardStyle, p: 0, overflow: 'hidden' }}>
                    <Box sx={{
                        px: 3.5, py: 2.5,
                        borderBottom: '1px solid #1e293b',
                    }}>
                        <Typography fontWeight={700} sx={{
                            color: '#fff', fontSize: '1.05rem',
                        }}>
                            Últimas incidencias registradas
                        </Typography>
                        <Typography sx={{
                            color: '#64748b', fontSize: '0.75rem', mt: 0.3,
                        }}>
                            Las {ultimas.length} más recientes del sistema
                        </Typography>
                    </Box>

                    {ultimas.length === 0 ? (
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                            <Typography sx={{ color: '#64748b' }}>
                                Todavía no hay incidencias registradas.
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table size="small" sx={{ minWidth: 600 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ ...tableHeader, pl: 3.5 }}>ID</TableCell>
                                        <TableCell sx={tableHeader}>Título</TableCell>
                                        <TableCell sx={tableHeader}>Afiliado</TableCell>
                                        <TableCell sx={tableHeader}>Estado</TableCell>
                                        <TableCell sx={{ ...tableHeader, pr: 3.5 }}>Fecha</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {ultimas.map((i) => (
                                        <TableRow
                                            key={i.id}
                                            onClick={() => navigate(`/incidencias/${i.id}/detalle`)}
                                            sx={{
                                                cursor: 'pointer',
                                                '& td': {
                                                    borderBottom: '1px solid #1e293b',
                                                    py: 2,
                                                },
                                                '&:hover': { bgcolor: 'rgba(91,141,239,0.06)' },
                                                '&:last-child td': { borderBottom: 0 },
                                            }}
                                        >
                                            <TableCell sx={{
                                                color: '#94a3b8', fontSize: '0.8rem',
                                                fontFamily: 'monospace', pl: 3.5,
                                            }}>
                                                #INC-{String(i.id).padStart(4, '0')}
                                            </TableCell>
                                            <TableCell sx={{
                                                color: '#fff', fontSize: '0.85rem',
                                                fontWeight: 500, whiteSpace: 'nowrap',
                                                maxWidth: 200, overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}>
                                                {i.titulo}
                                            </TableCell>
                                            <TableCell sx={{
                                                color: '#cbd5e1', fontSize: '0.8rem',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {i.afiliado
                                                    ? `${i.afiliado.apellidos}, ${i.afiliado.nombre}`
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <ChipEstado estado={i.estado} />
                                            </TableCell>
                                            <TableCell sx={{
                                                color: '#94a3b8', fontSize: '0.8rem',
                                                whiteSpace: 'nowrap', pr: 3.5,
                                            }}>
                                                {new Date(i.created_at).toLocaleDateString('es-ES')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>


                <Paper sx={{ ...cardStyle, p: 0, overflow: 'hidden' }}>
                    <Box sx={{
                        px: 3.5, py: 2.5,
                        borderBottom: '1px solid #1e293b',
                    }}>
                        <Typography fontWeight={700} sx={{
                            color: '#fff', fontSize: '1.05rem',
                        }}>
                            Últimas incidencias resueltas
                        </Typography>
                        <Typography sx={{
                            color: '#64748b', fontSize: '0.75rem', mt: 0.3,
                        }}>
                            Las {ultimasResueltas.length} completadas más recientemente
                        </Typography>
                    </Box>

                    {ultimasResueltas.length === 0 ? (
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                            <Typography sx={{ color: '#64748b' }}>
                                Aún no se han resuelto incidencias.
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table size="small" sx={{ minWidth: 600 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ ...tableHeader, pl: 3.5 }}>ID</TableCell>
                                        <TableCell sx={tableHeader}>Título</TableCell>
                                        <TableCell sx={tableHeader}>Afiliado</TableCell>
                                        <TableCell sx={tableHeader}>Prioridad</TableCell>
                                        <TableCell sx={{ ...tableHeader, pr: 3.5 }}>Cierre</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {ultimasResueltas.map((i) => (
                                        <TableRow
                                            key={i.id}
                                            onClick={() => navigate(`/incidencias/${i.id}/detalle`)}
                                            sx={{
                                                cursor: 'pointer',
                                                '& td': {
                                                    borderBottom: '1px solid #1e293b',
                                                    py: 2,
                                                },
                                                '&:hover': { bgcolor: 'rgba(16,185,129,0.06)' }, // Hover verdoso
                                                '&:last-child td': { borderBottom: 0 },
                                            }}
                                        >
                                            <TableCell sx={{
                                                color: '#94a3b8', fontSize: '0.8rem',
                                                fontFamily: 'monospace', pl: 3.5,
                                            }}>
                                                #INC-{String(i.id).padStart(4, '0')}
                                            </TableCell>
                                            <TableCell sx={{
                                                color: '#fff', fontSize: '0.85rem',
                                                fontWeight: 500, whiteSpace: 'nowrap',
                                                maxWidth: 200, overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}>
                                                {i.titulo}
                                            </TableCell>
                                            <TableCell sx={{
                                                color: '#cbd5e1', fontSize: '0.8rem',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {i.afiliado
                                                    ? `${i.afiliado.apellidos}, ${i.afiliado.nombre}`
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <ChipPrioridad prioridad={i.prioridad} />
                                            </TableCell>
                                            <TableCell sx={{
                                                color: '#10b981', fontSize: '0.8rem',
                                                whiteSpace: 'nowrap', pr: 3.5, fontWeight: 500
                                            }}>
                                                {new Date(i.fecha_cierre || i.created_at).toLocaleDateString('es-ES')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Box>
        </Box>
    );
}

function TarjetaKPI({ kpi, index }) {
    return (
        <Paper sx={{
            ...cardStyle,
            position: 'relative',
            overflow: 'hidden',
            minHeight: 260,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 20px 50px ${kpi.color}20`,
            },
        }}>

            <Box sx={{
                position: 'absolute',
                top: -50, right: -50,
                width: 150, height: 150,
                borderRadius: '50%',
                bgcolor: kpi.color,
                opacity: 0.12,
                filter: 'blur(40px)',
            }} />


            <Box sx={{
                p: 3.5,
                position: 'relative',
                zIndex: 2,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
            }}>

                <Box sx={{
                    width: 56, height: 56,
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${kpi.color} 0%, ${kpi.color}cc 100%)`,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 20px ${kpi.color}50`,
                    mb: 3,
                }}>
                    {kpi.icon}
                </Box>


                <Typography sx={{
                    color: '#94a3b8',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    mb: 0.8,
                    letterSpacing: '0.01em',
                }}>
                    {kpi.title}
                </Typography>
                <Typography sx={{
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '2.2rem',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                }}>
                    {kpi.value}
                </Typography>
            </Box>


            <Box sx={{
                height: 80,
                width: '100%',
                position: 'absolute',
                bottom: 0, left: 0,
                zIndex: 1,
                opacity: 0.85,
            }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={kpi.sparkline}>
                        <defs>
                            <linearGradient id={`spark${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={kpi.color} stopOpacity={0.5} />
                                <stop offset="95%" stopColor={kpi.color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="v"
                            stroke={kpi.color}
                            strokeWidth={2.5}
                            fill={`url(#spark${index})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}



function ChipPrioridad({ prioridad }) {
    const config = {
        alta:  { label: 'ALTA',  bg: '#ef444425', color: '#ef4444' },
        media: { label: 'MEDIA', bg: '#eab30825', color: '#eab308' },
        baja:  { label: 'BAJA',  bg: '#10b98125', color: '#10b981' },
    }[prioridad] ?? { label: prioridad, bg: '#64748b25', color: '#94a3b8' };

    return (
        <Chip label={config.label} size="small" sx={{
            bgcolor: config.bg, color: config.color,
            fontWeight: 700, borderRadius: 1.2,
            fontSize: '0.68rem', height: 22, px: 0.5,
        }} />
    );
}

function ChipEstado({ estado }) {
    const config = {
        pendiente:  { label: 'PENDIENTE',  bg: '#f59e0b25', color: '#f59e0b' },
        en_proceso: { label: 'EN PROCESO', bg: '#5b8def25', color: '#5b8def' },
        resuelta:   { label: 'RESUELTA',   bg: '#10b98125', color: '#10b981' },
    }[estado] ?? { label: estado, bg: '#64748b25', color: '#94a3b8' };

    return (
        <Chip label={config.label} size="small" sx={{
            bgcolor: config.bg, color: config.color,
            fontWeight: 700, borderRadius: 1.2,
            fontSize: '0.68rem', height: 22, px: 0.5,
        }} />
    );
}

function MensajeVacio({ texto }) {
    return (
        <Box sx={{
            flex: 1, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
        }}>
            <Typography sx={{
                color: '#64748b', fontSize: '0.85rem',
                textAlign: 'center',
            }}>
                {texto}
            </Typography>
        </Box>
    );
}