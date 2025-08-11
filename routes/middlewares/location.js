const { HttpsProxyAgent } = require('https-proxy-agent');

function proxyMiddleware(req, res, next) {
    // 1. მომხმარებლის IP-ის ამოღება (თუ არსებობს X-Forwarded-For ან socket.remoteAddress)
    const userIpRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userIp = (userIpRaw === '::1' || userIpRaw === '127.0.0.1') ? null : userIpRaw?.split(',')[0];

    // 2. პროქსის URL-ის გენერირება (თუ userIp არსებობს)
    let proxyAgent = null;
    if (userIp) {
        const proxyUrl = `http://${userIp}:3128`; // 3128 - Squid/HTTP proxy-ის ნაგულისხმევი პორტი
        proxyAgent = new HttpsProxyAgent(proxyUrl);
    }

    // 3. Steam-ის სესიისთვის საჭირო headers
    const steamHeaders = {
        'X-Forwarded-For': userIp,
        'X-Real-IP': userIp,
        'CF-Connecting-IP': userIp, // Cloudflare-ისტილის ჰედერი (ვირტუალურად ყველა სერვისი ეს აღიქვამს)
        'Accept-Language': 'en-US',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    };

    // 4. გადაეცით მონაცემები request-ს
    req.proxyConfig = {
        proxyAgent,
        headers: userIp ? steamHeaders : null
    };

    next(); // გადადის შემდეგ middleware/route-ზე
}

module.exports = proxyMiddleware;