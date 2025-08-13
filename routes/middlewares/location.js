// proxyMiddleware.js
const net = require('net');
const { HttpsProxyAgent } = require('https-proxy-agent');
const axios = require('axios')
const geoip = require('geoip-lite')
const fs = require('fs').promises; 
const path = require('path');
const jwt = require('jsonwebtoken');
const GEO_FILE_PATH = path.join(__dirname, 'geo.json');



const PROXY_API_KEY = '767d671f666436b4df4279a033ad769d';
const PROXY_BASE_URL = `https://proxy-seller.com/personal/api/v1/${PROXY_API_KEY}`;
const PROXY_GATEWAY_HOST = 'res.proxy-seller.com'; 
const PROXY_GATEWAY_PORT = 10000;
const JWT_SECRET = 'adgadahadfhshwer234t5346y234rtuiopwdfg9382g138r23g523rgb23cufwepfu';




module.exports = async function proxyMiddleware(req, res, next) {
  try {

    const token = req.cookies.auth;
    
    if (token) {

      const decoded = jwt.verify(token, JWT_SECRET);

      const proxy = decoded.proxy

      console.log('Decoded Proxy:',proxy)

      req.proxy = proxy

      return next(); // No token, continue to route

    }

    console.log('starting generation of proxy for new ip')
    //(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const userIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    
    const geo = geoip.lookup(userIp);
    console.log(geo);


    console.log('geo.city : ',geo.city)
    console.log('geo.country: ',geo.country)

    const ListWithGeo = await getProxyUrl(geo.country, geo.city, userIp)

    console.log('gotproxyfrommiddle:',ListWithGeo)

    req.proxy = ListWithGeo

    // If IPv6 localhost like ::1, ignore
    if (!userIp || userIp.startsWith('::1') || userIp === '127.0.0.1') {
      req.proxyConfig = { proxyAgent: null };
      return next();
    }

    next();
  } catch (err) {
    console.error('Proxy middleware error:', err);
    req.proxyConfig = { proxyAgent: null };
    next();
  }
};






























async function getProxyUrl(countryCodeOrName, city, ip) {
  const MY_AUTHORIZED_IP = ip;

  const geoDataArray = await readGeoJson();
  const countryObj = findCountry(geoDataArray, countryCodeOrName);
  const targetCityObj = findCity(countryObj, city);

  if (!targetCityObj.isps?.length) {
    throw new Error(`No ISPs found for city "${city}" in geo.json`);
  }

  const isp = targetCityObj.isps[0];
  const credentials = await requestProxy(countryObj.code, targetCityObj.region, targetCityObj.name, isp, MY_AUTHORIZED_IP);

  const login = encodeURIComponent(credentials.login);
  const password = encodeURIComponent(credentials.password);

  return`http://${login}:${password}@${PROXY_GATEWAY_HOST}:${PROXY_GATEWAY_PORT}`;
}

async function readGeoJson() {
  try {
    const content = await fs.readFile(GEO_FILE_PATH, 'utf8');
    const data = JSON.parse(content);
    if (!Array.isArray(data)) throw new Error('geo.json must be an array');
    return data;
  } catch (err) {
    throw new Error(`Failed to read geo.json: ${err.message}`);
  }
}

function findCountry(geoArray, search) {
  const lowered = search.toLowerCase();
  const country = geoArray.find(c =>
    (c.name && c.name.toLowerCase() === lowered) ||
    (c.code && c.code.toLowerCase() === lowered)
  );
  if (!country) throw new Error(`Country "${search}" not found in geo.json`);
  return country;
}

function findCity(countryObj, cityName) {
  // Сначала ищем точно нужный город
  for (const region of countryObj.regions) {
    const foundCity = region.cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (foundCity && foundCity.isps?.length) return { ...foundCity, region: region.name };
  }
  for (const region of countryObj.regions) {
    const cityWithIsps = region.cities.find(c => c.isps?.length);
    if (cityWithIsps) return { ...cityWithIsps, region: region.name };
  }
  throw new Error(`No city with ISPs found in country "${countryObj.name}"`);
}

async function requestProxy(countryCode, region, city, isp, authorizedIp) {
  try {
    const postData = {
      title: `API Request with IP Binding: ${Date.now()}`,
      geo: { country: countryCode, region, city, provider: isp },
      rotation: 0,
      export: { ext: 'txt', ports: 1 },

      'ip': authorizedIp
    };

    const res = await axios.post(`${PROXY_BASE_URL}/resident/list`, postData);

    if (res.data.status !== 'success' || !res.data.data?.login) {
      const errMsg = res.data.errors ? JSON.stringify(res.data.errors) : 'Invalid API response';
      throw new Error(`Proxy creation failed: ${errMsg}`);
    }

    return {
      login: res.data.data.login,
      password: res.data.data.password,
    };
  } catch (err) {
    if (err.response) {
      console.error('API error details:', err.response.data);
    }
    throw new Error(`Failed to request proxy: ${err.message}`);
  }
}