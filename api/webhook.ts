import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateSignature, messagingApi } from '@line/bot-sdk';
import type { WebhookEvent } from '@line/bot-sdk';
import { chat } from '../lib/gemini';
import { fetchFAQ } from '../lib/sheet';

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? '',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const signature = req.headers['x-line-signature'] as string;

  if (!validateSignature(rawBody, process.env.LINE_CHANNEL_SECRET ?? '', signature)) {
    console.error('[webhook] invalid signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const body = JSON.parse(rawBody.toString()) as { events: WebhookEvent[] };

  // ตอบ 200 ก่อนเสมอ ไม่งั้น LINE timeout แล้ว bot เงียบ
  res.status(200).json({ ok: true });

  try {
    const faq = await fetchFAQ();
    await Promise.all(
      body.events.map(async (event) => {
        if (event.type !== 'message' || event.message.type !== 'text') return;
        console.log('[webhook] message:', event.message.text);
        try {
          const reply = await chat(faq, event.message.text);
          console.log('[webhook] reply:', reply);
          await client.replyMessage({
            replyToken: event.replyToken,
            messages: [{ type: 'text', text: reply }],
          });
        } catch (err) {
          console.error('[replyMessage] error:', err);
        }
      })
    );
  } catch (err) {
    console.error('[handler] error:', err);
  }
}
