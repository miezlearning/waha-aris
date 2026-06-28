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
 * Helper to download and send media from AIO downloader.
 */
async function downloadMedia(chatId, url, platformName) {
  await waha.sendText(chatId, `⏳ _Sedang memproses unduhan dari ${platformName}... Mohon tunggu_`);
  try {
    const response = await axios.get(`https://prexzyapis.com/download/aio?url=${encodeURIComponent(url)}`);
    const data = response.data;
    
    if (data && data.status && data.medias && data.medias.length > 0) {
      // Find the first working media
      let media = data.medias.find(m => m.type === 'video');
      if (!media) media = data.medias.find(m => m.type === 'image');
      if (!media) media = data.medias[0];
      
      const mediaUrl = media.url;
      const type = media.type;
      
      if (type === 'video') {
        await waha.sendVideo(chatId, mediaUrl, `📥 Berhasil mengunduh video dari ${platformName}!`);
      } else if (type === 'image') {
        await waha.sendImage(chatId, mediaUrl, `📥 Berhasil mengunduh gambar dari ${platformName}!`);
      } else if (type === 'audio') {
        await waha.sendAudio(chatId, mediaUrl);
      } else {
        await waha.sendText(chatId, `⚠️ Format media tidak didukung.`);
      }
    } else {
      await waha.sendText(chatId, `⚠️ Gagal memproses link ${platformName}. Pastikan link valid dan bersifat publik.`);
    }
  } catch (err) {
    console.error(err);
    await waha.sendText(chatId, `⚠️ Terjadi kesalahan saat mengunduh dari ${platformName}.`);
  }
}

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
            `*Informasi & Hiburan:*\n` +
            `• *!help* - Menampilkan menu ini\n` +
            `• *!ping* - Tes koneksi bot\n` +
            `• *!about* - Tentang bot ini\n` +
            `• *!echo <teks>* - Mengulangi teks Anda\n` +
            `• *!joke* - Humor acak\n` +
            `• *!cuaca <kota>* - Info cuaca kota\n` +
            `• *!lyric <judul>* - Lirik lagu\n\n` +
            `*Kecerdasan Buatan (AI):*\n` +
            `• *!ai / !deepseek <tanya>* - Tanya AI\n` +
            `• *!animeimg <prompt>* - Gambar anime AI\n` +
            `• *!realisticimg <prompt>* - Gambar realistis AI\n\n` +
            `*Media Downloader:*\n` +
            `• *!tiktok / !tt <url>* - Download TikTok\n` +
            `• *!youtube / !yt <url>* - Download YouTube\n` +
            `• *!instagram / !ig <url>* - Download Instagram\n` +
            `• *!facebook / !fb <url>* - Download Facebook\n` +
            `• *!pinterest / !pin <url>* - Download Pinterest\n` +
            `• *!threads <url>* - Download Threads\n` +
            `• *!spotify <url>* - Download Spotify\n` +
            `• *!capcut <url>* - Download CapCut\n` +
            `• *!douyin <url>* - Download Douyin\n` +
            `• *!download / !aio <url>* - Download Multi-Platform\n\n` +
            `*Gambar Hewan & Hobi:*\n` +
            `• *!cat* / *!dog* - Gambar hewan acak\n` +
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

        case '!tiktok':
        case '!tt': {
          if (!args) {
            await waha.sendText(chatId, '⚠️ Silakan masukkan link TikTok. Contoh: `!tiktok https://www.tiktok.com/...`');
            break;
          }
          await downloadMedia(chatId, args, 'TikTok');
          break;
        }

        case '!youtube':
        case '!yt': {
          if (!args) {
            await waha.sendText(chatId, '⚠️ Silakan masukkan link YouTube. Contoh: `!youtube https://www.youtube.com/...`');
            break;
          }
          await downloadMedia(chatId, args, 'YouTube');
          break;
        }

        case '!instagram':
        case '!ig': {
          if (!args) {
            await waha.sendText(chatId, '⚠️ Silakan masukkan link Instagram. Contoh: `!instagram https://www.instagram.com/...`');
            break;
          }
          await downloadMedia(chatId, args, 'Instagram');
          break;
        }

        case '!facebook':
        case '!fb': {
          if (!args) {
            await waha.sendText(chatId, '⚠️ Silakan masukkan link Facebook. Contoh: `!facebook https://www.facebook.com/...`');
            break;
          }
          await downloadMedia(chatId, args, 'Facebook');
          break;
        }

        case '!pinterest':
        case '!pin': {
          if (!args) {
            await waha.sendText(chatId, '⚠️ Silakan masukkan link Pinterest. Contoh: `!pinterest https://id.pinterest.com/...`');
            break;
          }
          await downloadMedia(chatId, args, 'Pinterest');
          break;
        }

        case '!threads': {
          if (!args) {
            await waha.sendText(chatId, '⚠️ Silakan masukkan link Threads. Contoh: `!threads https://www.threads.net/...`');
            break;
          }
          await downloadMedia(chatId, args, 'Threads');
          break;
        }

        case '!capcut': {
          if (!args) {
            await waha.sendText(chatId, '⚠️ Silakan masukkan link CapCut. Contoh: `!capcut https://www.capcut.com/...`');
            break;
          }
          await downloadMedia(chatId, args, 'CapCut');
          break;
        }

        case '!douyin': {
          if (!args) {
            await waha.sendText(chatId, '⚠️ Silakan masukkan link Douyin. Contoh: `!douyin https://v.douyin.com/...`');
            break;
          }
          await downloadMedia(chatId, args, 'Douyin');
          break;
        }

        case '!aio':
        case '!download': {
          if (!args) {
            await waha.sendText(chatId, '⚠️ Silakan masukkan link media yang ingin diunduh. Contoh: `!download https://...`');
            break;
          }
          await downloadMedia(chatId, args, 'AIO Downloader');
          break;
        }

        case '!spotify': {
          if (!args) {
            await waha.sendText(chatId, '⚠️ Silakan masukkan link Spotify. Contoh: `!spotify https://open.spotify.com/track/...`');
            break;
          }
          await waha.sendText(chatId, '⏳ _Sedang memproses musik Spotify... Mohon tunggu (proses ini memakan waktu sekitar 15-30 detik)_');
          try {
            // Coba Spotify V2 dahulu
            let response = await axios.get(`https://prexzyapis.com/download/spotifyv2?url=${encodeURIComponent(args)}`, { timeout: 30000 });
            let data = response.data;
            
            let downloadUrl = '';
            let title = 'Spotify Music';
            
            if (data && data.status) {
              if (data.result) {
                downloadUrl = data.result.download_url || data.result.link || data.result.url;
                title = data.result.title || title;
              } else if (data.data) {
                downloadUrl = data.data.download || data.data.url || data.data.link;
                title = data.data.title || title;
              }
            }
            
            // Jika V2 gagal, coba V1
            if (!downloadUrl) {
              response = await axios.get(`https://prexzyapis.com/download/spotify?url=${encodeURIComponent(args)}`, { timeout: 30000 });
              data = response.data;
              if (data && data.status) {
                if (data.result) {
                  downloadUrl = data.result.download_url || data.result.link || data.result.url;
                  title = data.result.title || title;
                } else if (data.data) {
                  downloadUrl = data.data.download || data.data.url || data.data.link;
                  title = data.data.title || title;
                }
              }
            }
            
            if (downloadUrl) {
              await waha.sendAudio(chatId, downloadUrl);
              await waha.sendText(chatId, `🎵 Berhasil mengunduh lagu Spotify: *${title}*!`);
            } else {
              await waha.sendText(chatId, '⚠️ Gagal mengunduh musik dari Spotify. Pastikan link Spotify valid.');
            }
          } catch (err) {
            console.error(err);
            await waha.sendText(chatId, '⚠️ Terjadi kesalahan atau server Spotify sedang sibuk. Silakan coba lagi nanti.');
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
