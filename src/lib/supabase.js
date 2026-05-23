// src/lib/supabase.js
// -------------------------------------------------------
// Cliente de Supabase. Centraliza la conexión con el
// backend para que cualquier componente pueda usarlo.
// Las credenciales vienen del archivo .env.
// -------------------------------------------------------

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    'Faltan variables de entorno de Supabase. ' +
    'Crea un archivo .env en la raíz con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
  );
}
// el que usa la app y mantiene la sesión del administrador abierta
export const supabase = createClient(supabaseUrl, supabaseAnon);

//instancia aislada para que el admin pueda crear los usuarios sin que se le cierre la sesion
export const supabaseCrearUsuarios = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession: false,      //  No guarda la sesión en el navegador
    autoRefreshToken: false,    // No refresca el token de forma automática
    detectSessionInUrl: false   // Ignora los enlaces de confirmación en este cliente
  }
});