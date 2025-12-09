import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import MotorcycleModal from './components/MotorcycleModal';
import { I18nProvider } from './i18n/I18nProvider';

import { CartProvider, useCart } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import { ShoppingCart } from 'lucide-react';

export interface Motorcycle {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  image: string;
  condition: 'Nueva' | 'Usada';
  engine: string;
  mileage?: number;
  featured?: boolean;
  description?: string;
  features?: string[];
  gallery?: string[];
}

function CartFab() {
  const { open, items } = useCart();
  const count = items.reduce((sum, it) => sum + it.qty, 0);

  if (count <= 0) return null;

  return (
    <button
      onClick={open}
      className="fixed right-4 bottom-4 z-[9999] bg-[var(--primary)] text-white rounded-full shadow-2xl px-5 py-3 flex items-center gap-2 hover:bg-purple-700"
    >
      <ShoppingCart className="w-5 h-5" />
      <span className="font-black">{count}</span>
    </button>
  );
}

function AppInner() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [selectedMotorcycle, setSelectedMotorcycle] = useState<Motorcycle | null>(null);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePhoneCall = () => window.open('tel:+17869681621', '_self');

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi! I'm interested in your electric vehicles.");
    window.open(`https://wa.me/+17869681621?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    window.open('mailto:ebabselectronic@gmail.com', '_self');
  };

  return (
    <div className="min-h-screen bg-[var(--light)]">
      <Header activeSection={activeSection} onNavigate={scrollToSection} />
      <Hero onNavigate={scrollToSection} />

      <Catalog onViewDetails={setSelectedMotorcycle} />
      <About />
      <Contact onPhoneCall={handlePhoneCall} onWhatsApp={handleWhatsApp} onEmail={handleEmail} />
      <Footer />

      {selectedMotorcycle && (
        <MotorcycleModal
          motorcycle={selectedMotorcycle}
          onClose={() => setSelectedMotorcycle(null)}
          onPhoneCall={handlePhoneCall}
          onWhatsApp={handleWhatsApp}
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
