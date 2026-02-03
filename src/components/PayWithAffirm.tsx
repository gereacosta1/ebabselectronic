// src/components/PayWithAffirm.tsx
import AffirmButton from "./AffirmButton";
import { useCart } from "../context/CartContext";

export default function PayWithAffirm() {
  const { items, totalUSD } = useCart();

  // Este shape es EXACTAMENTE el que espera <AffirmButton cartItems={...} />
  const cartItems = items.map((it) => ({
    id: it.id,                 // string en tu context
    sku: it.sku ?? it.id,      // sku estable
    name: it.name,             // AffirmButton usa "name"
    price: Number(it.price) || 0,
    qty: Math.max(1, Number(it.qty) || 1),
    url: it.url ?? window.location.pathname,
    image: it.image,
  }));

  return (
    <AffirmButton
      cartItems={cartItems}
      totalUSD={Number(totalUSD) || 0}
      shippingUSD={0}
      taxUSD={0}
    />
  );
}
