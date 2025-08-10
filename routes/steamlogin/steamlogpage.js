

const router = require('express').Router()
const { LoginSession, EAuthTokenPlatformType } = require('steam-session');
const QR = require('qrcode');

router.get('/', async(req, res) => {
    try {
        let session = new LoginSession(EAuthTokenPlatformType.MobileApp);
        session.loginTimeout = 120000;
        let startResult = await session.startWithQR();

        // Generate a data URL for the QR code image
        const qrImageUrl = await QR.toDataURL(startResult.qrChallengeUrl, {type:"terminal"});

        // Event handlers (keep your existing ones)
        session.on('remoteInteraction', () => {
            console.log('Code scanned - awaiting approval');
        });

        session.on('authenticated', async () => {
            console.log('Authenticated successfully');
            // Handle successful authentication
        });

        // Render the view with the image URL
        res.render('steamLogin/Slogin', {
            title: 'Steam Login',
            message: 'Scan the QR code with your Steam Mobile App',
            qrImageUrl: qrImageUrl
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


