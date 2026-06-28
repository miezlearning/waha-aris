import express from 'express';
import dotenv from 'dotenv';
import { handleWebhookEvent } from './bot.js';
import { WahaClient } from './waha.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const waha = new WahaClient();

// Express middleware
app.use(express.json());

// Main webhook receiver endpoint
app.post('/webhook', (req, res) => {
  try {
    const event = req.body;
    
    // Log the received event name
    if (event && event.event) {
      console.log(`[Webhook] Received event: "${event.event}"`);
      
      // Process the event asynchronously so we can reply to WAHA immediately
      handleWebhookEvent(event).catch((err) => {
        console.error('[Bot Error] Failed to process webhook event:', err.message);
      });
    } else {
      console.log('[Webhook] Received unknown payload structure:', JSON.stringify(req.body));
    }

    // Always respond 200 OK immediately to acknowledge receipt
    res.status(200).send('OK');
  } catch (error) {
    console.error('[Webhook Error] Error processing route:', error);
    res.status(500).send('Internal Server Error');
  }
});

// A health check endpoint to verify bot and WAHA status
app.get('/health', async (req, res) => {
  try {
    const sessionStatus = await waha.getSessionStatus();
    res.json({
      status: 'UP',
      waha: {
        url: process.env.WAHA_API_URL || 'http://localhost:3000',
        session: process.env.WAHA_SESSION || 'default',
        status: sessionStatus || 'DISCONNECTED/NOT_FOUND',
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// Start Express server
app.listen(PORT, async () => {
  console.log(`=================================================`);
  console.log(`🚀 Aris Bot Webhook Server running on port ${PORT}`);
  console.log(`🔗 Webhook Endpoint: http://localhost:${PORT}/webhook`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`=================================================`);

  // Auto-initialize WAHA session on start
  try {
    const status = await waha.getSessionStatus();
    if (!status) {
      console.log('No active WAHA session found. Starting a new session...');
      await waha.startSession();
    } else {
      console.log(`WAHA Session "${process.env.WAHA_SESSION || 'default'}" status: "${status}"`);
      // Update the webhook configuration for the existing session
      await waha.updateSession();
      if (status !== 'WORKING' && status !== 'CONNECTED') {
        console.log(`⚠️ Session status is "${status}". If required, please open the WAHA Dashboard to scan the QR code.`);
      }
    }
  } catch (error) {
    console.log('⚠️ Could not auto-initialize WAHA session. Is WAHA running?');
    console.log('You can start it using "docker-compose up -d" before running the bot.');
  }
});
