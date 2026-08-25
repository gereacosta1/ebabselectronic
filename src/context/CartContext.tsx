// src/context/CartContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number; // USD
  qty: number;
  sku?: string;
  image?: string;
  url?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  isOpen: boolean;
  totalUSD: number;
};

const MAX_QUANTITY = 99;

const CartContext = createContext<CartContextType | undefined>(undefined);

function normalizeQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(
    MAX_QUANTITY,
    Math.max(1, Math.floor(value)),
  );
}

function normalizePrice(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  // Mantiene únicamente dos decimales para USD.
  return Math.round(value * 100) / 100;
}

function normalizeItem(item: CartItem): CartItem | null {
  const id = String(item.id ?? '').trim();
  const name = String(item.name ?? '').trim();
  const price = normalizePrice(Number(item.price));

  if (!id || !name || price <= 0) {
    console.error(
      '[CartContext] Invalid cart item:',
      item,
    );

    return null;
  }

  return {
    ...item,
    id,
    name,
    price,
    qty: normalizeQuantity(Number(item.qty)),
  };
}

export const CartProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item: CartItem) => {
    const normalizedItem = normalizeItem(item);

    if (!normalizedItem) {
      return;
    }

    setItems((previousItems) => {
      const existingIndex = previousItems.findIndex(
        (existingItem) =>
          existingItem.id === normalizedItem.id,
      );

      if (existingIndex >= 0) {
        return previousItems.map((existingItem, index) => {
          if (index !== existingIndex) {
            return existingItem;
          }

          return {
            ...existingItem,

            // Conservamos los datos más recientes del producto.
            name: normalizedItem.name,
            price: normalizedItem.price,
            sku: normalizedItem.sku,
            image: normalizedItem.image,
            url: normalizedItem.url,

            qty: normalizeQuantity(
              existingItem.qty + normalizedItem.qty,
            ),
          };
        });
      }

      return [
        ...previousItems,
        normalizedItem,
      ];
    });

    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((previousItems) =>
      previousItems.filter(
        (item) => item.id !== id,
      ),
    );
  }, []);

  const setQty = useCallback(
    (id: string, qty: number) => {
      const numericQuantity = Number(qty);

      if (
        !Number.isFinite(numericQuantity) ||
        numericQuantity <= 0
      ) {
        removeItem(id);
        return;
      }

      const normalizedQuantity =
        normalizeQuantity(numericQuantity);

      setItems((previousItems) =>
        previousItems.map((item) =>
          item.id === id
            ? {
                ...item,
                qty: normalizedQuantity,
              }
            : item,
        ),
      );
    },
    [removeItem],
  );

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const totalUSD = useMemo(() => {
    const total = items.reduce(
      (sum, item) =>
        sum + item.price * item.qty,
      0,
    );

    // Evita errores típicos de coma flotante:
    // por ejemplo 0.1 + 0.2.
    return Math.round(total * 100) / 100;
  }, [items]);

  const value = useMemo<CartContextType>(
    () => ({
      items,
      addItem,
      removeItem,
      setQty,
      clear,
      open,
      close,
      isOpen,
      totalUSD,
    }),
    [
      items,
      addItem,
      removeItem,
      setQty,
      clear,
      open,
      close,
      isOpen,
      totalUSD,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used within CartProvider',
    );
  }

  return context;
};