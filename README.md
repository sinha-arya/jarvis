# J.A.R.V.I.S. — Personal AI Voice Assistant

A voice-controlled personal assistant with a sassy British personality, real-time voice conversation, and hands-free wake word activation — powered by Claude, running as a full-stack web app.

**Live demo:** https://jarvis-2ts5.onrender.com
*(Free-tier hosting — the first request may take 30-60 seconds while the server wakes up.)*

---

## Features

- **Real conversational AI** — powered by the Claude API, with a custom personality (dry-witted, confident, unmistakably British)
- **Natural voice output** — real AI-generated speech via ElevenLabs, with automatic fallback to the browser's built-in voice if the ElevenLabs quota is exhausted
- **Voice input** — tap the mic and talk, using the Web Speech API
- **Wake word activation** — say "Yo JARVIS," "Wake up JARVIS," or "JARVIS darling" to start listening hands-free
- **Conversation memory** — chat history persists across page refreshes
- **Live weather** — JARVIS can check real-time weather via the Open-Meteo API
- **Smart home control** — a control_smart_home tool; integrates with Home Assistant if configured
- **Tool-use architecture** — built on Claude's function-calling

---

## Tech Stack

- **Backend:** Node.js, Express
- **AI:** Anthropic Claude API (with tool use / function calling)
- **Voice output:** ElevenLabs Text-to-Speech API (with Web Speech API fallback)
- **Voice input:** Web Speech API (browser-native)
- **Frontend:** Vanilla HTML/CSS/JS — no build step, no framework
- **Smart home:** Home Assistant REST API (optional)
- **Hosting:** Render (free tier)

---

## Running It Locally

### 1. Prerequisites
- Node.js installed (nodejs.org)
- An Anthropic API key (console.anthropic.com/settings/keys)
- An ElevenLabs API key (elevenlabs.io) — free tier works

### 2. Set up environment variables
Copy server/.env.example to server/.env and fill in:
- ANTHROPIC_API_KEY
- ELEVENLABS_API_KEY
- ELEVENLABS_VOICE_ID

Note: free-tier ElevenLabs accounts can only use their own default voices via the API (e.g. Roger, Sarah, George, Daniel, Brian) — not community Voice Library voices, which require a paid plan.

### 3. Install and run
cd server
npm install
npm start

Open http://localhost:3001 in Chrome (voice input works best there).

---

## Deploying

Deployed on Render (render.com), free tier:

1. Push the repo to GitHub
2. Create a new Web Service on Render, connected to the repo
3. Root Directory: server | Build Command: npm install | Start Command: npm start
4. Add ANTHROPIC_API_KEY, ELEVENLABS_API_KEY, and ELEVENLABS_VOICE_ID as environment variables
5. Render auto-redeploys on every push to main

---

## Customizing the Personality

JARVIS's personality lives in server/server.js as the SYSTEM_PROMPT constant.
Wake word phrases live in public/index.html as the WAKE_PHRASES array.

---

## Known Limitations

- Voice input has inconsistent support in Safari/iOS — Chrome is recommended
- Free-tier ElevenLabs has a monthly quota; JARVIS falls back to browser voice once exhausted
- Free-tier Render spins down after inactivity, causing a delay on the first request
- Conversation history is stored per-browser, not synced across devices

---

## Ideas for Extending

- Add more tools (reminders, timers, calendar integration, search)
- Persist conversation history server-side
- Add streaming responses
- Deploy on a paid tier to eliminate cold-start delays
