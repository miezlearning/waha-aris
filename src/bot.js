import { WahaClient } from './waha.js';

const waha = new WahaClient();

// List of simple jokes
const JOKES = [
  "Kenapa sepiring nasi goreng rasanya gurih? Karena dicampur cinta... dan sedikit MSG.",
  "Kenapa HP kalau jatuh layar pecah? Soalnya kalau jatuh cinta hati yang pecah.",
  "Pekerjaan apa yang kalau dikerjakan malah makin berat? Mengangkat beban hidup.",
  "Kenapa burung terbang ke selatan saat musim dingin? Soalnya kalau jalan kaki kejauhan.",
  "Gajah apa yang belalainya pendek? Gajah pesek."
];

/**
 * Handle incoming webhook messages.
 * @param {object} event - Webhook event payload
 */
export async function handleWebhookEvent(event) {
  // Ensure it's a message event
  if (event.event !== 'message') {
    return;
  }

  const payload = event.payload;

  // Ignore messages sent by the bot itself to prevent infinite loops
  if (payload.fromMe) {
    return;
  }

  const chatId = payload.from;
  const messageBody = (payload.body || '').trim();

  console.log(`Received message from ${chatId}: "${messageBody}"`);

  // Simple command router
  if (messageBody.startsWith('!')) {
    const parts = messageBody.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (command) {
      case '!ping':
        await waha.sendText(chatId, '🏓 pong!');
        break;

      case '!about':
        await waha.sendText(chatId, '🤖 *Aris Bot v1.0.0*\nSebuah WhatsApp bot sederhana yang ditenagai oleh WAHA HTTP API dan Node.js.');
        break;

      case '!help': {
        const helpText = 
          `🤖 *Aris Bot Menu* 🤖\n\n` +
          `Berikut adalah perintah yang bisa Anda gunakan:\n` +
          `• *!help* - Menampilkan menu ini\n` +
          `• *!ping* - Tes koneksi bot\n` +
          `• *!about* - Tentang bot ini\n` +
          `• *!echo <teks>* - Mengulangi teks yang Anda kirim\n` +
          `• *!joke* - Menampilkan humor receh\n\n` +
          `_Coba juga mengirim pesan seperti 'halo' atau 'aris'!_`;
        await waha.sendText(chatId, helpText);
        break;
      }

      case '!echo':
        if (!args) {
          await waha.sendText(chatId, '⚠️ Silakan masukkan teks yang ingin di-echo. Contoh: `!echo Halo Dunia`');
        } else {
          await waha.sendText(chatId, `🗣️ Anda berkata: ${args}`);
        }
        break;

      case '!joke': {
        const randomJoke = JOKES[Math.floor(Math.random() * JOKES.length)];
        await waha.sendText(chatId, `🤪 *Humor Hari Ini:*\n\n${randomJoke}`);
        break;
      }

      default:
        await waha.sendText(chatId, `⚠️ Perintah *${command}* tidak dikenali. Ketik *!help* untuk melihat perintah yang tersedia.`);
        break;
    }
  } else {
    // Normal text message processing (keyword matching)
    const lowerBody = messageBody.toLowerCase();

    if (lowerBody.includes('halo') || lowerBody.includes('hello') || lowerBody.includes('hi') || lowerBody.includes('hey')) {
      await waha.sendText(chatId, '👋 Halo! Saya Aris Bot. Ada yang bisa saya bantu? Ketik *!help* untuk melihat daftar perintah.');
    } else if (lowerBody.includes('aris')) {
      await waha.sendText(chatId, '🙋‍♂️ Ya, saya Aris Bot! Siap membantu Anda kapan saja. Ketik *!help* untuk memandu Anda.');
    } else if (lowerBody === 'p' || lowerBody === 'ping') {
      await waha.sendText(chatId, 'Pong! Ketik *!help* untuk melihat perintah lengkap.');
    }
  }
}
