import React from 'react';

const PrivacyPolicy = () => {
  return (
    <section style={styles.container}>
      <h1 style={styles.heading}>Politique de confidentialité</h1>
      <p style={styles.text}>
        Chez Chogan by Ikram, nous accordons une grande importance à la confidentialité de vos données personnelles.
        Cette politique décrit comment vos informations sont collectées, utilisées et protégées.
      </p>

      <h2 style={styles.subheading}>Collecte des informations</h2>
      <p style={styles.text}>
        Nous collectons vos données lorsque vous vous inscrivez sur notre site, passez une commande ou remplissez un
        formulaire. Les données peuvent inclure votre nom, votre adresse e-mail, votre adresse postale et votre numéro
        de téléphone.
      </p>

      <h2 style={styles.subheading}>Utilisation des informations</h2>
      <p style={styles.text}>
        Vos informations sont utilisées pour traiter les commandes, améliorer le service client et vous envoyer des
        informations importantes concernant vos achats ou notre boutique.
      </p>

      <h2 style={styles.subheading}>Protection des données</h2>
      <p style={styles.text}>
        Nous mettons en œuvre des mesures de sécurité avancées pour protéger vos données personnelles. Toutes les
        transactions sont sécurisées via SSL.
      </p>

      <h2 style={styles.subheading}>Partage des données</h2>
      <p style={styles.text}>
        Nous ne vendons, n’échangeons ni ne transférons vos informations personnelles à des tiers, sauf si cela est
        nécessaire pour fournir un service (ex: livraison).
      </p>

      <h2 style={styles.subheading}>Consentement</h2>
      <p style={styles.text}>
        En utilisant notre site, vous consentez à notre politique de confidentialité.
      </p>
    </section>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.7',
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
    color: '#002244',
    textAlign: 'center',
  },
  subheading: {
    fontSize: '1.5rem',
    marginTop: '2rem',
    marginBottom: '0.5rem',
    color: '#004080',
  },
  text: {
    fontSize: '1rem',
    color: '#333',
  },
};

export default PrivacyPolicy;
