import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import { useRouter } from 'next/router';

const AuthGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          // Vérifier le rôle de l'utilisateur
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (error) {
            throw error;
          }

          // Si l'utilisateur n'est pas un admin, rediriger
          if (profile.role !== 'admin') {
            router.push('/'); // Rediriger vers la page d'accueil ou une autre page
          } else {
            setUser(session.user);
          }
        } else {
          router.push('/admin/login'); // Rediriger vers la page de login
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', err);
        router.push('/admin/login'); // Rediriger en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return user ? <>{children}</> : null; // Si l'utilisateur est admin, afficher les enfants
};

export default AuthGuard;
