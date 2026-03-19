import https from 'https';

/**
 * Keep-alive mechanism for Render free tier.
 * Pings the server's own health check endpoint every 5 minutes 
 * to prevent the service from spinning down due to inactivity.
 */
export const startKeepAlive = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isRender = !!process.env.RENDER;
    const isForced = process.env.ENABLE_KEEP_ALIVE === 'true';

    if (!isProduction && !isRender && !isForced) {
        console.log('Keep-alive: Disabled (not in production/Render and not forced)');
        return;
    }

    const url = process.env.APP_URL || 'https://arlyon.onrender.com/api/health';
    const interval = 5 * 60 * 1000; // 5 minutes

    console.log(`🚀 Keep-alive: Active (target: ${url})`);

    setInterval(() => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                console.warn(`[Keep-Alive] Received status ${res.statusCode} from ${url}`);
            }
        }).on('error', (err) => {
            console.error(`[Keep-Alive] Connect error: ${err.message}`);
        });
    }, interval);
};
