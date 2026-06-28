# WA Aris Bot 🤖

A simple, lightweight, and structured WhatsApp chatbot built with Node.js, Express, and powered by the **WAHA (WhatsApp HTTP API)**.

This bot listens to incoming messages using webhooks, processes commands (like `!ping`, `!help`, `!joke`), and responds automatically.

---

## Features

- **Docker Ready**: Spin up WAHA in seconds using Docker Compose.
- **Auto-Initialization**: The bot automatically creates and starts a WAHA session on boot.
- **Command Router**: Built-in processor for prefix-based commands (e.g. starting with `!`).
- **Keyword Triggers**: Respond to conversational phrases like "halo" or "aris".
- **Health Dashboard**: Exposes a `/health` endpoint to check if the bot and WAHA session are up and running.

---

## Getting Started

### 1. Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

---

### 2. Running WAHA (WhatsApp HTTP API)

Start the WAHA instance by running the Docker Compose file:

```bash
docker-compose up -d
```

This will run WAHA in the background and expose the dashboard/Swagger UI on:
- **WAHA Dashboard**: [http://localhost:3000](http://localhost:3000)

**Next Steps on WAHA:**
1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Under the session (usually named `default`), scan the displayed QR code with your mobile WhatsApp app (**Linked Devices -> Link a Device**).

---

### 3. Setting Up the Bot

1. Open the project folder in your terminal.
2. Install the Node.js packages:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   # or for Linux/macOS: cp .env.example .env
   ```
4. Open the `.env` file and review the variables:
   - `PORT`: The port the bot server runs on (default: `8000`).
   - `WAHA_API_URL`: The URL of the WAHA container (default: `http://localhost:3000`).
   - `WEBHOOK_URL`: The URL where WAHA sends incoming events. For local development, see the **Testing Locally with Webhooks** section below.

---

### 4. Running the Bot

Start the bot in development mode (with hot reloading on changes):

```bash
npm run dev
```

For production, run:

```bash
npm start
```

---

## Testing Locally with Webhooks

WAHA needs a public URL or a direct path to send events (like incoming messages) to your bot. If running both the bot and WAHA locally, there are two ways to do this:

### Option A: Local Network (Same Machine)
If you run WAHA and the bot on the same machine without a proxy, you can set the `WEBHOOK_URL` in `.env` to your local network address that the container can reach. On Windows/Mac:
```env
WEBHOOK_URL=http://host.docker.internal:8000/webhook
```
On Linux, replace `host.docker.internal` with your computer's local IP address (e.g., `http://192.168.1.50:8000/webhook`).

### Option B: Using a Tunneling Tool (Recommended)
Use a tool like **ngrok** to create a secure tunnel to your local machine:
1. Install ngrok and run:
   ```bash
   ngrok http 8000
   ```
2. Copy the forwarding HTTPS URL provided by ngrok (e.g., `https://xxxx-xx.ngrok-free.app`).
3. Edit your `.env` file and set the `WEBHOOK_URL`:
   ```env
   WEBHOOK_URL=https://xxxx-xx.ngrok-free.app/webhook
   ```
4. Restart your bot (`npm run dev`). The bot will automatically notify WAHA of the updated webhook URL.

---

## Bot Commands

Once your session is active, try sending these commands to your linked WhatsApp account:

| Command | Action |
| --- | --- |
| `!help` | Displays the bot command menu |
| `!ping` | Replies with `🏓 pong!` |
| `!about` | Displays information about the bot |
| `!joke` | Replies with a random humor joke |
| `!echo <teks>` | Repeats the message back |

**Conversational Triggers:**
- Saying "halo", "hi", "hello", "hey" triggers a greeting.
- Mentioning "aris" triggers a personalized greeting.
