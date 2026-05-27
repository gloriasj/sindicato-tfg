
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
  AssignmentLate as AssignmentLateIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';


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

const ESTADOS = {
  pendiente:  { label: 'Pendiente',  color: '#f59e0b', bgcolor: 'rgba(245, 158, 11, 0.1)' },
  en_proceso: { label: 'En proceso', color: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' },
  resuelta:   { label: 'Resuelta',   color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.1)' },
};

const PRIORIDADES = {
  baja:  { label: 'Baja',  color: '#94a3b8', bgcolor: 'rgba(148, 163, 184, 0.1)' },
  media: { label: 'Media', color: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' },
  alta:  { label: 'Alta',  color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' },
};

export default function Incidencias() {
  const navigate = useNavigate();

  const [incidencias, setIncidencias]       = useState([]);
  const [busqueda, setBusqueda]             = useState('');
  const [filtroEstado, setFiltroEstado]     = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');
  const [pagina, setPagina]                 = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [cargando, setCargando]             = useState(true);
  const [error, setError]                   = useState(null);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    setCargando(true);
    setError(null);

    const { data, error: errInc } = await supabase
        .from('incidencias')
        .select('*, afiliado:afiliados(nombre, apellidos)')
        .order('created_at', { ascending: false });

    if (errInc) {
      setError(errInc.message);
    } else {
      setIncidencias(data ?? []);
    }
    setCargando(false);
  }

  const incidenciasFiltradas = useMemo(() => {
    return incidencias.filter((i) => {
      if (busqueda) {
        const t = busqueda.toLowerCase();
        const nombreCompletoAfiliado = i.afiliado
            ? `${i.afiliado.nombre} ${i.afiliado.apellidos}`.toLowerCase()
            : '';

        const coincide =
            i.titulo.toLowerCase().includes(t) ||
            nombreCompletoAfiliado.includes(t);
        if (!coincide) return false;
      }
      if (filtroEstado !== 'todos' && i.estado !== filtroEstado) return false;
      if (filtroPrioridad !== 'todos' && i.prioridad !== filtroPrioridad) return false;
      return true;
    });
  }, [incidencias, busqueda, filtroEstado, filtroPrioridad]);

  const enPagina = incidenciasFiltradas.slice(
      pagina * filasPorPagina,
      pagina * filasPorPagina + filasPorPagina,
  );

  return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#080d1c', pt: 4, pb: 8 }}>
        <Container maxWidth="xl">

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#ffffff' }}>Incidencias</Typography>
              <Typography sx={{ color: '#94a3b8', mt: 0.5 }}>Gestión de incidencias y consultas</Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/incidencias/nuevo')}
              >
                Nueva Incidencia
              </Button>
            </Stack>
          </Box>


          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 5 }} alignItems="stretch">
            {/* BARRA DE BUSCAR: Corregida para que el texto sea blanco */}
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
                      caretColor: '#ffffff'
                    },
                    '& .MuiInput-input::placeholder': {
                      color: '#94a3b8 !important',
                      opacity: 1
                    }
                  }}
              />
            </Paper>

            <TextField select size="small" label="Estado"
                       value={filtroEstado}
                       onChange={(e) => { setFiltroEstado(e.target.value); setPagina(0); }}
                       sx={{ minWidth: 160, ...inputStyle, justifyContent: 'center' }}
            >
              <MenuItem value="todos">Todos los estados</MenuItem>
              <MenuItem value="pendiente">Pendientes</MenuItem>
              <MenuItem value="en_proceso">En proceso</MenuItem>
              <MenuItem value="resuelta">Resueltas</MenuItem>
            </TextField>

            <TextField select size="small" label="Prioridad"
                       value={filtroPrioridad}
                       onChange={(e) => { setFiltroPrioridad(e.target.value); setPagina(0); }}
                       sx={{ minWidth: 160, ...inputStyle, justifyContent: 'center' }}
            >
              <MenuItem value="todos">Todas las prioridades</MenuItem>
              <MenuItem value="baja">Baja</MenuItem>
              <MenuItem value="media">Media</MenuItem>
              <MenuItem value="alta">Alta</MenuItem>
            </TextField>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

          <Box sx={{ mt: 5 }}>
            <Paper sx={{ ...cardStyle, p: 0, overflow: 'hidden' }}>
              {cargando ? (
                  <Box sx={{ p: 6, textAlign: 'center' }}>
                    <CircularProgress />
                  </Box>
              ) : incidenciasFiltradas.length === 0 ? (
                  <Box sx={{ p: 10, textAlign: 'center' }}>
                    <AssignmentLateIcon sx={{ fontSize: 60, color: '#475569', mb: 2 }} />
                    <Typography sx={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                      No hay incidencias que coincidan con la consulta.
                    </Typography>
                  </Box>
              ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={tableHeadStyle}>Título</TableCell>
                            <TableCell sx={tableHeadStyle}>Afiliado</TableCell>
                            <TableCell sx={tableHeadStyle}>Estado</TableCell>
                            <TableCell sx={tableHeadStyle}>Prioridad</TableCell>
                            <TableCell sx={tableHeadStyle}>Apertura</TableCell>
                            <TableCell align="right" sx={tableHeadStyle}>Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {enPagina.map((i) => (
                              <TableRow
                                  key={i.id}
                                  sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, transition: 'background-color 0.2s' }}
                              >
                                <TableCell sx={tableCellStyle}>
                                  <MuiLink
                                      component="button"
                                      underline="none"

                                      onClick={() => navigate(`/incidencias/${i.id}`)}
                                      sx={{
                                        textAlign: 'left',
                                        color: '#fff',
                                        fontWeight: 600,
                                        transition: 'color 0.2s',
                                        '&:hover': { color: '#3b82f6' }
                                      }}
                                  >
                                    {i.titulo}
                                  </MuiLink>
                                </TableCell>

                                <TableCell sx={{ ...tableCellStyle, color: '#94a3b8' }}>
                                  {i.afiliado ? `${i.afiliado.apellidos}, ${i.afiliado.nombre}` : '—'}
                                </TableCell>

                                <TableCell sx={tableCellStyle}>
                                  <Chip
                                      label={ESTADOS[i.estado].label}
                                      size="small"
                                      sx={{ color: ESTADOS[i.estado].color, bgcolor: ESTADOS[i.estado].bgcolor, border: `1px solid ${ESTADOS[i.estado].bgcolor}` }}
                                  />
                                </TableCell>

                                <TableCell sx={tableCellStyle}>
                                  <Chip
                                      label={PRIORIDADES[i.prioridad].label}
                                      size="small"
                                      sx={{ color: PRIORIDADES[i.prioridad].color, bgcolor: PRIORIDADES[i.prioridad].bgcolor, border: `1px solid ${PRIORIDADES[i.prioridad].bgcolor}` }}
                                  />
                                </TableCell>

                                <TableCell sx={{ ...tableCellStyle, color: '#94a3b8' }}>
                                  {new Date(i.fecha_apertura).toLocaleDateString('es-ES')}
                                </TableCell>

                                <TableCell align="right" sx={tableCellStyle}>
                                  <Tooltip title="Editar">
                                    <IconButton
                                        size="small"

                                        onClick={() => navigate(`/incidencias/${i.id}/editar`)}
                                        sx={{ color: '#94a3b8', '&:hover': { color: '#3b82f6' } }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={incidenciasFiltradas.length}
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
          </Box>
        </Container>
      </Box>
  );
}