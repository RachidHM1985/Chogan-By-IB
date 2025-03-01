// components/Layout.js
import React from 'react';
import Header from './Header';
import MyBreadcrumbs from './Breadcrumbs';  // Import du fil d'Ariane
import { Container } from '@mui/material';

const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      <Container sx={{ position:'relative', marginTop: '12vh' }}>
        <MyBreadcrumbs /> {/* Affichage du fil d'Ariane ici */}
        <div>{children}</div> {/* Contenu de la page */}
      </Container>
    </div>
  );
};

export default Layout;
