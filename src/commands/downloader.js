import axios from 'axios';

/**
 * Helper to download and send media from AIO downloader.
 */
async function downloadMedia(chatId, url, platformName, waha) {
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

export const tiktok = {
  name: '!tiktok',
  aliases: ['!tt'],
  description: 'Download TikTok',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan link TikTok. Contoh: `!tiktok https://www.tiktok.com/...`');
      return;
    }
    await downloadMedia(chatId, args, 'TikTok', waha);
  }
};

export const youtube = {
  name: '!youtube',
  aliases: ['!yt'],
  description: 'Download YouTube',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan link YouTube. Contoh: `!youtube https://www.youtube.com/...`');
      return;
    }
    await downloadMedia(chatId, args, 'YouTube', waha);
  }
};

export const instagram = {
  name: '!instagram',
  aliases: ['!ig'],
  description: 'Download Instagram',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan link Instagram. Contoh: `!instagram https://www.instagram.com/...`');
      return;
    }
    await downloadMedia(chatId, args, 'Instagram', waha);
  }
};

export const facebook = {
  name: '!facebook',
  aliases: ['!fb'],
  description: 'Download Facebook',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan link Facebook. Contoh: `!facebook https://www.facebook.com/...`');
      return;
    }
    await downloadMedia(chatId, args, 'Facebook', waha);
  }
};

export const pinterest = {
  name: '!pinterest',
  aliases: ['!pin'],
  description: 'Download Pinterest',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan link Pinterest. Contoh: `!pinterest https://id.pinterest.com/...`');
      return;
    }
    await downloadMedia(chatId, args, 'Pinterest', waha);
  }
};

export const threads = {
  name: '!threads',
  description: 'Download Threads',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan link Threads. Contoh: `!threads https://www.threads.net/...`');
      return;
    }
    await downloadMedia(chatId, args, 'Threads', waha);
  }
};

export const capcut = {
  name: '!capcut',
  description: 'Download CapCut',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan link CapCut. Contoh: `!capcut https://www.capcut.com/...`');
      return;
    }
    await downloadMedia(chatId, args, 'CapCut', waha);
  }
};

export const douyin = {
  name: '!douyin',
  description: 'Download Douyin',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan link Douyin. Contoh: `!douyin https://v.douyin.com/...`');
      return;
    }
    await downloadMedia(chatId, args, 'Douyin', waha);
  }
};

export const aio = {
  name: '!download',
  aliases: ['!aio'],
  description: 'Download Multi-Platform',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan link media yang ingin diunduh. Contoh: `!download https://...`');
      return;
    }
    await downloadMedia(chatId, args, 'AIO Downloader', waha);
  }
};

export const spotify = {
  name: '!spotify',
  description: 'Download Spotify',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan link Spotify. Contoh: `!spotify https://open.spotify.com/track/...`');
      return;
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
  }
};
