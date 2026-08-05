// Smart home control tool.
//
// If you have Home Assistant (https://www.home-assistant.io/) running on your network,
// set HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN in server/.env and this will send
// real commands to your real devices via its REST API.
//
// If you don't have Home Assistant set up yet, this runs in "simulate" mode so you can
// still test the whole JARVIS conversation flow — it just logs what it *would* do.

async function runSmartHomeAction({ device, action, value }) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    console.log(`[SIMULATED] Smart home: ${action} -> "${device}"${value !== undefined ? ` (value: ${value})` : ''}`);
    return {
      simulated: true,
      message: `Simulated ${action} for "${device}". Connect Home Assistant in server/.env to control real devices.`,
    };
  }

  // Real Home Assistant integration.
  // This assumes you have an entity whose friendly name roughly matches `device`.
  // For a real setup you'll likely want a small mapping from spoken names -> entity_ids.
  const entityId = guessEntityId(device);
  const service = action === 'on' ? 'turn_on' : action === 'off' ? 'turn_off' : 'turn_on';
  const domain = entityId.split('.')[0];

  const body = { entity_id: entityId };
  if (action === 'set_brightness' && value !== undefined) {
    body.brightness_pct = value;
  }

  const resp = await fetch(`${haUrl}/api/services/${domain}/${service}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${haToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    throw new Error(`Home Assistant error ${resp.status}: ${await resp.text()}`);
  }

  return { simulated: false, entityId, action, value };
}

// Very naive name -> entity_id guesser. Replace with a real mapping for your home.
function guessEntityId(device) {
  const slug = device.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
  return `light.${slug}`;
}

module.exports = { runSmartHomeAction };
