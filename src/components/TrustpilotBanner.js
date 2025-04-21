import React from 'react';

export const TrustpilotBanner = () => {
  return (
    <section style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '5vh' }}>
      <div
        style={{
          backgroundColor: '#002244',
          padding: '10px',
          borderRadius: '1rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          boxSizing: 'border-box',
        }}
      >
        <a
          className="trustpilot-widget"
          href="https://fr.trustpilot.com/review/chogan-by-ikram.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            textDecoration: 'none',
            color: '#000',
            fontWeight: 'bold',
            flexWrap: 'wrap',
            maxWidth: '100%',
          }}
        >
          <span style={{ fontSize: '1rem' }}>Excellent</span>

          <img
            src="https://nutriandco.com/themes/nutriandco/assets/img/homepage/trustpilot-stars.svg"
            alt="Note Trustpilot"
            width={120}
            height={25}
            loading="lazy"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          <span style={{ fontSize: '1rem' }}>Trustpilot</span>
        </a>
      </div>
    </section>
  );
};

export default TrustpilotBanner;
