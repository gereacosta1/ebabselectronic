// src/components/Header.tsx
import React, { useState } from 'react';
import { Menu, X, Phone, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import LangToggle from './LangToggle';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function Header({ activeSection, onNavigate }: HeaderProps) {
  const [openMenu, setOpenMenu] = useState(false);
  const { items, open } = useCart();
  const cartCount = items.reduce((n, i) => n + i.qty, 0);

  const menu = [
    { id: 'inicio', label: 'Home' },
    { id: 'catalogo', label: 'Catalog' },
    { id: 'nosotros', label: 'About' },
    { id: 'contacto', label: 'Contact' },
  ];

  const handleNavigate = (section: string) => {
    onNavigate(section);
    setOpenMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-[0_6px_30px_rgba(88,28,135,0.18)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-4 flex justify-between items-center">
          {/* Logo */}
          <button
            onClick={() => handleNavigate('inicio')}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <img
                src="/IMG/ebabs-logo-purple.png"
                className="w-11 h-11 rounded-xl shadow-md shadow-purple-500/25 border border-purple-100"
                alt="EBABS Electronic logo"
              />
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-purple-400/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
            </div>

            <span className="font-black text-xl md:text-2xl text-gray-900 tracking-tight">
              <span className="text-gray-900">EBABS</span>{' '}
              <span className="text-purple-700">ELECTRONIC</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {menu.map((m) => (
              <button
                key={m.id}
                onClick={() => handleNavigate(m.id)}
                className={`
                  relative text-sm md:text-base font-semibold tracking-wide pb-1
                  transition-all duration-200
                  after:content-[''] after:absolute after:left-0 after:-bottom-0.5
                  after:h-[2px] after:bg-gradient-to-r after:from-purple-500 after:to-fuchsia-500
                  after:w-0 after:opacity-0 after:transition-all after:duration-300
                  ${
                    activeSection === m.id
                      ? 'text-purple-700 after:w-full after:opacity-100'
                      : 'text-gray-700 hover:text-purple-700 hover:after:w-full hover:after:opacity-100'
                  }
                `}
              >
                {m.label}
              </button>
            ))}

            {/* Teléfono */}
            <div className="hidden lg:flex items-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50/80 px-3 py-1 text-xs font-semibold text-purple-800 shadow-sm hover:bg-purple-100 transition-colors">
                <Phone className="w-4 h-4" />
                <span>(786) 968 1621</span>
              </div>
            </div>

            {/* Carrito */}
            <button
              onClick={open}
              className="relative flex items-center justify-center w-10 h-10 rounded-full border border-purple-100 bg-white shadow-sm hover:bg-purple-50 transition-colors"
            >
              <ShoppingCart className="text-purple-700 w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-fuchsia-400 text-black px-1.5 rounded-full text-[10px] font-bold shadow">
                  {cartCount}
                </span>
              )}
            </button>

            <LangToggle />
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpenMenu((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-full border border-purple-100/70 p-2 text-gray-800 shadow-sm bg-white/80"
          >
            {openMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Purple bottom bar */}
        <div className="h-1 w-full rounded-t-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500" />
      </div>

      {/* Mobile menu */}
      {openMenu && (
        <nav className="md:hidden bg-white/98 backdrop-blur-sm border-t border-purple-100 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-2">
            {menu.map((m) => (
              <button
                key={m.id}
                onClick={() => handleNavigate(m.id)}
                className={`block w-full text-left py-2 text-base font-semibold rounded-lg px-1 transition-colors ${
                  activeSection === m.id
                    ? 'text-purple-700 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50/70'
                }`}
              >
                {m.label}
              </button>
            ))}

            <div className="flex items-center justify-between pt-3 border-t border-purple-100 mt-2">
              <button
                onClick={open}
                className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-100 bg-purple-50 text-sm font-semibold text-purple-800"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="ml-1 bg-fuchsia-400 text-black px-1.5 rounded-full text-[10px] font-bold">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-semibold text-gray-800">
                  (786) 968 1621
                </span>
                <LangToggle />
              </div>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
