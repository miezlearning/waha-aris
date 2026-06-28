import axios from 'axios';

export const deepseek = {
  name: '!deepseek',
  aliases: ['!ai'],
  description: 'Tanya AI DeepSeek R1',
  async execute(chatId, args, waha, commandName) {
    if (!args) {
      await waha.sendText(chatId, `⚠️ Silakan masukkan pertanyaan setelah perintah. Contoh: \`${commandName} siapa penemu listrik?\``);
      return;
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
  }
};

export const animeimg = {
  name: '!animeimg',
  description: 'Gambar anime AI',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan prompt untuk gambar anime. Contoh: `!animeimg goku fighting`');
      return;
    }
    await waha.sendText(chatId, '🎨 _Sedang menggambar anime... Mohon tunggu_');
    try {
      const imgUrl = `https://prexzyapis.com/ai/anime?prompt=${encodeURIComponent(args)}`;
      await waha.sendImage(chatId, imgUrl, `Hasil gambar anime untuk prompt: "${args}"`);
    } catch (err) {
      console.error(err);
      await waha.sendText(chatId, '⚠️ Gagal menghasilkan gambar anime.');
    }
  }
};

export const realisticimg = {
  name: '!realisticimg',
  description: 'Gambar realistis AI',
  async execute(chatId, args, waha) {
    if (!args) {
      await waha.sendText(chatId, '⚠️ Silakan masukkan prompt untuk gambar realistis. Contoh: `!realisticimg futuristic city`');
      return;
    }
    await waha.sendText(chatId, '🎨 _Sedang menggambar realistis... Mohon tunggu_');
    try {
      const imgUrl = `https://prexzyapis.com/ai/realistic?prompt=${encodeURIComponent(args)}`;
      await waha.sendImage(chatId, imgUrl, `Hasil gambar realistis untuk prompt: "${args}"`);
    } catch (err) {
      console.error(err);
      await waha.sendText(chatId, '⚠️ Gagal menghasilkan gambar realistis.');
    }
  }
};
