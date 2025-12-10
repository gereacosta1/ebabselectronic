// src/components/Hero.tsx
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onNavigate: (section: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section
      id="inicio"
      className="pt-32 pb-20 min-h-screen flex items-center bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700"
    >
      <div className="w-full max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
        {/* Texto */}
        <div className="text-white">
          <p className="uppercase tracking-[0.2em] text-sm md:text-base mb-3 text-yellow-300">
            EBABS ELECTRONIC LLC
          </p>

          <h1 className="font-black text-4xl md:text-5xl lg:text-6xl leading-tight mb-4">
            Electric Mobility &amp; Electronics
            <span className="block text-yellow-300">For Everyday Life ⚡</span>
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-purple-100 mb-6 max-w-xl">
            Scooters, e-bikes, cargo trikes and electronics. Financing, service
            and support from your local shop in Miami.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onNavigate('catalogo')}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full
                         font-extrabold bg-yellow-300 text-purple-900
                         hover:bg-yellow-400 transition-transform duration-300 hover:scale-105"
            >
              View Catalog
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavigate('contacto')}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full
                         font-bold border border-purple-200/70 text-purple-50
                         hover:bg-purple-800/60 transition-transform duration-300 hover:scale-105"
            >
              Visit Our Store
            </button>
          </div>
        </div>

        {/* Imagen */}
        <div className="relative flex items-center justify-center">
          <div
            className="rounded-3xl overflow-hidden shadow-2xl bg-gray-900/40 border border-purple-200/20
                       flex items-center justify-center px-4 py-4 md:px-6 md:py-6"
          >
            <img
              src="/IMG/scooter-ebabs.webp"
              alt="EBABS Electric Scooter in the showroom"
              className="w-full max-h-[420px] object-contain drop-shadow-2xl"
            />
          </div>

          {/* Badge dirección + teléfono */}
          <div className="absolute bottom-4 left-4 bg-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3 border border-purple-200">
            {/* Icono */}
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg shadow-md">
              ⚡
            </div>

            {/* Texto */}
            <div className="leading-tight">
              <p className="text-base font-black text-gray-900">
                811 NE 79th St, Miami FL
              </p>
              <p className="text-sm font-semibold text-purple-700">
                (786) 968 1621
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Open 10:30 AM – 7:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
