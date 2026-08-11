// Stripe-webhook: Stripe roept dit aan als de betaling van status verandert.
// We verifiëren de handtekening en zetten de order pas op 'paid' als Stripe
// bevestigt dat er echt betaald is. Dit is de bron van waarheid voor de betaalmuur.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[payment-webhook] Ontbrekende server-configuratie.');
    return new Response('not configured', { status: 500 });
  }

  const sig = req.headers.get('stripe-signature') || '';
  const rawBody = await req.text();

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (e: any) {
    console.error('[payment-webhook] Ongeldige handtekening:', e?.message || e);
    return new Response('invalid signature', { status: 400 });
  }

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === 'paid') {
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
      const { error } = await supabase
        .from('payments')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('stripe_session_id', session.id);
      if (error) console.error('[payment-webhook] Order bijwerken mislukt:', error.message);
    }
  }

  return new Response('ok', { status: 200 });
};
