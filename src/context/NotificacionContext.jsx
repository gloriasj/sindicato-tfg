
import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificacionContext = createContext(null);

export function NotificacionProvider({ children }) {
  const [estado, setEstado] = useState({
    abierto: false,
    mensaje: '',
    severidad: 'info',
  });

  const mostrar = useCallback((mensaje, severidad = 'info') => {
    setEstado({ abierto: true, mensaje, severidad });
  }, []);

  const cerrar = useCallback((_e, razon) => {
    if (razon === 'clickaway') return;
    setEstado((prev) => ({ ...prev, abierto: false }));
  }, []);

  const exito       = useCallback((m) => mostrar(m, 'success'), [mostrar]);
  const error       = useCallback((m) => mostrar(m, 'error'),   [mostrar]);
  const advertencia = useCallback((m) => mostrar(m, 'warning'), [mostrar]);
  const info        = useCallback((m) => mostrar(m, 'info'),    [mostrar]);

  return (
    <NotificacionContext.Provider value={{ mostrar, exito, error, advertencia, info }}>
      {children}

      <Snackbar
        open={estado.abierto}
        onClose={cerrar}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={cerrar}
          severity={estado.severidad}
          variant="filled"
          sx={{ minWidth: 280, boxShadow: 3 }}
        >
          {estado.mensaje}
        </Alert>
      </Snackbar>
    </NotificacionContext.Provider>
  );
}

export function useNotificacion() {
  const ctx = useContext(NotificacionContext);
  if (!ctx) {
    throw new Error('useNotificacion debe usarse dentro de <NotificacionProvider>');
  }
  return ctx;
}
