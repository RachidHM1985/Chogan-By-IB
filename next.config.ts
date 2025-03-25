module.exports = {
  async redirects() {
    return [
      {
        source: '/perfumes/:category',
        destination: '/perfumes?category=:category',
        permanent: true, // Redirection 301 (SEO)
      },
      {
        source: '/perfumes/:category/:id',
        destination: '/perfumes/:category/:id',
        permanent: true, // Redirection 301 (SEO)
      },
      {
        source: '/beauty/:category',
        destination: '/beauty?category=:category',
        permanent: true, // Redirection 301 (SEO)
      },
      {
        source: '/brilhome/:category',
        destination: '/brilhome?category=:category',
        permanent: true, // Redirection 301 (SEO)
      },
      {
        source: '/peptilux/:category',
        destination: '/brilhome?category=:category',
        permanent: true, // Redirection 301 (SEO)
      },{
        source: '/parfumerieInterieur/:category',
        destination: '/parfumerieInterieur?category=:category',
        permanent: true, // Redirection 301 (SEO)
      }
    ];
  },
};
