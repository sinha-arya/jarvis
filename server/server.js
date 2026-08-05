// JARVIS backend server
// Talks to the Claude API, holds your API key safely (never sent to the browser),
// and executes "tools" like smart home control on Claude's behalf.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { runSmartHomeAction } = require('./tools/smartHome');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-6';

if (!ANTHROPIC_API_KEY) {
  console.warn('\n⚠️  No ANTHROPIC_API_KEY found in server/.env — JARVIS will not be able to think yet.\n   Copy server/.env.example to server/.env and add your key.\n');
}

// The personality. Tweak this however you like.
const SYSTEM_PROMPT = `You are JARVIS, a personal AI assistant. You are helpful, dry-witted,
unflappable, and address the user respectfully but informally. Keep spoken responses fairly
short and conversational (a few sentences at most) since they will be read aloud with
text-to-speech — avoid long lists, markdown, or code blocks unless the user specifically
asks for something to read on screen. If the user asks you to control a smart home device,
use the control_smart_home tool. If they ask for the time, use get_current_time.`;

// Tools Claude is allowed to call.
const TOOLS = [
  {
    name: 'control_smart_home',
    description:
      'Control a smart home device: turn lights or devices on/off, set brightness, etc. ' +
      'Use this whenever the user asks to control something in their home.',
    input_schema: {
      type: 'object',
      properties: {
        device: { type: 'string', description: 'Name of the device/room, e.g. "living room lights", "bedroom fan"' },
        action: { type: 'string', enum: ['on', 'off', 'set_brightness'], description: 'What to do to the device' },
        value: { type: 'number', description: 'Optional value, e.g. brightness percent 0-100' },
      },
      required: ['device', 'action'],
    },
  },
  {
    name: 'get_current_time',
    description: "Get the current date and time in the user's local timezone.",
    input_schema: { type: 'object', properties: {} },
  },
];

async function callClaude(messages) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errText}`);
  }
  return response.json();
}

function extractText(content) {
  return content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

// POST /api/chat  { messages: [{role, content}, ...] }
// Returns { reply: "text to speak/display", messages: [...updated full history...] }
app.post('/api/chat', async (req, res) => {
  try {
    let messages = req.body.messages || [];
    let data = await callClaude(messages);

    // Handle tool use loop: Claude may call a tool, we run it, send the result back,
    // and Claude gives a final natural-language reply.
    let safetyCounter = 0;
    while (data.stop_reason === 'tool_use' && safetyCounter < 4) {
      safetyCounter++;
      messages = [...messages, { role: 'assistant', content: data.content }];

      const toolResults = [];
      for (const block of data.content) {
        if (block.type === 'tool_use') {
          let result;
          try {
            if (block.name === 'control_smart_home') {
              result = await runSmartHomeAction(block.input);
            } else if (block.name === 'get_current_time') {
              result = { time: new Date().toString() };
            } else {
              result = { error: `Unknown tool: ${block.name}` };
            }
          } catch (err) {
            result = { error: err.message };
          }
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }
      }

      messages = [...messages, { role: 'user', content: toolResults }];
      data = await callClaude(messages);
    }

    messages = [...messages, { role: 'assistant', content: data.content }];
    const reply = extractText(data.content) || '(No response text.)';

    res.json({ reply, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🤖 JARVIS server running.`);
  console.log(`   On this computer: http://localhost:${PORT}`);
  console.log(`   On your phone (same WiFi): http://<this-computer's-LAN-IP>:${PORT}\n`);
});
