// src/components/PayWithCard.tsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { startCardCheckout } from '../lib/cardCheckout';

const PayWithCard: React.FC = () => {
  const { items, totalUSD } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (loading) return;

    setError(null);

    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }

    try {
      setLoading(true);

      await startCardCheckout(items);

      // Si todo sale bien, startCardCheckout redirige al
      // Stripe Hosted Checkout y la página actual se abandona.
    } catch (error: unknown) {
      console.error('[PayWithCard] Checkout error:', error);

      const message =
        error instanceof Error
          ? error.message
          : 'An error occurred while starting the payment.';

      setError(message);
      setLoading(false);
    }
  };

  const formattedTotal = Number.isFinite(totalUSD)
    ? totalUSD.toFixed(2)
    : '0.00';

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || items.length === 0}
        aria-busy={loading}
        className="w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Redirecting to secure checkout…' : 'Continue to payment'}
      </button>

      <div className="space-y-1">
        <p className="text-xs text-slate-500">
          Total{' '}
          <span className="font-semibold">
            ${formattedTotal} USD
          </span>
        </p>

        <p className="text-xs text-slate-400">
          Card, Klarna and Afterpay may be available at checkout.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="text-xs text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default PayWithCard;