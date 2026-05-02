// src/pages/Sectores.jsx
// -------------------------------------------------------
// Listado de sectores profesionales. Solo lectura.
// Los sectores se gestionan desde Supabase directamente
// porque son un catálogo cerrado.
// -------------------------------------------------------

import { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Paper, List, ListItem,
  ListItemText, ListItemIcon, Chip, CircularProgress,
} from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';

export default function Sectores() {
  const [sectores, setSectores] = useState([]);
  const [conteos, setConteos]   = useState({}); // { sectorNombre: total }
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);

    const [sectRes, contRes] = await Promise.all([
      supabase.from('sectores').select('*').order('nombre'),
      supabase.from('v_afiliados_por_sector').select('*'),
    ]);

    if (!sectRes.error) setSectores(sectRes.data ?? []);
    if (!contRes.error) {
      const map = {};
      contRes.data?.forEach((r) => { map[r.sector] = r.total; });
      setConteos(map);
    }

    setCargando(false);
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Sectores
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Catálogo de sectores profesionales del sindicato
      </Typography>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        {cargando ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {sectores.map((s, i) => (
              <ListItem
                key={s.id}
                divider={i < sectores.length - 1}
                secondaryAction={
                  <Chip
                    label={`${conteos[s.nombre] ?? 0} afiliado(s)`}
                    size="small"
                    variant="outlined"
                  />
                }
              >
                <ListItemIcon>
                  <CategoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={s.nombre}
                  secondary={s.descripcion}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}
