// netlify/functions/card-checkout.mjs
import Stripe from "stripe";

// ENV requerida:
// STRIPE_SECRET_KEY = sk_live_...
//
// Opcional:
// SITE_URL = https://ebabselectronic.com

const stripeSecret = process.env.STRIPE_SECRET_KEY?.trim() || "";

const stripe = stripeSecret
  ? new Stripe(stripeSecret, {
      apiVersion: "2024-06-20",
    })
  : null;

const FALLBACK_SITE_URL = "https://ebabselectronic.com";

/**
 * CATÁLOGO OFICIAL DEL SERVIDOR
 *
 * IMPORTANTE:
 * Stripe toma nombres y precios desde este objeto.
 *
 * Los valores enviados desde el navegador en:
 * - item.name
 * - item.price
 *
 * NO se utilizan para determinar cuánto cobrar.
 *
 * Si en el futuro cambiás un precio en Catalog.tsx,
 * tenés que actualizarlo también acá.
 */
const PRODUCT_CATALOG = Object.freeze({
  "5": {
    name: "Electric Scooter City",
    price: 1500,
  },

  "8": {
    name: "Electric Scooter 2025",
    price: 1850,
  },

  "12": {
    name: "Electric Scooter Urban",
    price: 1000,
  },

  "18": {
    name: "Scooter Movelito",
    price: 1850,
  },

  "20": {
    name: "Scooter Eléctrico Hiboy",
    price: 500,
  },

  "25": {
    name: "E bike xp4",
    price: 2500,
  },

  "26": {
    name: "E bike rambo",
    price: 2850,
  },

  "27": {
    name: "E bike súper 73",
    price: 3500,
  },

  "21": {
    name: "JBL Charge 4",
    price: 150,
  },

  "22": {
    name: "JBL GO 4",
    price: 50,
  },

  "23": {
    name: "JBL Party Box",
    price: 800,
  },

  "24": {
    name: "JBL Flip 6",
    price: 200,
  },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store",
};

function json(statusCode, data) {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
}

function safeLog(value) {
  try {
    return JSON.stringify(value, null, 2).slice(0, 4000);
  } catch {
    return "[unserializable]";
  }
}

function getSiteOrigin() {
  const configuredUrl = process.env.SITE_URL?.trim();

  if (configuredUrl) {
    try {
      const url = new URL(configuredUrl);

      if (
        url.protocol === "https:" ||
        url.hostname === "localhost"
      ) {
        return url.origin;
      }

      console.warn(
        "[card-checkout] SITE_URL must use HTTPS. Using fallback."
      );
    } catch {
      console.warn(
        "[card-checkout] Invalid SITE_URL, using fallback"
      );
    }
  }

  return FALLBACK_SITE_URL;
}

function normalizeEmail(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  const email = value.trim();

  if (!email) {
    return undefined;
  }

  if (!email.includes("@")) {
    return undefined;
  }

  if (email.length > 254) {
    return undefined;
  }

  return email;
}

function normalizeQuantity(value) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.min(
    99,
    Math.max(1, Math.floor(quantity))
  );
}

function normalizePrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price) || price <= 0) {
    return null;
  }

  const cents = Math.round(price * 100);

  if (
    !Number.isSafeInteger(cents) ||
    cents < 50
  ) {
    return null;
  }

  return cents;
}

function normalizeProductId(value) {
  if (
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    return null;
  }

  const id = String(value).trim();

  return id || null;
}

export async function handler(event) {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: "",
    };
  }

  // Solo aceptamos POST
  if (event.httpMethod !== "POST") {
    return json(405, {
      error: "Method Not Allowed",
    });
  }

  // Stripe debe estar configurado en Netlify
  if (!stripe) {
    console.error(
      "[card-checkout] Missing STRIPE_SECRET_KEY"
    );

    return json(500, {
      error: "Stripe is not configured",
    });
  }

  let body;

  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, {
      error: "Invalid JSON body",
    });
  }

  try {
    const items = Array.isArray(body.items)
      ? body.items
      : [];

    if (items.length === 0) {
      return json(400, {
        error: "items array required",
      });
    }

    if (items.length > 100) {
      return json(400, {
        error: "Too many items",
      });
    }

    const line_items = [];

    for (
      let index = 0;
      index < items.length;
      index += 1
    ) {
      const item = items[index] || {};

      // ----------------------------------------------------
      // 1. Validamos ID recibido desde el frontend
      // ----------------------------------------------------

      const productId = normalizeProductId(
        item.id
      );

      if (!productId) {
        return json(400, {
          error: `Invalid product ID for item ${
            index + 1
          }`,
        });
      }

      // ----------------------------------------------------
      // 2. Buscamos producto oficial en el servidor
      // ----------------------------------------------------

      const officialProduct =
        PRODUCT_CATALOG[productId];

      if (!officialProduct) {
        console.warn(
          "[card-checkout] Unknown product ID:",
          productId
        );

        return json(400, {
          error: `Product ${productId} is not available`,
        });
      }

      // ----------------------------------------------------
      // 3. Precio oficial
      //
      // NO usamos item.price.
      // ----------------------------------------------------

      const unitAmount = normalizePrice(
        officialProduct.price
      );

      if (unitAmount === null) {
        console.error(
          "[card-checkout] Invalid server product price",
          {
            productId,
            price: officialProduct.price,
          }
        );

        return json(500, {
          error: "Product price configuration error",
        });
      }

      // ----------------------------------------------------
      // 4. Cantidad
      // ----------------------------------------------------

      const quantity = normalizeQuantity(
        item.qty
      );

      // ----------------------------------------------------
      // 5. Stripe Line Item
      //
      // NO usamos item.name.
      // ----------------------------------------------------

      line_items.push({
        price_data: {
          currency: "usd",

          product_data: {
            name: officialProduct.name,

            metadata: {
              product_id: productId,
            },
          },

          unit_amount: unitAmount,
        },

        quantity,
      });
    }

    const customerEmail = normalizeEmail(
      body.customer_email
    );

    const origin = getSiteOrigin();

    // ======================================================
    // CREATE STRIPE CHECKOUT SESSION
    // ======================================================

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        line_items,

        /**
         * Card + BNPL.
         *
         * Klarna / Afterpay solamente aparecerán cuando:
         *
         * - estén habilitados en la cuenta LIVE
         * - Stripe permita el método para esa cuenta
         * - el cliente sea elegible
         * - el importe sea compatible
         * - la ubicación sea compatible
         */
        payment_method_types: [
          "card",
          "klarna",
          "afterpay_clearpay",
        ],

        billing_address_collection:
          "required",

        shipping_address_collection: {
          allowed_countries: ["US"],
        },

        phone_number_collection: {
          enabled: true,
        },

        ...(customerEmail
          ? {
              customer_email:
                customerEmail,
            }
          : {}),

        success_url:
          `${origin}/?card=success` +
          `&session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${origin}/?card=cancel`,

        metadata: {
          store: "EBABS Electronic",
        },
      });

    if (!session.url) {
      console.error(
        "[card-checkout] Stripe created session without URL",
        session.id
      );

      return json(500, {
        error:
          "Stripe Checkout URL was not generated",
      });
    }

    console.log(
      "[card-checkout] Checkout session created",
      safeLog({
        id: session.id,
        mode: session.mode,
        payment_status:
          session.payment_status,
        products:
          line_items.length,
      })
    );

    // IMPORTANTE:
    // Mantiene exactamente la respuesta que espera
    // src/lib/cardCheckout.ts
    return json(200, {
      ok: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error(
      "[card-checkout] Stripe error",
      error
    );

    const message =
      error?.raw?.message ||
      error?.message ||
      "Stripe checkout error";

    const code =
      error?.raw?.code ||
      error?.code ||
      null;

    const type =
      error?.raw?.type ||
      error?.type ||
      null;

    return json(500, {
      error: message,
      code,
      type,
    });
  }
}