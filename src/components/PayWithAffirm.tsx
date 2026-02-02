// src/components/PayWithAffirm.tsx
import AffirmButton from "./AffirmButton";
import { useCart, type CartItem as CartItemCtx } from "../context/CartContext";

export default function PayWithAffirm() {
  const { items, totalUSD } = useCart();

  const mapped = (items as CartItemCtx[]).map((it, idx) => ({
    // AffirmButton espera "name"
    name: String(it.name ?? `Item ${idx + 1}`),

    // opcionales, pero ayudan a tener SKU/ID estable
    sku: (it as any).sku ?? String((it as any).id ?? idx + 1),
    id: (it as any).id ?? (it as any).sku ?? idx + 1,

    price: Number((it as any).price) || 0,
    qty: Math.max(1, Number((it as any).qty) || 1),

    // si no tenés url por item, mandá algo razonable
    url: (it as any).url || window.location.pathname,

    // ideal: que sea path absoluto o relativo correcto (ej "/IMG/x.jpg")
    image: (it as any).image,
  }));

  return (
    <AffirmButton
      cartItems={mapped}
      totalUSD={Number(totalUSD) || 0}
      shippingUSD={0}
      taxUSD={0}
    />
  );
}
