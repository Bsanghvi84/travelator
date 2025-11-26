const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 8000 });
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ PUBLIC URL: ' + tunnel.url);
    console.log('='.repeat(60));
    console.log('');

    tunnel.on('close', () => {
      console.log('Tunnel closed');
      process.exit();
    });

    // Keep the tunnel alive
    process.on('SIGINT', () => {
      tunnel.close();
    });
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
