// src/App.tsx

import {
  useCallback,
  useMemo,
  useState,
} from "react";
import { ShoppingCart } from "lucide-react";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Catalog from "./components/Catalog";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import MotorcycleModal from "./components/MotorcycleModal";
import CartDrawer from "./components/CartDrawer";

import {
  I18nProvider,
  useI18n,
} from "./i18n/I18nProvider";

import {
  CartProvider,
  useCart,
} from "./context/CartContext";

export interface Motorcycle {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  image: string;
  condition: "Nueva" | "Usada";
  engine?: string;
  mileage?: number;
  featured?: boolean;
  description?: string;
  features?: string[];
  gallery?: string[];
}

const PHONE_NUMBER = "+17869681621";
const WHATSAPP_NUMBER = "17869681621";
const EMAIL_ADDRESS = "ebabselectronic@gmail.com";

const HEADER_OFFSET = 96;

function CartFab() {
  const { open, items } = useCart();

  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.qty,
        0,
      ),
    [items],
  );

  if (itemCount <= 0) {
    return null;
  }

  const visibleCount =
    itemCount > 99
      ? "99+"
      : String(itemCount);

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Open shopping cart with ${itemCount} item${
        itemCount === 1 ? "" : "s"
      }`}
      title="Open cart"
      className="
        fixed right-4 bottom-4 z-[9999]
        flex items-center gap-2
        rounded-full
        bg-[var(--primary)]
        px-5 py-3
        text-white
        shadow-2xl
        transition-colors
        hover:bg-purple-700
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-purple-400
        focus-visible:ring-offset-2
      "
    >
      <ShoppingCart
        className="h-5 w-5"
        aria-hidden="true"
      />

      <span className="font-black">
        {visibleCount}
      </span>
    </button>
  );
}

function AppInner() {
  const { lang } = useI18n();

  const [
    activeSection,
    setActiveSection,
  ] = useState("inicio");

  const [
    selectedMotorcycle,
    setSelectedMotorcycle,
  ] = useState<Motorcycle | null>(
    null,
  );

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const cleanSectionId =
        sectionId.trim();

      if (!cleanSectionId) {
        return;
      }

      setActiveSection(
        cleanSectionId,
      );

      const element =
        document.getElementById(
          cleanSectionId,
        );

      if (!element) {
        console.warn(
          `[App] Section not found: ${cleanSectionId}`,
        );

        return;
      }

      const top =
        element.getBoundingClientRect()
          .top +
        window.scrollY -
        HEADER_OFFSET;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });
    },
    [],
  );

  const handlePhoneCall =
    useCallback(() => {
      window.location.href =
        `tel:${PHONE_NUMBER}`;
    }, []);

  const handleEmail =
    useCallback(() => {
      window.location.href =
        `mailto:${EMAIL_ADDRESS}`;
    }, []);

  const handleWhatsApp =
    useCallback(() => {
      const message =
        lang === "es"
          ? "Hola! Estoy interesado en sus scooters, e-bikes y productos eléctricos. ¿Me pueden dar más info?"
          : "Hi! I'm interested in your scooters, e-bikes and electric products. Can you share more info?";

      const url =
        `https://wa.me/${WHATSAPP_NUMBER}` +
        `?text=${encodeURIComponent(
          message,
        )}`;

      window.open(
        url,
        "_blank",
        "noopener,noreferrer",
      );
    }, [lang]);

  const handleViewDetails =
    useCallback(
      (
        motorcycle: Motorcycle,
      ) => {
        setSelectedMotorcycle(
          motorcycle,
        );
      },
      [],
    );

  const handleCloseModal =
    useCallback(() => {
      setSelectedMotorcycle(null);
    }, []);

  return (
    <div className="min-h-screen bg-[var(--light)]">
      <Header
        activeSection={
          activeSection
        }
        onNavigate={
          scrollToSection
        }
      />

      <main>
        <Hero
          onNavigate={
            scrollToSection
          }
        />

        <Catalog
          onViewDetails={
            handleViewDetails
          }
        />

        <About />

        <Contact
          onPhoneCall={
            handlePhoneCall
          }
          onWhatsApp={
            handleWhatsApp
          }
          onEmail={
            handleEmail
          }
        />
      </main>

      <Footer />

      {selectedMotorcycle && (
        <MotorcycleModal
          motorcycle={
            selectedMotorcycle
          }
          onClose={
            handleCloseModal
          }
          onPhoneCall={
            handlePhoneCall
          }
          onWhatsApp={
            handleWhatsApp
          }
        />
      )}

      <CartFab />

      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <CartProvider>
        <AppInner />
      </CartProvider>
    </I18nProvider>
  );
}