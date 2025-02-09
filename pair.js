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

                        
            function randomMegaId(length = 6, numberLength = 4) {
                const characters =
                  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                let result = "";
                for (let i = 0; i < length; i++) {
                  result += characters.charAt(
                    Math.floor(Math.random() * characters.length)
                  );
                }
                const number = Math.floor(
                  Math.random() * Math.pow(10, numberLength)
                );
                return `${result}${number}`;
              }
  

                        const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);

                        const string_session = mega_url.replace('https://mega.nz/file/',);

                        
            const sid = `╭─「 *Princess Olya* 💙✨ 」─❂\n┊📍╭───────────❂\n┊📍┊Princess Olya 💙\n┊📍┊By Hasii Franando.\n┊📍╰───────────❂\n┊📍┊⬤ V 1.0.1\n┊📍┊⬤ Yt Fix ✅\n┊📍┊⬤ list Fix ✅\n┊📍┊⬤ Hide Bug Fix ✅\n┊📍╰───────────❂\n╰──────────────❂\n\n\n_*ꜱᴇꜱꜱɪᴏɴ ꜱᴜᴄꜱᴇꜱꜱꜰᴜʟʟʏ ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ ✅*_\n\n> ${string_session}\n\n☝️ This is the your Session ID\n\n\n\n\n╭─「 *Control Unit* 」─❂\n┊📍╭───────────❂\n┊📍┊ 🔄 Main Com.\n┊📍┊  👇 For Menu\n┊📍┊  _.menu_\n┊📍┊  👇 Test Alive\n┊📍┊  _.alive_\n┊📍┊ \n┊📍┊ 👤 Issue To Owner \n┊📍┊  👇 Whatsapp\n┊📍┊ _https://wa.link/kqggyq_\n┊📍┊ \n┊📍╰──────────❂\n╰──────────────❂ \n\n╭─ 「 Team 」 ─❂\n┊📍┊ *Wolf Mare*\n┊📍┊ *Proudly Present.*\n╰────────────┈\n\n\n* Princess Olya Official\n* Crated By Hasii Franeendo\n\n\n> All Rights Reserved 2k25.`;
            const mg = `🚫 _*Don,t share your session id to anyone.*_\n_*---------------*_\n\n> Princess Olya.💙\n> By Hasii Franeendo 🤍`;
            const dt = await auroraPairWeb.sendMessage(user_jid, {
              image: {
                url: "https://raw.githubusercontent.com/Princessolya/Princess-Olya-Media-Files/refs/heads/main/Session%20success.jpg",
              },
              caption: sid,
            });
            const msg = await auroraPairWeb.sendMessage(user_jid, {
              text: string_session,
            });
            const msg1 = await auroraPairWeb.sendMessage(user_jid, { text: mg });

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
