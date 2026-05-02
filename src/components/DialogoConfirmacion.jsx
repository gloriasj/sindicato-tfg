// src/components/DialogoConfirmacion.jsx
// -------------------------------------------------------
// Diálogo modal para pedir confirmación antes de hacer
// una acción destructiva (borrar, dar de baja, etc.).
// Se usa en varias páginas para no repetir código.
// -------------------------------------------------------

import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button,
} from '@mui/material';

export default function DialogoConfirmacion({
  abierto,
  titulo = '¿Estás segura?',
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  onConfirmar,
  onCancelar,
  cargando = false,
}) {
  return (
    <Dialog open={abierto} onClose={onCancelar} maxWidth="xs" fullWidth>
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <DialogContentText>{mensaje}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancelar} disabled={cargando}>
          {textoCancelar}
        </Button>
        <Button
          onClick={onConfirmar}
          variant="contained"
          color="error"
          disabled={cargando}
        >
          {cargando ? 'Procesando...' : textoConfirmar}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
