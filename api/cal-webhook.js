/* Sparq Labs VSL — Cal.com -> Meta Conversions API bridge.
   Registered as a BOOKING_CREATED webhook on the "GTM Discovery w/ Nishkarsh" event
   (cal.com/shrinish/30mins). Sends a server-side "Schedule" event to Meta as a durable
   backup to the client-side Pixel Schedule event already fired in assets/vsl/vsl.js —
   the two use the SAME event_id (derived from the booking) so Meta dedupes them into one
   conversion, not two. Needs CAL_WEBHOOK_SECRET and META_PIXEL_ACCESS_TOKEN set as
   Vercel project env vars (never hardcode them here). */

const crypto = require('crypto');

const PIXEL_ID = '30046987718237213'; // SparqLab /VSL MeetingBook
const GRAPH_VERSION = 'v21.0';

function verifySignature(rawBody, signatureHeader, secret) {
  if (!secret) return false; // fail closed if the secret isn't configured
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const got = (signatureHeader || '').trim();
  if (got.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

function sha256Lower(value) {
  return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }

  // Vercel gives a parsed body by default; re-stringify it to verify the signature the
  // same way cal.com computed it (HMAC over the raw JSON string, our secret).
  const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  const sig = req.headers['x-cal-signature-256'];
  if (!verifySignature(bodyStr, sig, process.env.CAL_WEBHOOK_SECRET)) {
    res.status(401).json({ error: 'bad signature' });
    return;
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  if (payload.triggerEvent !== 'BOOKING_CREATED') { res.status(200).json({ skipped: payload.triggerEvent }); return; }

  const booking = payload.payload || {};
  const attendee = (booking.attendees && booking.attendees[0]) || {};
  const metadata = booking.metadata || booking.responses?.metadata || {};
  // fbp/fbc/event_id are passed through from the booker's browser via the Cal.com embed
  // `config.metadata` (see assets/vsl/vsl.js) so this event matches the same person/session
  // as the client-side Pixel Schedule event.
  const eventId = metadata.sparq_event_id || ('cal-' + booking.uid);

  const userData = {};
  if (attendee.email) userData.em = [sha256Lower(attendee.email)];
  if (metadata.fbp) userData.fbp = metadata.fbp;
  if (metadata.fbc) userData.fbc = metadata.fbc;
  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (clientIp) userData.client_ip_address = clientIp;
  if (req.headers['user-agent']) userData.client_user_agent = req.headers['user-agent'];

  const event = {
    event_name: 'Schedule',
    event_time: Math.floor(new Date(booking.startTime || Date.now()).getTime() / 1000),
    event_id: eventId,
    action_source: 'website',
    event_source_url: metadata.sparq_page_url || 'https://sparq-vsl-three.vercel.app/vsl',
    user_data: userData,
  };

  const token = process.env.META_PIXEL_ACCESS_TOKEN;
  if (!token) { res.status(500).json({ error: 'META_PIXEL_ACCESS_TOKEN not configured' }); return; }

  try {
    const resp = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: [event] }),
    });
    const out = await resp.json();
    res.status(resp.ok ? 200 : 502).json(out);
  } catch (e) {
    res.status(502).json({ error: String(e) });
  }
};
