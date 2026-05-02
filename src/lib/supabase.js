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

export const supabase = createClient(supabaseUrl, supabaseAnon);
