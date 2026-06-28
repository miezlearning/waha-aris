// List of simple jokes
const JOKES = [
  "Kenapa sepiring nasi goreng rasanya gurih? Karena dicampur cinta... dan sedikit MSG.",
  "Kenapa HP kalau jatuh layar pecah? Soalnya kalau jatuh cinta hati yang pecah.",
  "Pekerjaan apa yang kalau dikerjakan malah makin berat? Mengangkat beban hidup.",
  "Kenapa burung terbang ke selatan saat musim dingin? Soalnya kalau jalan kaki kejauhan.",
  "Gajah apa yang belalainya pendek? Gajah pesek."
];

export const joke = {
  name: '!joke',
  description: 'Humor acak',
  async execute(chatId, args, waha) {
    const randomJoke = JOKES[Math.floor(Math.random() * JOKES.length)];
    await waha.sendText(chatId, `🤪 *Humor Hari Ini:*\n\n${randomJoke}`);
  }
};

export const cat = {
  name: '!cat',
  description: 'Gambar kucing acak',
  async execute(chatId, args, waha) {
    try {
      await waha.sendImage(chatId, 'https://prexzyapis.com/random/cat', '🐱 Kucing lucu!');
    } catch (err) {
      console.error(err);
      await waha.sendText(chatId, '⚠️ Gagal mengirim gambar kucing.');
    }
  }
};

export const dog = {
  name: '!dog',
  description: 'Gambar anjing acak',
  async execute(chatId, args, waha) {
    try {
      await waha.sendImage(chatId, 'https://prexzyapis.com/random/dog', '🐶 Anjing lucu!');
    } catch (err) {
      console.error(err);
      await waha.sendText(chatId, '⚠️ Gagal mengirim gambar anjing.');
    }
  }
};

export const waifu = {
  name: '!waifu',
  description: 'Gambar waifu acak',
  async execute(chatId, args, waha) {
    try {
      await waha.sendImage(chatId, 'https://prexzyapis.com/random/waifu', '✨ Waifu kamu!');
    } catch (err) {
      console.error(err);
      await waha.sendText(chatId, '⚠️ Gagal mengirim gambar waifu.');
    }
  }
};

export const car = {
  name: '!car',
  description: 'Gambar mobil acak',
  async execute(chatId, args, waha) {
    try {
      await waha.sendImage(chatId, 'https://prexzyapis.com/random/car', '🏎️ Mobil keren!');
    } catch (err) {
      console.error(err);
      await waha.sendText(chatId, '⚠️ Gagal mengirim gambar mobil.');
    }
  }
};
