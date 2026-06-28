import axios from 'axios';

/**
 * Clean URL by removing search queries for specific platforms to prevent signature/scrape errors.
 * Also converts long YouTube links to short format because Prexzy APIs YouTube downloader only supports short format.
 */
function cleanUrl(url, platformName) {
  try {
    if (platformName === 'YouTube') {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://youtu.be/${match[2]}`;
      }
    }
    const parsed = new URL(url);
    if (platformName === 'Instagram' || platformName === 'TikTok') {
      parsed.search = ''; // Remove all query parameters
    }
    return parsed.toString();
  } catch (e) {
    return url;
  }
}

/**
 * Helper to download and send media using direct scrapers and AIO fallback.
 */
async function downloadMedia(chatId, url, platformName, waha) {
  const cleanedUrl = cleanUrl(url, platformName);
  await waha.sendText(chatId, `⏳ _Sedang memproses unduhan dari ${platformName}... Mohon tunggu_`);
  
  let downloadUrl = '';
  let isVideo = true; // Default to video
  let captionText = `📥 Berhasil mengunduh dari ${platformName}!`;

  // 1. Try Platform-Specific Endpoints first (e.g. Instagram & YouTube direct scrapers are more stable with clean URLs)
  if (platformName === 'Instagram') {
    try {
      const response = await axios.get(`https://prexzyapis.com/download/instagram?url=${encodeURIComponent(cleanedUrl)}`, { timeout: 15000 });
      const resData = response.data;
      if (resData && resData.status && resData.data) {
        const d = resData.data;
        if (Array.isArray(d.url) && d.url.length > 0) {
          downloadUrl = d.url[0];
        } else if (typeof d.url === 'string') {
          downloadUrl = d.url;
        }
        if (d.isVideo !== undefined) {
          isVideo = d.isVideo;
        }
        if (d.caption) {
          captionText = d.caption;
        }
      }
    } catch (err) {
      console.error(`Instagram specific downloader failed, falling back:`, err.message);
    }
  } else if (platformName === 'YouTube') {
    try {
      const response = await axios.get(`https://prexzyapis.com/download/youtube-video?url=${encodeURIComponent(cleanedUrl)}`, { timeout: 15000 });
      const resData = response.data;
      if (resData && resData.status) {
        const d = resData.data || resData.result || resData;
        downloadUrl = d.url || d.download_url || d.link;
        isVideo = true;
      }
    } catch (err) {
      console.error(`YouTube specific downloader failed, falling back:`, err.message);
    }
  }

  // 2. Try AIO Downloader if we don't have a downloadUrl yet
  if (!downloadUrl) {
    try {
      const response = await axios.get(`https://prexzyapis.com/download/aio?url=${encodeURIComponent(cleanedUrl)}`, { timeout: 15000 });
      const data = response.data;
      
      if (data && data.status && data.medias && data.medias.length > 0) {
        let media = data.medias.find(m => m.type === 'video');
        if (!media) media = data.medias.find(m => m.type === 'image');
        if (!media) media = data.medias[0];
        
        downloadUrl = media.url;
        isVideo = (media.type === 'video');
      }
    } catch (err) {
      console.error(`AIO Downloader failed:`, err.message);
    }
  }

  // 3. Try Platform-Specific Fallbacks if AIO failed (except for Instagram which we already tried)
  if (!downloadUrl && platformName !== 'Instagram') {
    let endpoint = '';
    switch (platformName) {
      case 'TikTok':
        endpoint = 'tik';
        break;
      case 'Facebook':
        endpoint = 'facebook';
        break;
      case 'Pinterest':
        endpoint = 'pinterest';
        break;
      case 'Threads':
        endpoint = 'threads';
        break;
      case 'CapCut':
        endpoint = 'capcut';
        break;
      case 'Douyin':
        endpoint = 'douyin';
        break;
    }

    if (endpoint) {
      try {
        const response = await axios.get(`https://prexzyapis.com/download/${endpoint}?url=${encodeURIComponent(cleanedUrl)}`, { timeout: 15000 });
        const resData = response.data;
        if (resData && resData.status) {
          const d = resData.data || resData.result || resData;
          downloadUrl = d.url || d.video || d.link || (Array.isArray(d.urls) ? d.urls[0] : '');
        }
      } catch (err) {
        console.error(`${platformName} fallback downloader failed:`, err.message);
      }
    }
  }

  // 4. Send the media if found
  if (downloadUrl) {
    try {
      if (isVideo) {
        await waha.sendVideo(chatId, downloadUrl, captionText);
      } else {
        await waha.sendImage(chatId, downloadUrl, captionText);
      }
    } catch (sendErr) {
      console.error(`Error sending media to chat:`, sendErr.message);
      await waha.sendText(chatId, `⚠️ Gagal mengirim file media ke WhatsApp Anda.`);
    }
  } else {
    await waha.sendText(chatId, `⚠️ Gagal mengunduh media dari ${platformName}. Pastikan link valid, publik, dan coba lagi nanti.`);
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

export const play = {
  name: '!play',
  aliases: ['!lagu', '!song', '!music'],
  description: 'Cari & download musik dari YouTube',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan judul lagu yang ingin dicari. Contoh: `!play bohemian rhapsody`');
      return;
    }
    await waha.sendText(chatId, `🔍 _Mencari lagu "${args}" di YouTube..._`);
    
    try {
      // 1. Cari video di YouTube
      const searchResponse = await axios.get(`https://prexzyapis.com/search/youtube?q=${encodeURIComponent(args)}`, { timeout: 15000 });
      const searchData = searchResponse.data;
      
      if (!searchData || !searchData.status || !searchData.data || searchData.data.length === 0) {
        await waha.sendText(chatId, `⚠️ Lagu "${args}" tidak ditemukan di YouTube.`);
        return;
      }
      
      const firstResult = searchData.data[0];
      const rawVideoUrl = firstResult.link;
      const title = firstResult.title;
      const channel = firstResult.channel;
      const duration = firstResult.duration;
      
      // Convert to short YouTube URL format to avoid API regex failures
      const cleanedUrl = cleanUrl(rawVideoUrl, 'YouTube');
      
      await waha.sendText(chatId, `🎵 *Menemukan:* ${title}\n👤 *Channel:* ${channel}\n⏱️ *Durasi:* ${duration}\n\n⏳ _Sedang memproses audio... Mohon tunggu_`);
      
      let downloadUrl = '';
      
      // 2. Coba YouTube Audio Downloader khusus (dengan URL pendek)
      try {
        const response = await axios.get(`https://prexzyapis.com/download/youtube-audio?url=${encodeURIComponent(cleanedUrl)}`, { timeout: 20000 });
        const resData = response.data;
        if (resData && resData.status) {
          const d = resData.data || resData.result || resData;
          const tempUrl = d.url || d.download_url || d.link;
          if (tempUrl && !tempUrl.includes('undefined')) {
            downloadUrl = tempUrl;
          }
        }
      } catch (err) {
        console.error('YouTube specific audio downloader failed:', err.message);
      }
      
      // 3. Cadangan 1: Coba SoundCloud
      if (!downloadUrl) {
        console.log('YouTube audio downloader failed, trying SoundCloud fallback...');
        try {
          const scResponse = await axios.get(`https://prexzyapis.com/search/soundcloud?q=${encodeURIComponent(args)}`, { timeout: 10000 });
          const scData = scResponse.data;
          
          if (scData && scData.status && scData.data && scData.data.length > 0) {
            const track = scData.data[0];
            const trackUrl = track.url;
            const scDlResponse = await axios.get(`https://prexzyapis.com/download/soundcloud?url=${encodeURIComponent(trackUrl)}`, { timeout: 15000 });
            const scDlData = scDlResponse.data;
            if (scDlData && scDlData.status && scDlData.data && scDlData.data.audio_url) {
              downloadUrl = scDlData.data.audio_url;
            }
          }
        } catch (scErr) {
          console.error('SoundCloud fallback failed:', scErr.message);
        }
      }
      
      // 4. Cadangan 2: Coba AIO Downloader (menggunakan google redirector)
      if (!downloadUrl) {
        console.log('SoundCloud fallback failed, trying YouTube AIO fallback...');
        try {
          const aioResponse = await axios.get(`https://prexzyapis.com/download/aio?url=${encodeURIComponent(cleanedUrl)}`, { timeout: 15000 });
          const aioData = aioResponse.data;
          if (aioData && aioData.status && aioData.medias && aioData.medias.length > 0) {
            let media = aioData.medias.find(m => m.type === 'audio');
            if (media) {
              downloadUrl = media.url;
            }
          }
        } catch (aioErr) {
          console.error('AIO Downloader failed:', aioErr.message);
        }
      }
      
      // 5. Kirim berkas audio
      if (downloadUrl) {
        await waha.sendAudio(chatId, downloadUrl);
        await waha.sendText(chatId, `🎧 Selamat mendengarkan *${title}*!`);
      } else {
        await waha.sendText(chatId, '⚠️ Gagal memproses audio untuk lagu ini. Silakan coba judul lain.');
      }
    } catch (err) {
      console.error(err);
      await waha.sendText(chatId, '⚠️ Terjadi kesalahan saat memproses lagu.');
    }
  }
};
