// Maakt een Stripe Checkout-sessie voor de eenmalige toegang (€3,99).
// De geheime Stripe-sleutel staat alleen hier (server-side). We maken eerst een
// 'payments'-rij (order) aan; die order wordt pas op 'paid' gezet door de webhook
// nadat Stripe de betaling bevestigt. Zo is de betaalstatus server-geverifieerd.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DEFAULT_BASE = process.env.PUBLIC_BASE_URL || 'https://rsolve.app';
const AMOUNT_CENTS = 399; // €3,99

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[create-checkout] Ontbrekende server-configuratie.');
    return new Response(JSON.stringify({ error: 'not configured' }), { status: 500, headers: CORS });
  }

  let origin = DEFAULT_BASE;
  try {
    const body = await req.json();
    if (typeof body?.origin === 'string' && /^https?:\/\//i.test(body.origin)) origin = body.origin;
  } catch { /* body is optioneel */ }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const stripe = new Stripe(STRIPE_SECRET_KEY);

  try {
    // 1. Order aanmaken (status 'open')
    const { data: order, error: orderError } = await supabase
      .from('payments')
      .insert([{ amount: AMOUNT_CENTS, status: 'open' }])
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('[create-checkout] Order aanmaken mislukt:', orderError?.message);
      return new Response(JSON.stringify({ error: 'order failed' }), { status: 500, headers: CORS });
    }

    // 2. Checkout-sessie maken. Betaalmethodes (iDEAL/kaart) beheer je in je Stripe-dashboard.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Rsolve Access' },
          unit_amount: AMOUNT_CENTS,
        },
        quantity: 1,
      }],
      success_url: `${origin}/payment-complete?paid=1`,
      cancel_url: `${origin}/payment-complete?canceled=1`,
      metadata: { orderId: order.id },
    });

    // 3. Stripe-sessie-id op de order zetten (webhook matcht hierop)
    await supabase.from('payments').update({ stripe_session_id: session.id }).eq('id', order.id);

    return new Response(JSON.stringify({ url: session.url, orderId: order.id }), { status: 200, headers: CORS });
  } catch (e: any) {
    console.error('[create-checkout] Stripe-fout:', e?.message || e);
    return new Response(JSON.stringify({ error: 'stripe error' }), { status: 500, headers: CORS });
  }
};
