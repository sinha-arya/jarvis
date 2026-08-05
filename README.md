# J.A.R.V.I.S. — Personal AI Assistant

A voice-controlled personal assistant, powered by Claude, that runs as a local web app you
can use from your phone or computer. Talk to it, it talks back, and it can control smart
home devices (via Home Assistant, if you have it).

**What this is:** a real, working assistant with conversation, voice in/out, and a tool-use
system it can extend with more skills over time.

**What this isn't:** the holographic AR interface from the movies — that doesn't exist yet
for anyone. This is the practical version: same idea (an AI you talk to that helps run your
life), delivered as a web app.

---

## 1. What you need before starting

- A computer (Mac, Windows, or Linux) to run the server on.
- [Node.js](https://nodejs.org) installed (download the "LTS" version, then just click through
  the installer). To check it worked, open a terminal and run:
  ```
  node -v
  ```
  If you see a version number like `v22.x.x`, you're good.
- An Anthropic API key. Get one at https://console.anthropic.com/settings/keys (you'll need
  to add billing — this is a pay-as-you-go API, separate from a claude.ai subscription).
- A phone or computer with a modern browser (Chrome works best for voice — see the Known
  Limitations section below).

## 2. Set up your API key

1. Open the `server` folder.
2. Find the file `.env.example`. Make a copy of it in the same folder, and rename the copy to
   `.env` (just `.env`, no "example").
3. Open `.env` in any text editor and paste your API key after the `=` sign:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ```
4. Save the file.

(Leave `HOME_ASSISTANT_URL` and `HOME_ASSISTANT_TOKEN` blank for now — see the Smart Home
section below for that.)

## 3. Install and run

Open a terminal, navigate into the `server` folder, and run:

```bash
cd server
npm install
npm start
```

You should see:

```
🤖 JARVIS server running.
   On this computer: http://localhost:3001
   On your phone (same WiFi): http://<this-computer's-LAN-IP>:3001
```

## 4. Open JARVIS

- **On the same computer:** open http://localhost:3001 in Chrome.
- **On your phone:** your phone and computer need to be on the **same WiFi network**. Find
  your computer's local IP address:
  - Mac: System Settings → WiFi → Details → shows an address like `192.168.1.42`
  - Windows: open Command Prompt, run `ipconfig`, look for "IPv4 Address"
  - Then on your phone's browser, go to `http://192.168.1.42:3001` (using your real IP).
- Tap "Add to Home Screen" in your phone browser's menu so it launches like an app.

Tap the mic button, say something, and JARVIS should respond out loud.

## 5. Smart home control (optional)

JARVIS can control real devices if you're running [Home Assistant](https://www.home-assistant.io/)
on your network (a free, popular home automation hub — separate project, separate setup).
If you have it:

1. In Home Assistant, create a Long-Lived Access Token (Profile → Security → Long-lived
   access tokens).
2. Put your Home Assistant URL and token in `server/.env`.
3. Edit `server/tools/smartHome.js` — the `guessEntityId` function is a placeholder that
   guesses entity IDs from device names. Replace it with a real mapping to your actual
   entity IDs (found in Home Assistant under Settings → Devices & Services → Entities) for
   reliable control.

Without Home Assistant configured, JARVIS runs in **simulated mode** — it'll say it turned
your lights on/off but won't control anything real. Good for testing the conversation flow.

## 6. Customize JARVIS's personality

Open `server/server.js` and edit the `SYSTEM_PROMPT` constant near the top. This is JARVIS's
"personality instructions" — change the tone, add things it should know about you, etc.

## Known limitations

- **Voice input works best in Chrome** (desktop or Android). Safari/iOS has limited support
  for the browser's speech recognition API — if the mic doesn't work on iPhone, use the text
  box instead, which works everywhere.
- Each message currently sends the whole conversation to Claude, so very long conversations
  cost more and eventually will need trimming — fine for normal use.
- This is a local-network app, not deployed to the internet. If you want to reach it from
  outside your home WiFi, you'd deploy the `server` folder to a host like Railway or Render
  (a good next step, not covered here).

## Project structure

```
jarvis/
  server/
    server.js          <- main backend: talks to Claude, runs tools
    tools/smartHome.js  <- smart home control logic
    .env                <- your API key (you create this)
    package.json
  public/
    index.html          <- the entire frontend: voice, chat, styling
  README.md
```

## Ideas for extending it

- Add more tools in `server.js` (e.g. `get_weather`, `set_reminder`, `send_message`).
- Add a wake word so you don't have to tap the mic (look up `Porcupine` by Picovoice).
- Persist conversation history to a file so JARVIS remembers across restarts.
- Deploy the server online (Railway/Render) so it works away from home WiFi too.
