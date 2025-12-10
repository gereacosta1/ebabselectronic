// src/components/Catalog.tsx
import React, { useState } from "react";
import { Heart, Eye, Fuel, Gauge, Calendar } from "lucide-react";
import { Motorcycle } from "../App";
import AffirmButton from "./AffirmButton";
import UnderlineGrow from "./UnderlineGrow";

import { useCart } from "../context/CartContext";
import { useI18n } from "../i18n/I18nProvider";

interface CatalogProps {
  onViewDetails: (motorcycle: Motorcycle) => void;
}

/** Toast simple para reemplazar alert() de "Ver más motos" */
function SimpleToast({
  show,
  text,
  onClose,
}: {
  show: boolean;
  text: string;
  onClose: () => void;
}) {
  if (!show) return null;
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/90 text-white border border-white/20 px-4 py-3 rounded-xl shadow-2xl z-[9999] text-sm font-semibold"
      onClick={onClose}
      role="status"
    >
      {text}
    </div>
  );
}

// --- Botón reutilizable con estilos coherentes ---
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const Btn: React.FC<BtnProps> = ({
  variant = "primary",
  className = "",
  children,
  ...props
}) => {
  const base =
    "w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold " +
    "transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 " +
    "focus:ring-black-500 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-black/40 active:scale-[.98]",
    secondary:
      "bg-black text-white border border-white/15 hover:bg-black/90 shadow-lg active:scale-[.98]",
    ghost:
      "bg-transparent text-white/90 border border-white/20 hover:text-white hover:border-white/40",
  } as const;

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

/** 🔁 Mapeo: texto ES del array -> clave i18n */
const FEATURE_KEY_BY_ES: Record<string, string> = {
  "Motor eléctrico": "feature.motor",
  "Ligero y ágil": "feature.lightAgile",
  "Batería de alta capacidad": "feature.batteryHigh",
  "Motor eléctrico de alta potencia": "feature.motorHighPower",
  "Pantalla táctil": "feature.touchscreen",
  "Conectividad Bluetooth": "feature.bluetooth",
  "Sistema de navegación GPS": "feature.gps",
};

/** ✅ Traducción robusta de features */
const translateFeature = (
  t: (k: string) => string,
  productId: number,
  featureTextES: string,
  idx: number
) => {
  const keyById = `product.${productId}.feature.${idx}`;
  const v1 = t(keyById);
  if (v1 !== keyById) return v1;

  const genericKey = FEATURE_KEY_BY_ES[featureTextES];
  if (genericKey) {
    const v2 = t(genericKey);
    if (v2 !== genericKey) return v2;
  }

  return featureTextES;
};

const Catalog: React.FC<CatalogProps> = ({ onViewDetails }) => {
  const { t, fmtMoney } = useI18n();

  // 👇 hooks del componente
  const [filter, setFilter] = useState<"all" | "nueva">("all");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [toast, setToast] = useState<{ show: boolean; text: string }>({
    show: false,
    text: "",
  });
  const showToast = (text: string, ms = 2500) => {
    setToast({ show: true, text });
    window.setTimeout(() => setToast({ show: false, text: "" }), ms);
  };

  // 👉 carrito
  const { addItem, open } = useCart();

  // ⚡ Solo 5 scooters eléctricos + parlantes JBL
  const motorcycles: Motorcycle[] = [
    // ---------- SCOOTERS ELÉCTRICOS ----------
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
      features: ["Motor eléctrico", "Ligero y ágil", "Batería de alta capacidad"],
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
      features: ["Motor eléctrico", "Suspensión confortable", "Autonomía extendida"],
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
      features: ["Motor eléctrico", "Diseño compacto", "Batería removible"],
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
      features: ["Motor eléctrico", "Ligero y ágil", "Batería de alta capacidad"],
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
      features: ["Motor eléctrico", "Plegable", "Freno regenerativo"],
    },

    // ---------- PARLANTES JBL ----------
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
      features: ["Bluetooth", "Resistente al agua", "Batería recargable"],
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
      features: ["Bluetooth", "Tamaño compacto", "Hasta 8h de batería"],
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
      features: ["Alta potencia", "Luces LED", "Entradas para micrófono"],
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
      features: ["Bluetooth", "Resistente al agua", "Diseño portátil"],
    },
  ];

  // Mostrar solo eléctricos o productos sin motor (parlantes JBL)
  const onlyElectricOrNoEngine = motorcycles.filter(
    (m) => (m.engine && m.engine.toLowerCase() === "electric") || !m.engine
  );

  // Mantener tu filtro "Todas / Nuevas" sobre la lista ya filtrada
  const filteredMotorcycles = onlyElectricOrNoEngine.filter((moto) => {
    if (filter === "all") return true;
    return moto.condition.toLowerCase() === filter;
  });

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((favId) => favId !== id)
        : [...prev, id]
    );
  };

  return (
    <section
      id="catalogo"
      className="bg-black text-white pt-24 pb-24 md:pt-32 md:pb-28"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            <UnderlineGrow>{t("catalog.title")}</UnderlineGrow>
          </h2>
          <p className="text-white text-xl md:text-2xl max-w-3xl mx-auto font-bold">
            {t("catalog.subtitle")}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#7c3aed]/90 backdrop-blur-md border border-[#a855f7] rounded-lg p-2 flex space-x-2 shadow-2xl">
            <button
              onClick={() => setFilter("all")}
              className={`px-8 py-3 rounded-md text-lg font-black transition-all duration-300 ${
                filter === "all"
                  ? "bg-black/90 backdrop-blur-sm text-white shadow-lg"
                  : "text-white hover:bg-black/30"
              }`}
            >
              {t("catalog.filter.all")}
            </button>
            <button
              onClick={() => setFilter("nueva")}
              className={`px-8 py-3 rounded-md text-lg font-black transition-all duration-300 ${
                filter === "nueva"
                  ? "bg-black/90 backdrop-blur-sm text-white shadow-lg"
                  : "text-white hover:bg-black/30"
              }`}
            >
              {t("catalog.filter.new")}
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMotorcycles.map((moto) => {
            const condLabel =
              moto.condition === "Nueva"
                ? t("product.condition.new")
                : t("product.condition.used");

            return (
              <div
                key={moto.id}
                className="bg-[#7c3aed]/95 backdrop-blur-md border border-[#a855f7]/60 rounded-lg overflow-hidden shadow-2xl hover:shadow-[#c4b5fd]/70 transition-all duration-300 group transform hover:scale-105"
              >
                <div className="relative">
                  <img
                    src={moto.image || "/fallback.png"}
                    alt={moto.name || t("image.altFallback")}
                    className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src.endsWith("/fallback.png")) return;
                      target.src = "/fallback.png";
                    }}
                  />

                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        moto.condition === "Nueva"
                          ? "bg-black text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {condLabel}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(moto.id)}
                      className="p-2 rounded-full bg-black/80 backdrop-blur-sm hover:bg-black transition-colors border border-white/20"
                      aria-label={
                        favorites.includes(moto.id)
                          ? t("favorites.remove")
                          : t("favorites.add")
                      }
                      title={
                        favorites.includes(moto.id)
                          ? t("favorites.remove")
                          : t("favorites.add")
                      }
                    >
                      <Heart
                        className="w-5 h-5"
                        color={
                          favorites.includes(moto.id) ? "#f97316" : "#ffffff"
                        }
                        fill={
                          favorites.includes(moto.id) ? "#f97316" : "none"
                        }
                      />
                    </button>
                  </div>

                  {moto.featured && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-black/90 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-bold">
                        {t("product.badge.featured")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-2xl font-black text-white mb-2">
                    {moto.name}
                  </h3>
                  <p className="text-white mb-4 text-lg font-bold">
                    {moto.brand} • {moto.model}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-white">
                      <Calendar className="w-4 h-4" />
                      <span className="text-lg font-bold">{moto.year}</span>
                    </div>
                    {moto.engine && (
                      <div className="flex items-center space-x-2 text-white">
                        <Fuel className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {moto.engine}
                        </span>
                      </div>
                    )}
                    {moto.mileage && (
                      <div className="flex items-center space-x-2 text-white col-span-2">
                        <Gauge className="w-4 h-4" />
                        <span className="text-lg font-bold">
                          {moto.mileage.toLocaleString()} km
                        </span>
                      </div>
                    )}
                  </div>

                  {/* precio visible */}
                  {moto.price > 0 && (
                    <p className="text-lg font-black text-white mb-2">
                      {fmtMoney(Number(moto.price))}
                    </p>
                  )}

                  {/* features */}
                  {moto.features?.length ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {moto.features.map((f, idx) => {
                        const label = translateFeature(t, moto.id, f, idx);
                        return (
                          <span
                            key={`${moto.id}-feature-${idx}`}
                            className="bg-black/70 border border-white/20 text-white text-xs px-2 py-1 rounded"
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Ver Detalles */}
                    <Btn
                      variant="secondary"
                      onClick={() => onViewDetails(moto)}
                      aria-label={`${t("product.viewDetails")} ${moto.name}`}
                      title={t("product.viewDetails")}
                    >
                      <Eye className="w-4 h-4" />
                      {t("product.viewDetails")}
                    </Btn>

                    {/* Agregar al carrito */}
                    <Btn
                      variant="primary"
                      type="button"
                      onClick={() => {
                        const priceNum = Number(moto.price);
                        if (!Number.isFinite(priceNum) || priceNum <= 0) return;
                        addItem({
                          id: String(moto.id),
                          name: moto.name,
                          price: priceNum,
                          qty: 1,
                          sku: String(moto.id),
                          image: moto.image,
                          url: window.location.href,
                        });
                        open();
                      }}
                      className="bg-[#6d28d9] text-white font-black px-6 py-3 rounded-xl text-lg 
                                 border-2 border-white/70 shadow-lg 
                                 hover:bg-[#5b21b6] hover:border-white hover:scale-105 
                                 transition-all duration-300"
                    >
                      {t("cart.add")}
                    </Btn>

                    {/* Affirm por ítem */}
                    <div className="w-full">
                      {(() => {
                        const priceNum = Number(moto.price);
                        const isPriceValid =
                          Number.isFinite(priceNum) && priceNum > 0;
                        if (!isPriceValid) {
                          return (
                            <button
                              disabled
                              title={t("product.price.toConfirm")}
                              className="w-full bg-gray-600 text-white px-6 py-3 rounded-xl text-lg font-black opacity-60 cursor-not-allowed"
                            >
                              {t("product.price.toConfirm")}
                            </button>
                          );
                        }
                        return (
                          <AffirmButton
                            cartItems={[
                              {
                                name: moto.name,
                                price: priceNum,
                                qty: 1,
                                sku: String(moto.id),
                                url: window.location.href,
                              },
                            ]}
                            totalUSD={priceNum}
                          />
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => showToast(t("catalog.toast.moreSoon"))}
            className="bg-[#7c3aed]/90 backdrop-blur-md border border-[#a855f7] text-white px-12 py-4 rounded-lg text-xl font-black hover:bg-[#6d28d9] transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            {t("catalog.cta.moreBikes")}
          </button>
        </div>
      </div>

      {/* Toast global */}
      <SimpleToast
        show={toast.show}
        text={toast.text}
        onClose={() => setToast({ show: false, text: "" })}
      />
    </section>
  );
};

export default Catalog;
