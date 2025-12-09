// src/components/Footer.tsx
import React from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 bg-black text-white pt-12 pb-8 border-t border-purple-500/40">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header / marca */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 h-1 w-24 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 rounded-full" />

          <h2 className="text-2xl font-black tracking-wide text-purple-100">
            EBABS ELECTRONIC LLC
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Electric Mobility & Electronics for Everyday Life
          </p>
        </div>

        {/* 3 columnas */}
        <div className="grid gap-8 md:grid-cols-3 text-sm">
          {/* Columna 1: contacto */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-purple-200 uppercase mb-4">
              Contact
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-[2px] text-purple-400" />
                <span>811 NE 79th St – Miami, FL</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-400" />
                <a href="tel:+13050000000" className="hover:text-purple-200">
                  +1 (305) 000-0000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <a
                  href="mailto:info@ebabselectronic.com"
                  className="hover:text-purple-200"
                >
                  info@ebabselectronic.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-[2px] text-purple-400" />
                <span>
                  Mon – Sat: 10:00 AM – 7:30 PM
                  <br />
                  Sun: 10:00 AM – 6:00 PM
                </span>
              </li>
            </ul>
          </div>

          {/* Columna 2: navegación rápida */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-purple-200 uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#inicio" className="hover:text-purple-200">
                  Home
                </a>
              </li>
              <li>
                <a href="#catalogo" className="hover:text-purple-200">
                  Catalog
                </a>
              </li>
              <li>
                <a href="#nosotros" className="hover:text-purple-200">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-purple-200">
                  Contact
                </a>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  Financing available with Affirm.
                </span>
              </li>
            </ul>
          </div>

          {/* Columna 3: servicios / redes */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-purple-200 uppercase mb-4">
              Services & Social
            </h3>
            <ul className="space-y-2 text-gray-300 mb-4">
              <li>• New & used electric scooters</li>
              <li>• E-bikes & cargo trikes</li>
              <li>• Technical service & repairs</li>
              <li>• Electronics & accessories</li>
            </ul>

            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-purple-700 hover:bg-purple-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-purple-700 hover:bg-purple-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#contacto"
                className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-500 px-4 text-xs font-semibold hover:bg-emerald-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* línea final */}
        <div className="mt-10 border-t border-white/10 pt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} EBABS ELECTRONIC. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
