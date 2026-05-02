// src/context/AuthContext.jsx
// -------------------------------------------------------
// Contexto global de autenticación.
// Mantiene la sesión, el perfil del usuario y expone
// las funciones login, registro y logout.
// -------------------------------------------------------

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function cargarPerfil(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error cargando perfil:', error);
      setProfile(null);
    } else {
      setProfile(data);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        cargarPerfil(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          cargarPerfil(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function registro(email, password, datosPerfil) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: datosPerfil },
    });
    return { error };
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  const valor = { user, profile, loading, login, registro, logout };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
