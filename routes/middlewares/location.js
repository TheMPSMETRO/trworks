// proxyMiddleware.js
const net = require('net');
const { HttpsProxyAgent } = require('https-proxy-agent');

async function checkProxy(ip, port) {
    return new Promise((resolve) => {
        const socket = net.connect(port, ip);
        socket.setTimeout(2000);
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.on('error', () => resolve(false));
        socket.on('timeout', () => resolve(false));
    });
}

module.exports = async function proxyMiddleware(req, res, next) {
    try {
        const userIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

        // If IPv6 localhost like ::1, ignore
        if (!userIp || userIp.startsWith('::1') || userIp === '127.0.0.1') {
            req.proxyConfig = { proxyAgent: null };
            return next();
        }

        // Common proxy ports to try
        const ports = [8080, 3128, 1080]; // HTTP, HTTP-alt, SOCKS5
        let foundProxy = null;

        for (const port of ports) {
            const available = await checkProxy(userIp, port);
            if (available) {
                foundProxy = { ip: userIp, port };
                break;
            }
        }

        if (foundProxy) {
            console.log(`Found proxy on ${foundProxy.ip}:${foundProxy.port}`);
            const proxyUrl = `http://${foundProxy.ip}:${foundProxy.port}`;
            req.proxyConfig = { proxyAgent: new HttpsProxyAgent(proxyUrl) };
        } else {
            console.log(`No proxy found for ${userIp}, using default connection`);
            req.proxyConfig = { proxyAgent: null };
        }

        next();
    } catch (err) {
        console.error('Proxy middleware error:', err);
        req.proxyConfig = { proxyAgent: null };
        next();
    }
};
