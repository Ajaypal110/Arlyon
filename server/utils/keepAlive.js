import https from 'https';

/**
 * Keep-alive mechanism for Render free tier.
 * Pings the server's own health check endpoint every 5 minutes 
 * to prevent the service from spinning down due to inactivity.
 */
export const startKeepAlive = () => {
    // Only run in production to avoid unnecessary pings during development
    if (process.env.NODE_ENV !== 'production') {
        console.log('Keep-alive: Disabled (not in production)');
        return;
    }

    const url = 'https://arlyon.onrender.com/api/health';
    const interval = 5 * 60 * 1000; // 5 minutes

    console.log(`Keep-alive: Started (pinging ${url} every 5 mins)`);

    setInterval(() => {
        https.get(url, (res) => {
            console.log(`[Keep-Alive] Pinged ${url}: Status ${res.statusCode}`);
        }).on('error', (err) => {
            console.error(`[Keep-Alive] Error pinging ${url}: ${err.message}`);
        });
    }, interval);
};
