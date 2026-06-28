import { WahaClient } from './waha.js';
import * as generalCmds from './commands/general.js';
import * as aiCmds from './commands/ai.js';
import * as downloaderCmds from './commands/downloader.js';
import * as funCmds from './commands/fun.js';

const waha = new WahaClient();

// Command Registry Map
const commands = new Map();

// Helper to register commands and aliases
function register(cmdObj) {
  if (cmdObj.name) {
    commands.set(cmdObj.name.toLowerCase(), cmdObj);
  }
  if (cmdObj.aliases) {
    for (const alias of cmdObj.aliases) {
      commands.set(alias.toLowerCase(), cmdObj);
    }
  }
}

// Register all commands from modular files
Object.values(generalCmds).forEach(register);
Object.values(aiCmds).forEach(register);
Object.values(downloaderCmds).forEach(register);
Object.values(funCmds).forEach(register);

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
  if (!payload) {
    return;
  }

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
    // Command Router
    if (messageBody.startsWith('!')) {
      const parts = messageBody.split(' ');
      const commandName = parts[0].toLowerCase();
      const args = parts.slice(1).join(' ');

      const command = commands.get(commandName);
      if (command) {
        await command.execute(chatId, args, waha, commandName);
      } else {
        await waha.sendText(chatId, `⚠️ Perintah *${commandName}* tidak dikenali. Ketik *!help* untuk melihat perintah yang tersedia.`);
      }
    } else {
      // Normal conversational triggers (keyword matching)
      const lowerBody = messageBody.toLowerCase();

      if (lowerBody.includes('halo') || lowerBody.includes('hello') || lowerBody.includes('hi') || lowerBody.includes('hey')) {
        await waha.sendText(chatId, '👋 Halo! Saya Aris Bot. Ada yang bisa saya bantu? Ketik *!help* untuk melihat daftar perintah.');
      } else if (lowerBody.includes('aris')) {
        await waha.sendText(chatId, '🙋‍♂️ Ya, saya Aris Bot! Siap membantu Anda kapan saja. Ketik *!help* untuk memandu Anda.');
      } else if (lowerBody === 'p' || lowerBody === 'ping') {
        await waha.sendText(chatId, 'Pong! Ketik *!help* untuk melihat perintah lengkap.');
      }
    }
  } catch (error) {
    console.error('Error handling webhook message:', error);
  } finally {
    // Stop typing presence
    await waha.stopTyping(chatId);
  }
}
