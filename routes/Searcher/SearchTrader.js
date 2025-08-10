const router = require('express').Router();
const db = require('../config/db.js');

router.get('/:name', async (req, res) => {
    try {
        const traderName = req.params.name;
        
        // Query database for traders matching the name
        const traders = await db.query(
            `SELECT pictureurl, steamname, deposited_items  FROM traders WHERE username steamID = ?`,
            [`%${traderName}%`]
        );

        // Format the response to match expected frontend structure
        const formattedTraders = traders.rows.map(trader => ({
            id: trader.id,
            name: trader.name,
            avatar: trader.avatar || '/default-avatar.png',
            status: trader.status || 'trader',
            trades: trader.trades || 0,
            balance: parseFloat(trader.balance) || 0.00
        }));

        res.json(formattedTraders);
    } catch (error) {
        console.error('Error searching traders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;