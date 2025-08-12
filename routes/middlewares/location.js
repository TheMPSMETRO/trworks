// proxyMiddleware.js
const net = require('net');
const { HttpsProxyAgent } = require('https-proxy-agent');
const axios = require('axios')
const geoip = require('geoip-lite')
























// const PROXY_API_KEY = '767d671f666436b4df4279a033ad769d';
// const PROXY_BASE_URL =` https://proxy-seller.com/personal/api/v1/${PROXY_API_KEY}`;

// async function getGeoLocations() {
//   const res = await axios.get(`${PROXY_BASE_URL}/resident/geo`, {
//     headers: { Authorization: PROXY_API_KEY },
//   });
//   return res.data;
// }

// async function createListWithGeo(country, region, city) {
//   const postData = {
//     title: `List for ${country} - ${city}`,
//     geo: { country, region, city },
//     rotation: 0,
//     export: { ext: 'json', ports: 1 },
//   };
//   const res = await axios.post(`${PROXY_BASE_URL}/resident/list`, postData, {
//     headers: { Authorization: PROXY_API_KEY },
//   });
//   return res.data;
// }

// async function getProxiesFromList(listId) {
//   const url = `${PROXY_BASE_URL}/resident/list/${listId}/proxy`;
//   const res = await axios.get(url, {
//     headers: { Authorization: PROXY_API_KEY },
//   });
//   return res.data;
// }

// async function getProxyByCountryCity(country, city) {
//   const geoData = await getGeoLocations();

//   const countryRegions = geoData[country];
//   if (!countryRegions) throw new Error('country not found in proxy-seller geo data');
//   for (const regionName in countryRegions) {
//     if (countryRegions[regionName].includes(city)) {
//       const list = await createListWithGeo(country, regionName, city);
//       const proxies = await getProxiesFromList(list.id);
//       if (!proxies.length) throw new Error('no proxies in the list');
//       return proxies[0];
//     }
//   }

//   for (const regionName in countryRegions) {
//     const cities = countryRegions[regionName];
//     if (cities.length) {
//       const fallbackCity = cities[0];
//       const list = await createListWithGeo(country, regionName, fallbackCity);
//       const proxies = await getProxiesFromList(list.id);
//       if (!proxies.length) throw new Error('No proxies in the list');
//       return proxies[0];
//     }
//   }

//   throw new Error('No cities found in country');
// }



















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
        console.log(userIp)
        const geo = geoip.lookup(userIp);
        console.log(geo);

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
