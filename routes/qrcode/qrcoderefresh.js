const WebSocket = require('ws');
const { LoginSession, EAuthTokenPlatformType } = require('steam-session');
const QRCode = require('qrcode');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', async function connection(ws) {
  try {
    const session = new LoginSession(EAuthTokenPlatformType.SteamClient);
    const startResult = await session.startWithQR();

    // QR კოდის გენერაცია Base64 Data URL
    const qrImageUrl = await QRCode.toDataURL(startResult.qrChallengeUrl);

    // პირველივე შეტყობინება - QR კოდი კლიენტს
    ws.send(JSON.stringify({ type: 'qr', data: qrImageUrl }));

    // მოვუსმინოთ Steam ლოგინის event-ებს
    session.on('remoteInteraction', () => {
      ws.send(JSON.stringify({ type: 'scanned', message: 'QR კოდი სკანირებულია, გთხოვთ დაადასტურეთ.' }));
    });

    session.on('authenticated', async () => {
      ws.send(JSON.stringify({ type: 'authenticated', message: 'მომხმარებელი წარმატებით ავტორიზებულია.' }));
      // აქ შეგიძლია დაამატო კუკი ან ტოკენების გამოგზავნა
      const cookies = await session.getWebCookies();
      ws.send(JSON.stringify({ type: 'cookies', data: cookies }));
      ws.close();
    });

    session.on('timeout', () => {
      ws.send(JSON.stringify({ type: 'timeout', message: 'სესიამ გაიწურა.' }));
      ws.close();
    });

    session.on('error', (err) => {
      ws.send(JSON.stringify({ type: 'error', message: err.message }));
      ws.close();
    });

    // თუ კლიენტი გათიშავს კავშირს, ლოგინი გაწყვიტე
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
