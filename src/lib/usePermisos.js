// src/lib/usePermisos.js
// -------------------------------------------------------
// Hook que devuelve los permisos del usuario logueado
// según su rol. Centraliza la lógica de permisos para que
// sea fácil cambiar las reglas en un solo sitio.
//
// Uso:
//   const { esAdmin, puedeEliminar, puedeGestionarAfiliados } = usePermisos();
//   if (esAdmin) { ... }
// -------------------------------------------------------

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

    // Permisos sobre afiliados
    puedeGestionarAfiliados: esAdmin,    // crear/editar/borrar
    puedeVerAfiliados:       true,        // ambos pueden listar

    // Permisos sobre incidencias
    puedeCrearIncidencias:   true,        // ambos
    puedeEditarIncidencias:  true,        // ambos
    puedeEliminarIncidencias: esAdmin,    // SOLO admin
    puedeCambiarEstado:      true,        // ambos

    // Administración del sistema
    puedeAdministrarSectores: esAdmin,
  };
}
