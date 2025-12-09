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

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* Logo */}
        <button onClick={() => onNavigate('inicio')} className="flex items-center gap-3">
          <img src="/IMG/ebabs-logo-purple.png" className="w-12 h-12" />
          <span className="font-black text-2xl text-[var(--primary)]">
            EBABS ELECTRONIC
          </span>
        </button>

        <nav className="hidden md:flex gap-8">
          {menu.map(m => (
            <button
              key={m.id}
              onClick={() => onNavigate(m.id)}
              className={`text-lg font-semibold ${
                activeSection === m.id ? 'text-[var(--primary)] underline' : 'text-gray-700'
              }`}
            >
              {m.label}
            </button>
          ))}

          <button onClick={open} className="relative flex items-center gap-2">
            <ShoppingCart className="text-[var(--primary)] w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--accent)] text-black px-2 rounded-full text-xs font-bold">
                {cartCount}
              </span>
            )}
          </button>

          <LangToggle />
        </nav>

        <button onClick={() => setOpenMenu(!openMenu)} className="md:hidden">
          {openMenu ? <X /> : <Menu />}
        </button>
      </div>

      {openMenu && (
        <nav className="md:hidden px-4 pb-4 space-y-4 bg-white">
          {menu.map(m => (
            <button
              key={m.id}
              onClick={() => onNavigate(m.id)}
              className={`block text-lg ${
                activeSection === m.id ? 'text-[var(--primary)]' : 'text-gray-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
