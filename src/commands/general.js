import axios from 'axios';

export const ping = {
  name: '!ping',
  description: 'Tes koneksi bot',
  async execute(chatId, args, waha) {
    await waha.sendText(chatId, '🏓 pong!');
  }
};

export const about = {
  name: '!about',
  description: 'Tentang bot ini',
  async execute(chatId, args, waha) {
    await waha.sendText(chatId, '🤖 *Aris Bot v1.1.0*\nSebuah WhatsApp bot sederhana yang ditenagai oleh WAHA HTTP API, Node.js, dan Prexzy APIs.');
  }
};

export const echo = {
  name: '!echo',
  description: 'Mengulangi teks Anda',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan teks yang ingin di-echo. Contoh: `!echo Halo Dunia`');
    } else {
      await waha.sendText(chatId, `🗣️ Anda berkata: ${args}`);
    }
  }
};

export const cuaca = {
  name: '!cuaca',
  description: 'Informasi cuaca kota',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan nama kota. Contoh: `!cuaca jakarta`');
      return;
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
  }
};

export const lyric = {
  name: '!lyric',
  aliases: ['!lirik'],
  description: 'Lirik lagu lengkap',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan judul lagu. Contoh: `!lyric bohemian rhapsody`');
      return;
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
  }
};

export const help = {
  name: '!help',
  description: 'Menampilkan menu bantuan',
  async execute(chatId, args, waha) {
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
      `• *!play / !lagu <judul>* - Cari & download lagu\n` +
      `• *!capcut <url>* - Download CapCut\n` +
      `• *!douyin <url>* - Download Douyin\n` +
      `• *!download / !aio <url>* - Download Multi-Platform\n\n` +
      `*Gambar Hewan & Hobi:*\n` +
      `• *!cat* / *!dog* - Gambar hewan acak\n` +
      `• *!waifu* - Gambar waifu acak\n` +
      `• *!car* - Gambar mobil acak\n\n` +
      `_Coba juga kirim pesan santai seperti 'halo' atau 'aris'!_`;
    await waha.sendText(chatId, helpText);
  }
};
