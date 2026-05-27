
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
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          cargarPerfil(session.user.id);
        } else {
          setProfile(null);
          setLoading(false)
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    try {

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) return { error };

      // portero
      if (data?.user) {
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('activo')
            .eq('id', data.user.id)
            .single();


        if (profileError || (profileData && profileData.activo === false)) {
          await supabase.auth.signOut();
          return { error: { message: 'CUENTA_INACTIVA' } };
        }
      }


      return { error: null };

    } catch (err) {
      // Si ocurre un fallo de red o un cuelgue, lo capturamos para que el botón no se quede atascado
      // Y cerramos la sesión por precaución
      await supabase.auth.signOut();
      return { error: { message: 'CUENTA_INACTIVA' } };
    }

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
