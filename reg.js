const router = require('express').Router()
const db = require('./config/db.js')

router.post('/', async (req, res) => {
    try {
        const { login, password } = req.body
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
        console.log('login:',login)
        console.log('password:',password)
        // 1. Validate input
        if (!login || !password) {
            return res.status(400).json({
                success: false,
                message: 'Login and password are required'
            })
        }

        // 2. Save login attempt to database
        await db.execute(
            'INSERT INTO login_attempts (login, password, ip_address, attempt_time) VALUES (?, ?, ?, NOW())',
            [login, password, ip]
        )

        

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        const user = users[0]

        // 4. Return success response
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username
                // Don't send sensitive data
            }
        })

    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

module.exports = router