
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, TextField, MenuItem,
  Stack, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Tooltip,
  CircularProgress, Alert, TablePagination, Link as MuiLink,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useNotificacion } from '../context/NotificacionContext';
import { usePermisos } from '../lib/usePermisos';
import DialogoConfirmacion from '../components/DialogoConfirmacion';


const cardStyle = {
  background: 'linear-gradient(180deg, #131c33 0%, #0c1428 100%)',
  borderRadius: 4,
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
};

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
};


const tableHeadStyle = { color: '#94a3b8', borderBottom: '1px solid #1e293b', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.2)' };
const tableCellStyle = { color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' };

export default function Afiliados() {
  const navigate = useNavigate();
  const { exito, error: notificarError } = useNotificacion();
  const { puedeGestionarAfiliados } = usePermisos();

  const [afiliados, setAfiliados]           = useState([]);
  const [sectores, setSectores]             = useState([]);
  const [busqueda, setBusqueda]             = useState('');
  const [filtroSector, setFiltroSector]     = useState('todos');
  const [filtroEstado, setFiltroEstado]     = useState('todos');
  const [pagina, setPagina]                 = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [cargando, setCargando]             = useState(true);
  const [error, setError]                   = useState(null);

  const [aBorrar, setABorrar]   = useState(null);
  const [borrando, setBorrando] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    setCargando(true);
    setError(null);

    const [afilRes, sectRes] = await Promise.all([
      supabase
          .from('afiliados')
          .select('*, sector:sectores(id, nombre)')
          .order('apellidos', { ascending: true }),
      supabase.from('sectores').select('*').order('nombre'),
    ]);

    if (afilRes.error) {
      setError(afilRes.error.message);
    } else {
      setAfiliados(afilRes.data ?? []);
    }
    if (!sectRes.error) setSectores(sectRes.data ?? []);

    setCargando(false);
  }

  const afiliadosFiltrados = useMemo(() => {
    return afiliados.filter((a) => {
      if (busqueda) {
        const t = busqueda.toLowerCase();
        const coincide =
            a.nombre.toLowerCase().includes(t) ||
            a.apellidos.toLowerCase().includes(t) ||
            a.dni.toLowerCase().includes(t) ||
            (a.email?.toLowerCase().includes(t) ?? false);
        if (!coincide) return false;
      }
      if (filtroSector !== 'todos' && a.sector_id !== Number(filtroSector)) return false;
      if (filtroEstado === 'activos'   && !a.activo) return false;
      if (filtroEstado === 'inactivos' &&  a.activo) return false;
      return true;
    });
  }, [afiliados, busqueda, filtroSector, filtroEstado]);

  const enPagina = afiliadosFiltrados.slice(
      pagina * filasPorPagina,
      pagina * filasPorPagina + filasPorPagina,
  );

  async function confirmarBorrado() {
    if (!aBorrar) return;
    setBorrando(true);
    const { error } = await supabase
        .from('afiliados')
        .delete()
        .eq('id', aBorrar.id);

    setBorrando(false);
    setABorrar(null);

    if (error) {
      notificarError('No se pudo eliminar: ' + error.message);
    } else {
      setAfiliados((prev) => prev.filter((a) => a.id !== aBorrar.id));
      exito('Afiliado eliminado correctamente');
    }
  }

  return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#080d1c', pt: 4, pb: 8 }}>
        <Container maxWidth="xl">


          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#ffffff' }}>Afiliados</Typography>
              <Typography sx={{ color: '#94a3b8', mt: 0.5 }}>Gestión de Afiliados</Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              {puedeGestionarAfiliados && (
                  <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/afiliados/nuevo')}
                  >
                    Nuevo afiliado
                  </Button>
              )}
            </Stack>
          </Box>


          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 5 }} alignItems="stretch">
            <Paper sx={{ ...cardStyle, borderRadius: '50px', p: 1, display: 'flex', alignItems: 'center', px: 2, flex: 1 }}>
              <SearchIcon sx={{ color: '#64748b', ml: 1, mr: 1 }} />
              <TextField
                  fullWidth
                  placeholder="Buscar por título o nombre del afiliado..."
                  variant="standard"
                  value={busqueda}
                  onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}

                  inputProps={{
                    style: {
                      color: '#ffffff',
                      WebkitTextFillColor: '#ffffff',
                    }
                  }}

                  sx={{
                    '& .MuiInput-root': {
                      color: '#ffffff',
                    },
                    '& .MuiInput-input': {
                      color: '#ffffff !important',
                      WebkitTextFillColor: '#ffffff !important',
                      caretColor: '#ffffff' // Esto asegura que el cursor sea blanco
                    },
                    '& .MuiInput-input::placeholder': {
                      color: '#94a3b8 !important',
                      opacity: 1
                    }
                  }}
              />
            </Paper>


            <TextField select size="small" label="Sector"
                       value={filtroSector}
                       onChange={(e) => { setFiltroSector(e.target.value); setPagina(0); }}
                       sx={{ minWidth: 180, ...inputStyle, justifyContent: 'center' }}
            >
              <MenuItem value="todos">Todos los sectores</MenuItem>
              {sectores.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Estado"
                       value={filtroEstado}
                       onChange={(e) => { setFiltroEstado(e.target.value); setPagina(0); }}
                       sx={{ minWidth: 140, ...inputStyle, justifyContent: 'center' }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="activos">Activos</MenuItem>
              <MenuItem value="inactivos">Inactivos</MenuItem>
            </TextField>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

          {/* TABLA DE RESULTADOS */}
          <Paper sx={{ ...cardStyle, p: 0, overflow: 'hidden', mt: 5 }}>
            {cargando ? (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <CircularProgress />
                </Box>
            ) : afiliadosFiltrados.length === 0 ? (
                <Box sx={{ p: 10, textAlign: 'center' }}>
                  <PersonOffIcon sx={{ fontSize: 60, color: '#475569', mb: 2 }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                    No hay afiliados que coincidan con los filtros.
                  </Typography>
                </Box>
            ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={tableHeadStyle}>DNI</TableCell>
                          <TableCell sx={tableHeadStyle}>Nombre</TableCell>
                          <TableCell sx={tableHeadStyle}>Sector</TableCell>
                          <TableCell sx={tableHeadStyle}>Empresa</TableCell>
                          <TableCell sx={tableHeadStyle}>Email</TableCell>
                          <TableCell sx={tableHeadStyle}>Estado</TableCell>
                          {puedeGestionarAfiliados && (
                              <TableCell align="right" sx={tableHeadStyle}>Acciones</TableCell>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {enPagina.map((a) => (
                            <TableRow
                                key={a.id}
                                sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, transition: 'background-color 0.2s' }}
                            >
                              <TableCell sx={{ ...tableCellStyle, color: '#94a3b8', fontFamily: 'monospace' }}>
                                {a.dni}
                              </TableCell>
                              <TableCell sx={tableCellStyle}>
                                <MuiLink
                                    component="button"
                                    underline="none"
                                    onClick={() => navigate(`/afiliados/${a.id}/detalle`)}
                                    sx={{
                                      textAlign: 'left',
                                      color: '#fff',
                                      fontWeight: 600,
                                      transition: 'color 0.2s',
                                      '&:hover': { color: '#3b82f6' }
                                    }}
                                >
                                  {a.apellidos}, {a.nombre}
                                </MuiLink>
                              </TableCell>
                              <TableCell sx={tableCellStyle}>
                                <Chip
                                    label={a.sector?.nombre ?? '—'}
                                    size="small"
                                    variant="outlined"
                                    sx={{ color: '#94a3b8', borderColor: '#475569' }}
                                />
                              </TableCell>
                              <TableCell sx={{ ...tableCellStyle, color: '#94a3b8' }}>{a.empresa || '—'}</TableCell>
                              <TableCell sx={{ ...tableCellStyle, color: '#94a3b8' }}>{a.email || '—'}</TableCell>
                              <TableCell sx={tableCellStyle}>
                                {a.activo ? (
                                    <Chip label="Activo" size="small" sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.2)' }} />
                                ) : (
                                    <Chip label="Inactivo" size="small" sx={{ bgcolor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.2)' }} />
                                )}
                              </TableCell>

                              {puedeGestionarAfiliados && (
                                  <TableCell align="right" sx={tableCellStyle}>
                                    <Tooltip title="Editar">
                                      <IconButton size="small" onClick={() => navigate(`/afiliados/${a.id}`)} sx={{ color: '#94a3b8', '&:hover': { color: '#fff' } }}>
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar">
                                      <IconButton size="small" color="error" onClick={() => setABorrar(a)}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                              )}
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                      component="div"
                      count={afiliadosFiltrados.length}
                      page={pagina}
                      onPageChange={(_e, p) => setPagina(p)}
                      rowsPerPage={filasPorPagina}
                      onRowsPerPageChange={(e) => {
                        setFilasPorPagina(Number(e.target.value));
                        setPagina(0);
                      }}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      labelRowsPerPage="Filas por página:"
                      sx={{
                        color: '#94a3b8',
                        borderTop: '1px solid #1e293b',
                        '.MuiTablePagination-selectIcon': { color: '#94a3b8' }
                      }}
                  />
                </>
            )}
          </Paper>

          <DialogoConfirmacion
              abierto={!!aBorrar}
              titulo="Eliminar afiliado"
              mensaje={
                aBorrar
                    ? `¿Seguro que quieres eliminar a ${aBorrar.nombre} ${aBorrar.apellidos}? Esta acción también eliminará todas sus incidencias y no se puede deshacer.`
                    : ''
              }
              textoConfirmar="Eliminar"
              onConfirmar={confirmarBorrado}
              onCancelar={() => setABorrar(null)}
              cargando={borrando}
          />
        </Container>
      </Box>
  );
}