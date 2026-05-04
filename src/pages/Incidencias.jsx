// src/pages/Incidencias.jsx
// -------------------------------------------------------
// Listado de incidencias con filtros, cambio rápido de
// estado, exportación a PDF y enlaces al detalle.
// -------------------------------------------------------

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, TextField, MenuItem,
  Stack, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Tooltip, InputAdornment,
  CircularProgress, Alert, TablePagination, Select,
  Link as MuiLink,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AssignmentLate as AssignmentLateIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { exportarPDF } from '../lib/exportarPDF';
import { useNotificacion } from '../context/NotificacionContext';
import DialogoConfirmacion from '../components/DialogoConfirmacion';

const ESTADOS = {
  pendiente:  { label: 'Pendiente',  color: 'warning' },
  en_proceso: { label: 'En proceso', color: 'info' },
  resuelta:   { label: 'Resuelta',   color: 'success' },
};

const PRIORIDADES = {
  baja:  { label: 'Baja',  color: 'default' },
  media: { label: 'Media', color: 'primary' },
  alta:  { label: 'Alta',  color: 'error' },
};

export default function Incidencias() {
  const navigate = useNavigate();
  const { exito, error: notificarError } = useNotificacion();

  const [incidencias, setIncidencias] = useState([]);
  const [sectores, setSectores]       = useState([]);
  const [busqueda, setBusqueda]       = useState('');
  const [filtroEstado, setFiltroEstado]       = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');
  const [filtroSector, setFiltroSector]       = useState('todos');
  const [pagina, setPagina]                   = useState(0);
  const [filasPorPagina, setFilasPorPagina]   = useState(10);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState(null);

  const [aBorrar, setABorrar]   = useState(null);
  const [borrando, setBorrando] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    setCargando(true);
    setError(null);

    const [incRes, sectRes] = await Promise.all([
      supabase
        .from('incidencias')
        .select(`
          *,
          afiliado:afiliados(
            id, nombre, apellidos, dni,
            sector:sectores(id, nombre)
          )
        `)
        .order('created_at', { ascending: false }),
      supabase.from('sectores').select('*').order('nombre'),
    ]);

    if (incRes.error) {
      setError(incRes.error.message);
    } else {
      setIncidencias(incRes.data ?? []);
    }
    if (!sectRes.error) setSectores(sectRes.data ?? []);

    setCargando(false);
  }

  const filtradas = useMemo(() => {
    return incidencias.filter((i) => {
      if (busqueda) {
        const t = busqueda.toLowerCase();
        const coincide =
          i.titulo.toLowerCase().includes(t) ||
          i.descripcion.toLowerCase().includes(t) ||
          (i.afiliado?.nombre + ' ' + i.afiliado?.apellidos).toLowerCase().includes(t) ||
          (i.afiliado?.dni?.toLowerCase().includes(t) ?? false);
        if (!coincide) return false;
      }
      if (filtroEstado    !== 'todos' && i.estado    !== filtroEstado)    return false;
      if (filtroPrioridad !== 'todos' && i.prioridad !== filtroPrioridad) return false;
      if (filtroSector !== 'todos' &&
          i.afiliado?.sector?.id !== Number(filtroSector)) return false;
      return true;
    });
  }, [incidencias, busqueda, filtroEstado, filtroPrioridad, filtroSector]);

  const enPagina = filtradas.slice(
    pagina * filasPorPagina,
    pagina * filasPorPagina + filasPorPagina,
  );

  async function cambiarEstado(incidencia, nuevoEstado) {
    const datos = {
      estado: nuevoEstado,
      fecha_cierre: nuevoEstado === 'resuelta' ? new Date().toISOString() : null,
    };
    const { error } = await supabase
      .from('incidencias')
      .update(datos)
      .eq('id', incidencia.id);

    if (error) {
      notificarError('No se pudo actualizar el estado: ' + error.message);
    } else {
      setIncidencias((prev) =>
        prev.map((i) => (i.id === incidencia.id ? { ...i, ...datos } : i)),
      );
      exito(`Estado actualizado a "${ESTADOS[nuevoEstado].label}"`);
    }
  }

  async function confirmarBorrado() {
    if (!aBorrar) return;
    setBorrando(true);
    const { error } = await supabase
      .from('incidencias')
      .delete()
      .eq('id', aBorrar.id);

    setBorrando(false);
    setABorrar(null);

    if (error) {
      notificarError('No se pudo eliminar: ' + error.message);
    } else {
      setIncidencias((prev) => prev.filter((i) => i.id !== aBorrar.id));
      exito('Incidencia eliminada correctamente');
    }
  }

  function handleExportarPDF() {
    try {
      const fecha = new Date().toISOString().slice(0, 10);
      const pendientes = filtradas.filter((i) => i.estado === 'pendiente').length;

      exportarPDF({
        titulo: 'Listado de incidencias',
        subtitulo: `${filtradas.length} incidencia(s) · ${pendientes} pendientes`,
        filas: filtradas,
        columnas: [
          { clave: 'titulo',                etiqueta: 'Título',    ancho: 50 },
          { clave: 'afiliado',              etiqueta: 'Afiliado',
            formato: (a) => a ? `${a.apellidos}, ${a.nombre}` : '',
            ancho: 45 },
          { clave: 'afiliado.sector.nombre', etiqueta: 'Sector',   ancho: 25 },
          { clave: 'estado',                etiqueta: 'Estado',
            formato: (v) => ESTADOS[v]?.label ?? v,
            ancho: 25 },
          { clave: 'prioridad',             etiqueta: 'Prioridad',
            formato: (v) => PRIORIDADES[v]?.label ?? v,
            ancho: 22 },
          { clave: 'fecha_apertura',        etiqueta: 'Apertura',
            formato: (v) => v ? new Date(v).toLocaleDateString('es-ES') : '',
            ancho: 25 },
          { clave: 'fecha_cierre',          etiqueta: 'Cierre',
            formato: (v) => v ? new Date(v).toLocaleDateString('es-ES') : '—',
            ancho: 25 },
        ],
        nombreArchivo: `incidencias-${fecha}.pdf`,
      });

      exito('PDF generado correctamente');
    } catch (e) {
      notificarError('Error generando el PDF: ' + e.message);
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={600}>Incidencias</Typography>
          <Typography variant="body2" color="text.secondary">
            {filtradas.length} resultado(s) ·{' '}
            {incidencias.filter((i) => i.estado === 'pendiente').length} pendientes
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Descargar listado en PDF">
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleExportarPDF}
              disabled={filtradas.length === 0}
            >
              Exportar PDF
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/incidencias/nuevo')}
            size="large"
          >
            Nueva incidencia
          </Button>
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            placeholder="Buscar por título, descripción o afiliado..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField select size="small" label="Estado"
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setPagina(0); }}
            sx={{ minWidth: 140 }}>
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="pendiente">Pendiente</MenuItem>
            <MenuItem value="en_proceso">En proceso</MenuItem>
            <MenuItem value="resuelta">Resuelta</MenuItem>
          </TextField>
          <TextField select size="small" label="Prioridad"
            value={filtroPrioridad}
            onChange={(e) => { setFiltroPrioridad(e.target.value); setPagina(0); }}
            sx={{ minWidth: 140 }}>
            <MenuItem value="todos">Todas</MenuItem>
            <MenuItem value="baja">Baja</MenuItem>
            <MenuItem value="media">Media</MenuItem>
            <MenuItem value="alta">Alta</MenuItem>
          </TextField>
          <TextField select size="small" label="Sector"
            value={filtroSector}
            onChange={(e) => { setFiltroSector(e.target.value); setPagina(0); }}
            sx={{ minWidth: 160 }}>
            <MenuItem value="todos">Todos</MenuItem>
            {sectores.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        {cargando ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : filtradas.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <AssignmentLateIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography color="text.secondary" mt={1}>
              No hay incidencias que coincidan con los filtros.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell><strong>Título</strong></TableCell>
                    <TableCell><strong>Afiliado</strong></TableCell>
                    <TableCell><strong>Sector</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Prioridad</strong></TableCell>
                    <TableCell><strong>Apertura</strong></TableCell>
                    <TableCell align="right"><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enPagina.map((i) => (
                    <TableRow key={i.id} hover>
                      <TableCell>
                        <MuiLink
                          component="button"
                          underline="hover"
                          onClick={() => navigate(`/incidencias/${i.id}/detalle`)}
                          sx={{ textAlign: 'left', color: 'primary.main', fontWeight: 500 }}
                        >
                          {i.titulo}
                        </MuiLink>
                      </TableCell>
                      <TableCell>
                        {i.afiliado ? (
                          <MuiLink
                            component="button"
                            underline="hover"
                            onClick={() => navigate(`/afiliados/${i.afiliado.id}/detalle`)}
                            sx={{ textAlign: 'left' }}
                          >
                            {i.afiliado.apellidos}, {i.afiliado.nombre}
                          </MuiLink>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={i.afiliado?.sector?.nombre ?? '—'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={i.estado}
                          onChange={(e) => cambiarEstado(i, e.target.value)}
                          size="small"
                          sx={{ minWidth: 130, '& .MuiSelect-select': { py: 0.5 } }}
                        >
                          {Object.entries(ESTADOS).map(([k, v]) => (
                            <MenuItem key={k} value={k}>{v.label}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={PRIORIDADES[i.prioridad].label}
                          size="small"
                          color={PRIORIDADES[i.prioridad].color}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(i.fecha_apertura).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton size="small"
                            onClick={() => navigate(`/incidencias/${i.id}`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" color="error"
                            onClick={() => setABorrar(i)}>
                            <DeleteIcon fontSize="small" />
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
              count={filtradas.length}
              page={pagina}
              onPageChange={(_e, p) => setPagina(p)}
              rowsPerPage={filasPorPagina}
              onRowsPerPageChange={(e) => {
                setFilasPorPagina(Number(e.target.value));
                setPagina(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Filas por página:"
            />
          </>
        )}
      </Paper>

      <DialogoConfirmacion
        abierto={!!aBorrar}
        titulo="Eliminar incidencia"
        mensaje={
          aBorrar
            ? `¿Seguro que quieres eliminar la incidencia "${aBorrar.titulo}"? Esta acción no se puede deshacer.`
            : ''
        }
        textoConfirmar="Eliminar"
        onConfirmar={confirmarBorrado}
        onCancelar={() => setABorrar(null)}
        cargando={borrando}
      />
    </Container>
  );
}
