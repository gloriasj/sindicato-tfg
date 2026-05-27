
import { useAuth } from '../context/AuthContext';

export function usePermisos() {
  const { profile } = useAuth();

  const esAdmin    = profile?.rol === 'admin';
  const esDelegado = profile?.rol === 'delegado';

  return {
    esAdmin,
    esDelegado,
    rol: profile?.rol ?? null,

    puedeGestionarAfiliados: esAdmin || esDelegado,
    puedeVerAfiliados:       true,

    puedeGestionarIncidencias: esAdmin || esDelegado,
    puedeCrearIncidencias:     true,
    puedeEditarIncidencias:    true,
    puedeEliminarIncidencias:  esAdmin || esDelegado,
    puedeCambiarEstado:        true,


    puedeAdministrarSectores: esAdmin,
    puedeGestionarUsuarios:   esAdmin,
  };
}