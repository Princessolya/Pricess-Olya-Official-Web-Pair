const express = require('express');
const fs = require('fs');
const { exec } = require("child_process");
let router = express.Router()
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    let num = req.query.number;
    async function auroraPair() {
        const { state, saveCreds } = await useMultiFileAuthState(`./session`);
        try {
            let auroraPairWeb = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!auroraPairWeb.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await auroraPairWeb.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            auroraPairWeb.ev.on('creds.update', saveCreds);
            auroraPairWeb.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === "open") {
                    try {
                        await delay(10000);
                        const sessionaurora = fs.readFileSync('./session/creds.json');

                        const auth_path = './session/';
                        const user_jid = jidNormalizedUser(auroraPairWeb.user.id);

                        const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${user_jid}.json`);

                        const string_session = mega_url.replace('https://mega.nz/file/', '');

                        const sid = string_session;

                        const dt = await auroraPairWeb.sendMessage(user_jid, {
                            text: sid
                        });

    await auroraPairWeb.sendMessage(user_jid, {
                            text: "❗ `Dont share Your code to anyone`\n\n*💕Thank you for using QUEEN-AURORA-MD*\n\n*👉🏻If you have any problem please contact us on Whatsapp*\n\n*👉🏻https://wa.me/94779912589*\n\n*👉🏻https://github.com/mraurorafernando12/QUEEN-AURORA-MD/fork*\n\n*👉🏻https://whatsapp.com/channel/0029VazCMptGU3BJryRKYs2W*\n\n\ > ᴘᴀᴡᴇʀᴇᴅ ʙʏ Qᴜᴇᴇɴ ᴀᴜʀᴏʀᴀ ᴍᴅ\n----------------------------------------------------\n\n",
   
                            });

                    } catch (e) {
                        exec('pm2 restart aurora');
                    }

                    await delay(100);
                    return await removeFile('./session');
                    process.exit(0);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    auroraPair();
                }
            });
        } catch (err) {
            exec('pm2 restart aurora');
            console.log("service restarted");
            auroraPair();
            await removeFile('./session');
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }
    return await auroraPair();
});

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
    exec('pm2 restart aurora');
});


module.exports = router;
