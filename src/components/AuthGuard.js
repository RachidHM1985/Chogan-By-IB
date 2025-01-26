// components/AuthGuard.js

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';

const AuthGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session && session.user) {
          // Si l'utilisateur est connecté, on récupère les infos sur l'utilisateur
          setUser(session.user);

          // Vérifiez si l'utilisateur est un admin en consultant le rôle
          const { data: profile, error } = await supabase
            .from('profiles')  // Assurez-vous d'avoir une table 'profiles' pour gérer les rôles.
            .select('role')  // Vérifiez le rôle dans la base de données.
            .eq('id', session.user.id)
            .single();

          if (error || profile.role !== 'admin') {
            router.push('/'); // Rediriger vers la page d'accueil si l'utilisateur n'est pas un admin
          }
        } else {
          router.push('/admin/orders'); // Rediriger vers la page de login si l'utilisateur n'est pas connecté
        }
      } catch (err) {
        console.error('Error during authentication check:', err);
        setError('Une erreur est survenue lors de la vérification.');
        router.push('/login'); // Rediriger vers la page de login en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  // Si l'utilisateur est en cours de chargement, on peut afficher un indicateur de chargement.
  if (loading) {
    return <div>Chargement...</div>;
  }

  // Si un utilisateur est connecté et est un admin, on affiche les enfants.
  return user && !loading && !error ? <>{children}</> : null;
};

export default AuthGuard;
