// src/components/Catalog.tsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Calendar,
  Eye,
  Fuel,
  Gauge,
  Heart,
} from "lucide-react";

import type { Motorcycle } from "../App";

import AffirmButton from "./AffirmButton";
import UnderlineGrow from "./UnderlineGrow";

import { useCart } from "../context/CartContext";
import { useI18n } from "../i18n/I18nProvider";

interface CatalogProps {
  onViewDetails: (motorcycle: Motorcycle) => void;
}

type CatalogFilter = "all" | "nueva";

type BtnProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
  };

const FALLBACK_IMAGE = "/fallback.png";

const TOAST_DURATION_MS = 2500;

/**
 * Catálogo de productos.
 *
 * IMPORTANTE:
 * Estos precios sirven para mostrar el catálogo y construir el carrito.
 * Más adelante vamos a validar los precios también del lado del servidor
 * antes de crear la sesión de Stripe.
 */
const PRODUCTS: Motorcycle[] = [
  // ========================================================
  // SCOOTERS ELÉCTRICOS
  // ========================================================

  {
    id: 5,
    name: "Electric Scooter City",
    brand: "EBABS",
    model: "City 500W",
    year: 2025,
    price: 1500,
    image: "/IMG/Scooter-electrico(1).jpeg",
    condition: "Nueva",
    engine: "Electric",
    featured: true,
    description:
      "Scooter eléctrico urbano, perfecto para moverte por Miami con cero emisiones y bajo mantenimiento.",
    features: [
      "Motor eléctrico",
      "Ligero y ágil",
      "Batería de alta capacidad",
    ],
  },

  {
    id: 8,
    name: "Electric Scooter 2025",
    brand: "Master Sonic",
    model: "Urban Pro",
    year: 2025,
    price: 1850,
    image: "/IMG/ELECTRIC SCOOTER.jpeg",
    condition: "Nueva",
    engine: "Electric",
    description:
      "Scooter eléctrico robusto con gran autonomía, ideal para uso diario y recorridos más largos.",
    features: [
      "Motor eléctrico",
      "Suspensión confortable",
      "Autonomía extendida",
    ],
  },

  {
    id: 12,
    name: "Electric Scooter Urban",
    brand: "EBABS",
    model: "Scooter Urban 2025",
    year: 2025,
    price: 1000,
    image: "/IMG/electricBike3.jpeg",
    condition: "Nueva",
    engine: "Electric",
    description:
      "Modelo compacto y ligero, pensado para la ciudad. Fácil de manejar y de guardar.",
    features: [
      "Motor eléctrico",
      "Diseño compacto",
      "Batería removible",
    ],
  },

  {
    id: 18,
    name: "Scooter Movelito",
    brand: "Movelito",
    model: "Scooter Movelito 2025",
    year: 2025,
    price: 1850,
    image: "/IMG/scooter-azul.jpeg",
    condition: "Nueva",
    engine: "Electric",
    featured: true,
    description:
      "Scooter eléctrico con diseño moderno y cómodo, ideal para el día a día.",
    features: [
      "Motor eléctrico",
      "Ligero y ágil",
      "Batería de alta capacidad",
    ],
  },

  {
    id: 20,
    name: "Scooter Eléctrico Hiboy",
    brand: "Hiboy",
    model: "Hiboy 2025",
    year: 2025,
    price: 500,
    image: "/IMG/scooter-electrico-hiboy.jpg",
    condition: "Nueva",
    engine: "Electric",
    description:
      "Opción accesible para comenzar en la movilidad eléctrica, perfecta para trayectos cortos.",
    features: [
      "Motor eléctrico",
      "Plegable",
      "Freno regenerativo",
    ],
  },

  // ========================================================
  // E-BIKES
  // ========================================================

  {
    id: 25,
    name: "E bike xp4",
    brand: "E-Bike",
    model: "XP4",
    year: 2025,
    price: 2500,
    image: "/IMG/e-bike-xp4-2500.jpeg",
    condition: "Nueva",
    engine: "Electric",
    featured: true,
    description:
      "E-bike estilo urbano, ideal para movilidad diaria.",
    features: [
      "Motor eléctrico",
      "Batería de alta capacidad",
      "Diseño compacto",
    ],
  },

  {
    id: 26,
    name: "E bike rambo",
    brand: "E-Bike",
    model: "Rambo",
    year: 2025,
    price: 2850,
    image: "/IMG/e-bike-rambo-2850.jpeg",
    condition: "Nueva",
    engine: "Electric",
    description:
      "E-bike con ruedas anchas y estructura robusta.",
    features: [
      "Motor eléctrico",
      "Suspensión confortable",
      "Autonomía extendida",
    ],
  },

  {
    id: 27,
    name: "E bike súper 73",
    brand: "E-Bike",
    model: "Super 73",
    year: 2025,
    price: 3500,
    image: "/IMG/e-bike-super73-3500.jpeg",
    condition: "Nueva",
    engine: "Electric",
    featured: true,
    description:
      "E-bike estilo scrambler, potente y cómoda.",
    features: [
      "Motor eléctrico de alta potencia",
      "Batería de alta capacidad",
      "Diseño robusto",
    ],
  },

  // ========================================================
  // PARLANTES JBL
  // ========================================================

  {
    id: 21,
    name: "JBL Charge 4",
    brand: "JBL",
    model: "Charge 4",
    year: 2025,
    price: 150,
    image: "/IMG/jbl-charge-4.jpeg",
    condition: "Nueva",
    featured: true,
    description:
      "Parlante JBL Charge 4 con batería de larga duración y sonido potente para interior y exterior.",
    features: [
      "Bluetooth",
      "Resistente al agua",
      "Batería recargable",
    ],
  },

  {
    id: 22,
    name: "JBL GO 4",
    brand: "JBL",
    model: "GO 4",
    year: 2025,
    price: 50,
    image: "/IMG/jbl-go-4.jpeg",
    condition: "Nueva",
    description:
      "Parlante ultra compacto para llevar en el bolsillo. Ideal para uso diario.",
    features: [
      "Bluetooth",
      "Tamaño compacto",
      "Hasta 8h de batería",
    ],
  },

  {
    id: 23,
    name: "JBL Party Box",
    brand: "JBL",
    model: "Party Box",
    year: 2025,
    price: 800,
    image: "/IMG/jbl-party-box.jpeg",
    condition: "Nueva",
    featured: true,
    description:
      "JBL Party Box con luces LED y sonido de alta potencia, perfecto para eventos y fiestas.",
    features: [
      "Alta potencia",
      "Luces LED",
      "Entradas para micrófono",
    ],
  },

  {
    id: 24,
    name: "JBL Flip 6",
    brand: "JBL",
    model: "Flip 6",
    year: 2025,
    price: 200,
    image: "/IMG/jbl-flip-6.jpeg",
    condition: "Nueva",
    description:
      "Parlante JBL Flip 6 resistente al agua, con sonido equilibrado y fácil de transportar.",
    features: [
      "Bluetooth",
      "Resistente al agua",
      "Diseño portátil",
    ],
  },
];

/**
 * Mapeo:
 * texto español del producto -> clave genérica i18n.
 */
const FEATURE_KEY_BY_ES: Record<string, string> = {
  // Movilidad eléctrica
  "Motor eléctrico": "feature.motor",
  "Ligero y ágil": "feature.lightAgile",
  "Batería de alta capacidad": "feature.batteryHigh",
  "Motor eléctrico de alta potencia":
    "feature.motorHighPower",
  "Pantalla táctil": "feature.touchscreen",
  "Conectividad Bluetooth": "feature.bluetooth",
  "Sistema de navegación GPS": "feature.gps",
  "Suspensión confortable":
    "feature.comfortSuspension",
  "Autonomía extendida": "feature.extendedRange",
  "Diseño compacto": "feature.compactDesign",
  "Diseño robusto": "feature.robustDesign",
  "Batería removible": "feature.removableBattery",
  Plegable: "feature.foldable",
  "Freno regenerativo": "feature.regenBrake",

  // Audio
  Bluetooth: "feature.bluetooth",
  "Resistente al agua":
    "feature.waterResistant",
  "Batería recargable":
    "feature.rechargeableBattery",
  "Tamaño compacto": "feature.compactSize",
  "Hasta 8h de batería": "feature.battery8h",
  "Alta potencia": "feature.highPower",
  "Luces LED": "feature.ledLights",
  "Entradas para micrófono":
    "feature.micInput",
  "Diseño portátil":
    "feature.portableDesign",
};

function getValidPrice(
  value: unknown,
): number | null {
  const price = Number(value);

  if (
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return null;
  }

  return (
    Math.round(price * 100) / 100
  );
}

function translateFeature(
  t: (key: string) => string,
  productId: number,
  featureTextES: string,
  index: number,
): string {
  const clean =
    typeof featureTextES === "string"
      ? featureTextES.trim()
      : "";

  if (!clean) {
    return "";
  }

  // Primero intenta traducción específica
  // del producto.
  const productKey =
    `product.${productId}.feature.${index}`;

  const productTranslation =
    t(productKey);

  if (
    productTranslation !== productKey
  ) {
    return productTranslation;
  }

  // Después busca traducción genérica.
  const genericKey =
    FEATURE_KEY_BY_ES[clean];

  if (genericKey) {
    const genericTranslation =
      t(genericKey);

    if (
      genericTranslation !== genericKey
    ) {
      return genericTranslation;
    }
  }

  // Último fallback:
  // mantiene texto original.
  return clean;
}

const Btn: React.FC<BtnProps> = ({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...props
}) => {
  const base =
    "w-full inline-flex items-center justify-center gap-2 " +
    "px-5 py-3 rounded-xl font-extrabold " +
    "transition-all duration-300 " +
    "focus:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-purple-400 " +
    "focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-black " +
    "disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-purple-600 text-white " +
      "hover:bg-purple-700 shadow-lg " +
      "hover:shadow-black/40 active:scale-[.98]",

    secondary:
      "bg-black text-white border border-white/15 " +
      "hover:bg-black/90 shadow-lg active:scale-[.98]",

    ghost:
      "bg-transparent text-white/90 " +
      "border border-white/20 " +
      "hover:text-white hover:border-white/40",
  } as const;

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

function SimpleToast({
  show,
  text,
}: {
  show: boolean;
  text: string;
}) {
  if (!show) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="
        fixed bottom-6 left-1/2 z-[9999]
        -translate-x-1/2
        rounded-xl
        border border-white/20
        bg-black/90
        px-4 py-3
        text-sm font-semibold text-white
        shadow-2xl
      "
    >
      {text}
    </div>
  );
}

const Catalog: React.FC<CatalogProps> = ({
  onViewDetails,
}) => {
  const { t, fmtMoney } = useI18n();
  const { addItem } = useCart();

  const [
    filter,
    setFilter,
  ] = useState<CatalogFilter>("all");

  const [
    favorites,
    setFavorites,
  ] = useState<number[]>([]);

  const [
    toast,
    setToast,
  ] = useState<{
    show: boolean;
    text: string;
  }>({
    show: false,
    text: "",
  });

  const toastTimerRef =
    useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (
        toastTimerRef.current !== null
      ) {
        window.clearTimeout(
          toastTimerRef.current,
        );
      }
    };
  }, []);

  const showToast = useCallback(
    (
      text: string,
      duration = TOAST_DURATION_MS,
    ) => {
      if (
        toastTimerRef.current !== null
      ) {
        window.clearTimeout(
          toastTimerRef.current,
        );
      }

      setToast({
        show: true,
        text,
      });

      toastTimerRef.current =
        window.setTimeout(() => {
          setToast({
            show: false,
            text: "",
          });

          toastTimerRef.current =
            null;
        }, duration);
    },
    [],
  );

  const toggleFavorite =
    useCallback((id: number) => {
      setFavorites(
        (previousFavorites) => {
          if (
            previousFavorites.includes(id)
          ) {
            return previousFavorites.filter(
              (favoriteId) =>
                favoriteId !== id,
            );
          }

          return [
            ...previousFavorites,
            id,
          ];
        },
      );
    }, []);

  /**
   * Mostramos:
   * - productos eléctricos
   * - productos sin engine (ej. parlantes)
   */
  const availableProducts =
    useMemo(
      () =>
        PRODUCTS.filter(
          (product) =>
            !product.engine ||
            product.engine.toLowerCase() ===
              "electric",
        ),
      [],
    );

  const filteredProducts =
    useMemo(() => {
      if (filter === "all") {
        return availableProducts;
      }

      return availableProducts.filter(
        (product) =>
          product.condition
            .toLowerCase() === filter,
      );
    }, [
      availableProducts,
      filter,
    ]);

  const handleAddToCart =
    useCallback(
      (product: Motorcycle) => {
        const price =
          getValidPrice(product.price);

        if (price === null) {
          console.error(
            "[Catalog] Invalid product price:",
            {
              id: product.id,
              price: product.price,
            },
          );

          return;
        }

        addItem({
          id: String(product.id),
          name: product.name,
          price,
          qty: 1,
          sku: String(product.id),
          image: product.image,
          url: window.location.href,
        });
      },
      [addItem],
    );

  return (
    <section
      id="catalogo"
      className="
        bg-black text-white
        pt-24 pb-24
        md:pt-32 md:pb-28
      "
    >
      <div className="
        max-w-6xl mx-auto
        px-4 sm:px-6 lg:px-8
      ">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="
            text-4xl md:text-6xl
            font-black text-white
            mb-6
          ">
            <UnderlineGrow>
              {t("catalog.title")}
            </UnderlineGrow>
          </h2>

          <p className="
            text-white
            text-xl md:text-2xl
            max-w-3xl mx-auto
            font-bold
          ">
            {t("catalog.subtitle")}
          </p>
        </div>

        {/* Filtros */}
        <div className="
          flex justify-center mb-8
        ">
          <div className="
            bg-[#7c3aed]/90
            backdrop-blur-md
            border border-[#a855f7]
            rounded-lg p-2
            flex space-x-2
            shadow-2xl
          ">
            <button
              type="button"
              onClick={() =>
                setFilter("all")
              }
              aria-pressed={
                filter === "all"
              }
              className={`
                px-8 py-3
                rounded-md
                text-lg font-black
                transition-all duration-300
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-white
                ${
                  filter === "all"
                    ? "bg-black/90 backdrop-blur-sm text-white shadow-lg"
                    : "text-white hover:bg-black/30"
                }
              `}
            >
              {t(
                "catalog.filter.all",
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setFilter("nueva")
              }
              aria-pressed={
                filter === "nueva"
              }
              className={`
                px-8 py-3
                rounded-md
                text-lg font-black
                transition-all duration-300
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-white
                ${
                  filter === "nueva"
                    ? "bg-black/90 backdrop-blur-sm text-white shadow-lg"
                    : "text-white hover:bg-black/30"
                }
              `}
            >
              {t(
                "catalog.filter.new",
              )}
            </button>
          </div>
        </div>

        {/* Productos */}
        <div className="
          grid grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-8
        ">
          {filteredProducts.map(
            (product) => {
              const price =
                getValidPrice(
                  product.price,
                );

              const isFavorite =
                favorites.includes(
                  product.id,
                );

              const conditionLabel =
                product.condition ===
                "Nueva"
                  ? t(
                      "product.condition.new",
                    )
                  : t(
                      "product.condition.used",
                    );

              return (
                <article
                  key={product.id}
                  className="
                    bg-[#7c3aed]/95
                    backdrop-blur-md
                    border border-[#a855f7]/60
                    rounded-lg
                    overflow-hidden
                    shadow-2xl
                    hover:shadow-[#c4b5fd]/70
                    transition-all duration-300
                    group
                    transform
                    hover:scale-[1.02]
                  "
                >
                  {/* Imagen */}
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        product.image ||
                        FALLBACK_IMAGE
                      }
                      alt={
                        product.name ||
                        t(
                          "image.altFallback",
                        )
                      }
                      className="
                        w-full h-72
                        object-cover
                        group-hover:scale-105
                        transition-transform
                        duration-300
                      "
                      loading="lazy"
                      onError={(
                        event,
                      ) => {
                        const image =
                          event.currentTarget;

                        image.onerror =
                          null;

                        image.src =
                          FALLBACK_IMAGE;
                      }}
                    />

                    {/* Condición */}
                    <div className="
                      absolute top-4 left-4
                    ">
                      <span
                        className={`
                          px-3 py-1
                          rounded-full
                          text-sm font-semibold
                          ${
                            product.condition ===
                            "Nueva"
                              ? "bg-black text-white"
                              : "bg-white text-black"
                          }
                        `}
                      >
                        {
                          conditionLabel
                        }
                      </span>
                    </div>

                    {/* Favorito */}
                    <div className="
                      absolute top-4 right-4
                    ">
                      <button
                        type="button"
                        onClick={() =>
                          toggleFavorite(
                            product.id,
                          )
                        }
                        aria-pressed={
                          isFavorite
                        }
                        aria-label={
                          isFavorite
                            ? t(
                                "favorites.remove",
                              )
                            : t(
                                "favorites.add",
                              )
                        }
                        title={
                          isFavorite
                            ? t(
                                "favorites.remove",
                              )
                            : t(
                                "favorites.add",
                              )
                        }
                        className="
                          p-2 rounded-full
                          bg-black/80
                          backdrop-blur-sm
                          hover:bg-black
                          transition-colors
                          border border-white/20
                          focus:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-white
                        "
                      >
                        <Heart
                          className="w-5 h-5"
                          color={
                            isFavorite
                              ? "#f97316"
                              : "#ffffff"
                          }
                          fill={
                            isFavorite
                              ? "#f97316"
                              : "none"
                          }
                        />
                      </button>
                    </div>

                    {/* Featured */}
                    {product.featured && (
                      <div className="
                        absolute
                        top-4 left-1/2
                        -translate-x-1/2
                      ">
                        <span className="
                          bg-black/90
                          backdrop-blur-sm
                          border border-white/20
                          text-white
                          px-4 py-2
                          rounded-full
                          text-sm font-bold
                          whitespace-nowrap
                        ">
                          {t(
                            "product.badge.featured",
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Información */}
                  <div className="p-4">
                    <h3 className="
                      text-2xl
                      font-black
                      text-white
                      mb-2
                    ">
                      {product.name}
                    </h3>

                    <p className="
                      text-white
                      mb-4
                      text-lg
                      font-bold
                    ">
                      {product.brand}
                      {" • "}
                      {product.model}
                    </p>

                    {/* Datos */}
                    <div className="
                      grid grid-cols-2
                      gap-4 mb-4
                    ">
                      <div className="
                        flex items-center
                        space-x-2
                        text-white
                      ">
                        <Calendar className="w-4 h-4" />

                        <span className="
                          text-lg font-bold
                        ">
                          {product.year}
                        </span>
                      </div>

                      {product.engine && (
                        <div className="
                          flex items-center
                          space-x-2
                          text-white
                        ">
                          <Fuel className="w-4 h-4" />

                          <span className="
                            text-sm font-semibold
                          ">
                            {
                              product.engine
                            }
                          </span>
                        </div>
                      )}

                      {typeof product.mileage ===
                        "number" &&
                        product.mileage >=
                          0 && (
                          <div className="
                            flex items-center
                            space-x-2
                            text-white
                            col-span-2
                          ">
                            <Gauge className="w-4 h-4" />

                            <span className="
                              text-lg font-bold
                            ">
                              {product.mileage.toLocaleString()}
                              {" km"}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Precio */}
                    {price !== null ? (
                      <p className="
                        text-lg
                        font-black
                        text-white
                        mb-2
                      ">
                        {fmtMoney(price)}
                      </p>
                    ) : (
                      <p className="
                        text-sm
                        font-bold
                        text-white/70
                        mb-2
                      ">
                        {t(
                          "product.price.toConfirm",
                        )}
                      </p>
                    )}

                    {/* Features */}
                    {product.features?.length ? (
                      <div className="
                        flex flex-wrap
                        gap-2 mb-4
                      ">
                        {product.features.map(
                          (
                            feature,
                            index,
                          ) => {
                            const label =
                              translateFeature(
                                t,
                                product.id,
                                feature,
                                index,
                              );

                            if (!label) {
                              return null;
                            }

                            return (
                              <span
                                key={`${product.id}-feature-${index}`}
                                className="
                                  bg-black/70
                                  border border-white/20
                                  text-white
                                  text-xs
                                  px-2 py-1
                                  rounded
                                "
                              >
                                {
                                  label
                                }
                              </span>
                            );
                          },
                        )}
                      </div>
                    ) : null}

                    {/* Acciones */}
                    <div className="
                      mt-4
                      grid grid-cols-1
                      sm:grid-cols-3
                      gap-3
                    ">
                      {/* Detalles */}
                      <Btn
                        variant="secondary"
                        onClick={() =>
                          onViewDetails(
                            product,
                          )
                        }
                        aria-label={`${t(
                          "product.viewDetails",
                        )} ${product.name}`}
                        title={t(
                          "product.viewDetails",
                        )}
                      >
                        <Eye className="w-4 h-4" />

                        {t(
                          "product.viewDetails",
                        )}
                      </Btn>

                      {/* Carrito */}
                      <Btn
                        variant="primary"
                        disabled={
                          price === null
                        }
                        onClick={() =>
                          handleAddToCart(
                            product,
                          )
                        }
                        className="
                          bg-[#6d28d9]
                          text-white
                          font-black
                          px-6 py-3
                          rounded-xl
                          text-lg
                          border-2
                          border-white/70
                          shadow-lg
                          hover:bg-[#5b21b6]
                          hover:border-white
                          hover:scale-105
                          transition-all
                          duration-300
                        "
                      >
                        {t("cart.add")}
                      </Btn>

                      {/* Affirm */}
                      <div className="w-full">
                        {price === null ? (
                          <button
                            type="button"
                            disabled
                            title={t(
                              "product.price.toConfirm",
                            )}
                            className="
                              w-full
                              bg-gray-600
                              text-white
                              px-6 py-3
                              rounded-xl
                              text-lg
                              font-black
                              opacity-60
                              cursor-not-allowed
                            "
                          >
                            {t(
                              "product.price.toConfirm",
                            )}
                          </button>
                        ) : (
                          <AffirmButton
                            cartItems={[
                              {
                                name:
                                  product.name,
                                price,
                                qty: 1,
                                sku: String(
                                  product.id,
                                ),
                                url:
                                  window.location
                                    .href,
                              },
                            ]}
                            totalUSD={
                              price
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </div>

        {/* Ver más */}
        <div className="
          text-center mt-12
        ">
          <button
            type="button"
            onClick={() =>
              showToast(
                t(
                  "catalog.toast.moreSoon",
                ),
              )
            }
            className="
              bg-[#7c3aed]/90
              backdrop-blur-md
              border border-[#a855f7]
              text-white
              px-12 py-4
              rounded-lg
              text-xl font-black
              hover:bg-[#6d28d9]
              transition-all
              duration-300
              transform
              hover:scale-105
              shadow-2xl
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-white
            "
          >
            {t(
              "catalog.cta.moreBikes",
            )}
          </button>
        </div>
      </div>

      {/* Toast */}
      <SimpleToast
        show={toast.show}
        text={toast.text}
      />
    </section>
  );
};

export default Catalog;