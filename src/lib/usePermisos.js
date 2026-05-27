

import { useAuth } from '../context/AuthContext';

export function usePermisos() {
  const { profile } = useAuth();

  const esAdmin    = profile?.rol === 'admin';
  const esDelegado = profile?.rol === 'delegado';

  return {
    // Identidad
    esAdmin,
    esDelegado,
    rol: profile?.rol ?? null,

    // Permisos sobre afiliados (CRUD completo para ambos)
    puedeGestionarAfiliados: esAdmin || esDelegado,
    puedeVerAfiliados:       true,

    // Permisos sobre incidencias (CRUD completo para ambos)
    puedeGestionarIncidencias: esAdmin || esDelegado,
    puedeCrearIncidencias:     true,
    puedeEditarIncidencias:    true,
    puedeEliminarIncidencias:  esAdmin || esDelegado,
    puedeCambiarEstado:        true,

    // Administración del sistema (EXCLUSIVO para Administrador)
    puedeAdministrarSectores: esAdmin,
    puedeGestionarUsuarios:   esAdmin, // Ver, desactivar y cambiar roles de usuarios
  };
}