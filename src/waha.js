import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WAHA_API_URL = process.env.WAHA_API_URL || 'http://localhost:3000';
const WAHA_API_KEY = process.env.WAHA_API_KEY || '';
const WAHA_SESSION = process.env.WAHA_SESSION || 'default';
const WEBHOOK_URL = process.env.WEBHOOK_URL || '';

const client = axios.create({
  baseURL: WAHA_API_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(WAHA_API_KEY ? { 
      'X-Api-Key': WAHA_API_KEY,
      'Authorization': `Bearer ${WAHA_API_KEY}`
    } : {}),
  },
});

export class WahaClient {
  /**
   * Send a text message to a WhatsApp recipient.
   * @param {string} chatId - Recipient ID (e.g. "1234567890@c.us" or group JID)
   * @param {string} text - Message content
   */
  async sendText(chatId, text) {
    try {
      const response = await client.post('/api/sendText', {
        session: WAHA_SESSION,
        chatId: chatId,
        text: text,
      });
      return response.data;
    } catch (error) {
      console.error(`Error sending message to ${chatId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send a file (image, video, document, audio) to a WhatsApp recipient.
   * @param {string} chatId - Recipient ID
   * @param {string} fileUrl - Public URL of the file
   * @param {string} filename - Filename with extension (e.g. "image.jpg" or "video.mp4")
   * @param {string} [mimetype] - Optional MIME type (e.g. "image/jpeg", "video/mp4")
   * @param {string} [caption] - Optional text caption
   */
  async sendFile(chatId, fileUrl, filename, mimetype = '', caption = '') {
    try {
      const response = await client.post('/api/sendFile', {
        session: WAHA_SESSION,
        chatId: chatId,
        file: {
          url: fileUrl,
          filename: filename,
          ...(mimetype ? { mimetype } : {})
        },
        ...(caption ? { caption } : {})
      });
      return response.data;
    } catch (error) {
      console.error(`Error sending file to ${chatId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Check if the WhatsApp session exists and is connected.
   * @returns {Promise<string|null>} Session status (e.g. 'SCAN_QR_CODE', 'WORKING', 'FAILED', or null if not found)
   */
  async getSessionStatus() {
    try {
      const response = await client.get('/api/sessions');
      const sessions = response.data;
      const session = sessions.find((s) => s.name === WAHA_SESSION);
      return session ? session.status : null;
    } catch (error) {
      console.error('Error fetching sessions:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Start a session, configuring the webhook URL if provided.
   */
  async startSession() {
    try {
      console.log(`Starting session "${WAHA_SESSION}"...`);
      
      const config = {};
      if (WEBHOOK_URL) {
        config.webhooks = [
          {
            url: WEBHOOK_URL,
            events: ['message'],
          },
        ];
      }

      const response = await client.post('/api/sessions', {
        name: WAHA_SESSION,
        config: config,
      });
      
      console.log(`Session "${WAHA_SESSION}" start triggered successfully.`);
      return response.data;
    } catch (error) {
      console.error(`Error starting session "${WAHA_SESSION}":`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update an existing session configuration (e.g., webhook URL).
   */
  async updateSession() {
    try {
      console.log(`Updating configuration for session "${WAHA_SESSION}"...`);
      
      const config = {};
      if (WEBHOOK_URL) {
        config.webhooks = [
          {
            url: WEBHOOK_URL,
            events: ['message'],
          },
        ];
      }

      const response = await client.put(`/api/sessions/${WAHA_SESSION}`, {
        name: WAHA_SESSION,
        config: config,
      });
      
      console.log(`Session "${WAHA_SESSION}" updated successfully.`);
      return response.data;
    } catch (error) {
      console.error(`Error updating session "${WAHA_SESSION}":`, error.response?.data || error.message);
      throw error;
    }
  }
}
