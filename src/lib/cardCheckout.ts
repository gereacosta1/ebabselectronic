// src/lib/cardCheckout.ts
import type { CartItem } from '../context/CartContext';

const API_URL = '/api/card-checkout';

type CheckoutResponse = {
  ok?: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
  code?: string | null;
  type?: string | null;
};

export async function startCardCheckout(
  items: CartItem[],
): Promise<void> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('The shopping cart is empty.');
  }

  // Enviamos únicamente la información necesaria para crear el Checkout.
  // Evitamos mandar campos innecesarios del carrito.
  const checkoutItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    qty: item.qty,
  }));

  let response: Response;

  try {
    response = await fetch(API_URL, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },

      body: JSON.stringify({
        items: checkoutItems,
      }),
    });
  } catch (error) {
    console.error(
      '[card-checkout] Network error:',
      error,
    );

    throw new Error(
      'Unable to connect to the payment server. Please try again.',
    );
  }

  let data: CheckoutResponse;

  try {
    data = (await response.json()) as CheckoutResponse;
  } catch (error) {
    console.error(
      '[card-checkout] Invalid server response:',
      error,
    );

    throw new Error(
      'The payment server returned an invalid response.',
    );
  }

  if (!response.ok) {
    console.error('[card-checkout] Checkout error:', {
      status: response.status,
      error: data.error,
      code: data.code,
      type: data.type,
    });

    throw new Error(
      data.error ||
        'The payment could not be initiated. Please try again.',
    );
  }

  if (
    !data.ok ||
    typeof data.url !== 'string' ||
    !data.url.trim()
  ) {
    console.error(
      '[card-checkout] Missing Stripe Checkout URL:',
      data,
    );

    throw new Error(
      'Stripe did not return a valid checkout URL.',
    );
  }

  try {
    const checkoutUrl = new URL(data.url);

    if (checkoutUrl.protocol !== 'https:') {
      throw new Error('Invalid checkout protocol');
    }

    // Redirige al Stripe Hosted Checkout.
    window.location.assign(checkoutUrl.toString());
  } catch (error) {
    console.error(
      '[card-checkout] Invalid checkout URL:',
      error,
    );

    throw new Error(
      'The payment server returned an invalid checkout URL.',
    );
  }
}