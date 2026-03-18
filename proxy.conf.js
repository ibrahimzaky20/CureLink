module.exports = {
  '/api': {
    target: 'https://curelink-api.io',
    changeOrigin: true,
    secure: true,
    configure: (proxy) => {
      proxy.on('proxyRes', (proxyRes) => {
        const setCookie = proxyRes.headers['set-cookie'];
        if (setCookie) {
          proxyRes.headers['set-cookie'] = setCookie.map((cookie) =>
            cookie
              .replace(/;\s*Secure/gi, '')
              .replace(/;\s*SameSite=\w+/gi, '; SameSite=Lax')
          );
        }
      });
    }
  }
};
