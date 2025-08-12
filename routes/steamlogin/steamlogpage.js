const router = require('express').Router()
const { LoginSession, EAuthTokenPlatformType } = require('steam-session');
const QR = require('qrcode');
const proxyMiddleware = require('../middlewares/location')
const jwt = require('jsonwebtoken');

router.use(proxyMiddleware)

router.get('/', async(req, res) => {
    try {

        let session = new LoginSession(EAuthTokenPlatformType.MobileApp,{
            httpProxy: req.proxy
        });

        session.loginTimeout = 120000;
        let startResult = await session.startWithQR();

        // Generate a data URL for the QR code image
        const qrImageUrl = await QR.toDataURL(startResult.qrChallengeUrl);

        // Event handlers (keep your existing ones)
        session.on('remoteInteraction', () => {
            console.log('Code scanned - awaiting approval');
        });

        session.on('authenticated', async () => {
            console.log('Authenticated successfully');
            // Handle successful authentication
        });

        const token = jwt.sign(
            { proxy:  req.proxy},
            'adgadahadfhshwer234t5346y234rtuiopwdfg9382g138r23g523rgb23cufwepfu',
            { expiresIn: '30d' }
        );

        res.cookie('auth', token, {
            httpOnly: true,
            secure: true,         
            sameSite: 'none',
            path: '/',
            maxAge: 86400000
        });

        // Render the view with the image URL
        res.render('steamLogin/Slogin', {
            title: 'Steam Login',
            message: 'Scan the QR code with your Steam Mobile App',
            qrImageUrl: qrImageUrl,
            proxyurl:req.proxy
        });

    } catch(error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
});

module.exports = router


