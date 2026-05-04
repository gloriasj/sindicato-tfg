// src/pages/Afiliados.jsx
// -------------------------------------------------------
// Listado de afiliados con búsqueda, filtros, paginación,
// exportación a CSV y enlace al detalle al hacer clic
// sobre el nombre de cada afiliado.
// -------------------------------------------------------

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, TextField, MenuItem,
  Stack, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Tooltip, InputAdornment,
  CircularProgress, Alert, TablePagination, Link as MuiLink,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonOff as PersonOffIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { exportarCSV } from '../lib/exportarCSV';
import DialogoConfirmacion from '../components/DialogoConfirmacion';

export default function Afiliados() {
  const navigate = useNavigate();

  const [afiliados, setAfiliados]   = useState([]);
  const [sectores, setSectores]     = useState([]);
  const [busqueda, setBusqueda]     = useState('');
  const [filtroSector, setFiltroSector]     = useState('todos');
  const [filtroEstado, setFiltroEstado]     = useState('todos');
  const [pagina, setPagina]                 = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState(null);

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

    if (error) {
      setError('No se pudo eliminar: ' + error.message);
    } else {
      setAfiliados((prev) => prev.filter((a) => a.id !== aBorrar.id));
    }
    setBorrando(false);
    setABorrar(null);
  }

  // Descarga el CSV con los afiliados actualmente filtrados
  function handleExportarCSV() {
    const fecha = new Date().toISOString().slice(0, 10);
    exportarCSV(
      `afiliados-${fecha}.csv`,
      afiliadosFiltrados,
      [
        { clave: 'dni',           etiqueta: 'DNI' },
        { clave: 'nombre',        etiqueta: 'Nombre' },
        { clave: 'apellidos',     etiqueta: 'Apellidos' },
        { clave: 'email',         etiqueta: 'Email' },
        { clave: 'telefono',      etiqueta: 'Teléfono' },
        { clave: 'sector.nombre', etiqueta: 'Sector' },
        { clave: 'empresa',       etiqueta: 'Empresa' },
        { clave: 'fecha_alta',    etiqueta: 'Fecha de alta' },
        { clave: 'activo',        etiqueta: 'Estado',
          formato: (v) => v ? 'Activo' : 'Inactivo' },
      ],
    );
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
          <Typography variant="h4" fontWeight={600}>
            Afiliados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {afiliadosFiltrados.length} resultado(s) ·{' '}
            {afiliados.filter((a) => a.activo).length} activos en total
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Descargar listado en CSV">
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportarCSV}
              disabled={afiliadosFiltrados.length === 0}
            >
              Exportar CSV
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/afiliados/nuevo')}
            size="large"
          >
            Nuevo afiliado
          </Button>
        </Stack>
      </Stack>

      {/* Filtros */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            placeholder="Buscar por nombre, DNI o email..."
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
          <TextField
            select size="small" label="Sector"
            value={filtroSector}
            onChange={(e) => { setFiltroSector(e.target.value); setPagina(0); }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="todos">Todos los sectores</MenuItem>
            {sectores.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
            ))}
          </TextField>
          <TextField
            select size="small" label="Estado"
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setPagina(0); }}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="activos">Activos</MenuItem>
            <MenuItem value="inactivos">Inactivos</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tabla */}
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        {cargando ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : afiliadosFiltrados.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <PersonOffIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography color="text.secondary" mt={1}>
              No hay afiliados que coincidan con los filtros.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell><strong>DNI</strong></TableCell>
                    <TableCell><strong>Nombre</strong></TableCell>
                    <TableCell><strong>Sector</strong></TableCell>
                    <TableCell><strong>Empresa</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell align="right"><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enPagina.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {a.dni}
                      </TableCell>
                      <TableCell>
                        {/* El nombre es ahora un enlace al detalle */}
                        <MuiLink
                          component="button"
                          underline="hover"
                          onClick={() => navigate(`/afiliados/${a.id}/detalle`)}
                          sx={{ textAlign: 'left', color: 'primary.main', fontWeight: 500 }}
                        >
                          {a.apellidos}, {a.nombre}
                        </MuiLink>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={a.sector?.nombre ?? '—'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{a.empresa || '—'}</TableCell>
                      <TableCell>{a.email || '—'}</TableCell>
                      <TableCell>
                        {a.activo ? (
                          <Chip label="Activo" size="small" color="success" />
                        ) : (
                          <Chip label="Inactivo" size="small" color="default" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton size="small"
                            onClick={() => navigate(`/afiliados/${a.id}`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" color="error"
                            onClick={() => setABorrar(a)}>
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
  );
}
