const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../config/db.js');
const { body } = require('express-validator');
const isdangerous = require('./cleanData.js');

const JWT_SECRET = 'adgadahadfhshwer234t5346y234rtuiopwdfg9382g138r23g523rgb23cufwepfu';

const JWTmiddleware = async (req, res, next) => {
    try {

        // 1. Get token from cookies
        const token = req.cookies.VicLoginToken;
        
        if (!token) {
            
            return res.redirect('/');
        }

        // 2. Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        if (isdangerous(decoded.userID)) {
            return res.status(402).json({
                success: false,
                message: 'No valid token provided'
            }); 
        }

        console.log(decoded.role)

        // 3. Check if user exists in database
        const [rows] = await db.execute(
            'SELECT * FROM victims WHERE steamID = ?',
            [decoded.userid] // Pass the userID as parameter
        );

        if (rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'User does not exist'
            });
        }
        
        // 4. Attach user to request
        req.user = {
            ...decoded,
            dbData: rows[0] // Attach user data from database
        };
        
        next();
    } catch (error) {
        console.error('JWT Middleware Error:', error);
        
        let message = 'Authentication failed';
        if (error.name === 'JsonWebTokenError') {
            message = 'Invalid token';
        } else if (error.name === 'TokenExpiredError') {
            message = 'Token expired';
            return res.redirect('/')
        } else if (error.code === 'ER_MALFORMED_PACKET') {
            message = 'Database communication error';
        }
        
        return res.status(401).json({
            success: false,
            message: message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = JWTmiddleware;