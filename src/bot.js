import axios from 'axios';
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

  // Start typing presence
  await waha.startTyping(chatId);

  try {
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
          await waha.sendText(chatId, '🤖 *Aris Bot v1.1.0*\nSebuah WhatsApp bot sederhana yang ditenagai oleh WAHA HTTP API, Node.js, dan Prexzy APIs.');
          break;

        case '!help': {
          const helpText = 
            `🤖 *Aris Bot Menu* 🤖\n\n` +
            `Berikut adalah perintah yang bisa Anda gunakan:\n` +
            `• *!help* - Menampilkan menu ini\n` +
            `• *!ping* - Tes koneksi bot\n` +
            `• *!about* - Tentang bot ini\n` +
            `• *!echo <teks>* - Mengulangi teks Anda\n` +
            `• *!joke* - Humor acak\n` +
            `• *!ai / !deepseek <tanya>* - Tanya AI\n` +
            `• *!cuaca <kota>* - Info cuaca kota\n` +
            `• *!lyric <judul>* - Lirik lagu\n` +
            `• *!animeimg <prompt>* - Gambar anime AI\n` +
            `• *!realisticimg <prompt>* - Gambar realistis AI\n` +
            `• *!cat* - Gambar kucing acak\n` +
            `• *!dog* - Gambar anjing acak\n` +
            `• *!waifu* - Gambar waifu acak\n` +
            `• *!car* - Gambar mobil acak\n\n` +
            `_Coba juga kirim pesan santai seperti 'halo' atau 'aris'!_`;
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

        case '!ai':
        case '!deepseek': {
          if (!args) {
            await waha.sendText(chatId, `⚠️ Silakan masukkan pertanyaan setelah perintah. Contoh: \`${command} siapa penemu listrik?\``);
            break;
          }
          await waha.sendText(chatId, '🤖 _Aris sedang berpikir..._');
          try {
            const response = await axios.get(`https://prexzyapis.com/ai/deepseek?prompt=${encodeURIComponent(args)}`);
            if (response.data && response.data.status && response.data.response) {
              await waha.sendText(chatId, response.data.response);
            } else {
              await waha.sendText(chatId, '⚠️ Maaf, terjadi kesalahan saat menghubungi AI.');
            }
          } catch (err) {
            console.error(err);
            await waha.sendText(chatId, '⚠️ Gagal menghubungi server AI. Coba beberapa saat lagi.');
          }
          break;
        }

        case '!cuaca': {
          if (!args) {
            await waha.sendText(chatId, '⚠️ Silakan masukkan nama kota. Contoh: `!cuaca jakarta`');
            break;
          }
          try {
            const response = await axios.get(`https://prexzyapis.com/search/cuaca?kota=${encodeURIComponent(args)}`);
            if (response.data && response.data.status && response.data.data) {
              const d = response.data.data;
              const weatherMsg = 
                `⛅ *Informasi Cuaca di ${d.location}, ${d.country}* ⛅\n\n` +
                `• *Kondisi:* ${d.weather}\n` +
                `• *Suhu Saat Ini:* ${d.currentTemp}\n` +
                `• *Suhu Maksimal:* ${d.maxTemp}\n` +
                `• *Suhu Minimal:* ${d.minTemp}\n` +
                `• *Kelembapan:* ${d.humidity}\n` +
                `• *Kecepatan Angin:* ${d.windSpeed}`;
              await waha.sendText(chatId, weatherMsg);
            } else {
              await waha.sendText(chatId, `⚠️ Informasi cuaca untuk kota *${args}* tidak ditemukan.`);
            }
          } catch (err) {
            console.error(err);
            await waha.sendText(chatId, '⚠️ Gagal mengambil data cuaca.');
          }
          break;
        }

        case '!lyric':
        case '!lirik': {
          if (!args) {
            await waha.sendText(chatId, '⚠️ Silakan masukkan judul lagu. Contoh: `!lyric bohemian rhapsody`');
            break;
          }
          try {
            const response = await axios.get(`https://prexzyapis.com/search/lyrics?title=${encodeURIComponent(args)}`);
            if (response.data && response.data.status && response.data.data) {
              const d = response.data.data;
              const lyricMsg = 
                `🎵 *Lirik Lagu: ${d.title}* 🎵\n` +
                `👤 *Artis:* ${d.artist}\n` +
                `💿 *Album:* ${d.album || '-'}\n\n` +
                `${d.lyrics}`;
              await waha.sendText(chatId, lyricMsg);
            } else {
              await waha.sendText(chatId, `⚠️ Lirik lagu *${args}* tidak ditemukan.`);
            }
          } catch (err) {
            console.error(err);
            await waha.sendText(chatId, '⚠️ Gagal mengambil lirik lagu.');
          }
          break;
        }

        case '!animeimg': {
          if (!args) {
            await waha.sendText(chatId, '⚠️ Silakan masukkan prompt untuk gambar anime. Contoh: `!animeimg goku fighting`');
            break;
          }
          await waha.sendText(chatId, '🎨 _Sedang menggambar anime... Mohon tunggu_');
          try {
            const imgUrl = `https://prexzyapis.com/ai/anime?prompt=${encodeURIComponent(args)}`;
            await waha.sendImage(chatId, imgUrl, `Hasil gambar anime untuk prompt: "${args}"`);
          } catch (err) {
            console.error(err);
            await waha.sendText(chatId, '⚠️ Gagal menghasilkan gambar anime.');
          }
          break;
        }

        case '!realisticimg': {
          if (!args) {
            await waha.sendText(chatId, '⚠️ Silakan masukkan prompt untuk gambar realistis. Contoh: `!realisticimg futuristic city`');
            break;
          }
          await waha.sendText(chatId, '🎨 _Sedang menggambar realistis... Mohon tunggu_');
          try {
            const imgUrl = `https://prexzyapis.com/ai/realistic?prompt=${encodeURIComponent(args)}`;
            await waha.sendImage(chatId, imgUrl, `Hasil gambar realistis untuk prompt: "${args}"`);
          } catch (err) {
            console.error(err);
            await waha.sendText(chatId, '⚠️ Gagal menghasilkan gambar realistis.');
          }
          break;
        }

        case '!cat': {
          try {
            await waha.sendImage(chatId, 'https://prexzyapis.com/random/cat', '🐱 Kucing lucu!');
          } catch (err) {
            console.error(err);
            await waha.sendText(chatId, '⚠️ Gagal mengirim gambar kucing.');
          }
          break;
        }

        case '!dog': {
          try {
            await waha.sendImage(chatId, 'https://prexzyapis.com/random/dog', '🐶 Anjing lucu!');
          } catch (err) {
            console.error(err);
            await waha.sendText(chatId, '⚠️ Gagal mengirim gambar anjing.');
          }
          break;
        }

        case '!waifu': {
          try {
            await waha.sendImage(chatId, 'https://prexzyapis.com/random/waifu', '✨ Waifu kamu!');
          } catch (err) {
            console.error(err);
            await waha.sendText(chatId, '⚠️ Gagal mengirim gambar waifu.');
          }
          break;
        }

        case '!car': {
          try {
            await waha.sendImage(chatId, 'https://prexzyapis.com/random/car', '🏎️ Mobil keren!');
          } catch (err) {
            console.error(err);
            await waha.sendText(chatId, '⚠️ Gagal mengirim gambar mobil.');
          }
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
  } finally {
    // Stop typing presence
    await waha.stopTyping(chatId);
  }
}
