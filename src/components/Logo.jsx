// src/components/Logo.jsx
// -------------------------------------------------------
// Componente reutilizable para mostrar el logo del Portal
// Sindical. Muestra el SVG + el nombre, con tres tamaños:
// 'sm' (compacto), 'md' (por defecto) y 'lg' (grande).
//
// Uso:
//   <Logo />
//   <Logo size="lg" mostrarTexto={false} />
// -------------------------------------------------------

import { Box, Stack, Typography } from '@mui/material';

const TAMANOS = {
  sm: { logo: 28, titulo: '0.95rem', subtitulo: '0.65rem' },
  md: { logo: 36, titulo: '1.1rem',  subtitulo: '0.7rem' },
  lg: { logo: 56, titulo: '1.6rem',  subtitulo: '0.85rem' },
};

export default function Logo({
                               size = 'md',
                               mostrarTexto = true,
                               color = 'primary.main',
                               centrado = false,
                             }) {
  const dim = TAMANOS[size];

  return (
      <Stack
          direction={centrado ? 'column' : 'row'}
          spacing={centrado ? 1 : 1.5}
          alignItems="center"
          justifyContent={centrado ? 'center' : 'flex-start'}
      >
        <Box
            component="img"
            src="/logo.svg"
            alt="Portal Sindical"
            sx={{
              width: dim.logo,
              height: dim.logo,
              flexShrink: 0,
            }}
        />

        {mostrarTexto && (
            <Box sx={{ textAlign: centrado ? 'center' : 'left' }}>
              <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color,
                    fontSize: dim.titulo,
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                  }}
              >
                Portal Sindical
              </Typography>
              <Typography
                  variant="caption"
                  sx={{
                    // Gris claro: legible sobre fondo oscuro y sigue
                    // siendo discreto sobre fondo claro.
                    color: '#94a3b8',
                    fontSize: dim.subtitulo,
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
              >
                Gestión de afiliados
              </Typography>
            </Box>
        )}
      </Stack>
  );
}