// src/components/MotorcycleModal.tsx
import React from 'react';
import { X, Calendar, Fuel, Gauge, Star, Shield, Wrench, Phone } from 'lucide-react';
import { Motorcycle } from '../App';
import { useI18n } from '../i18n/I18nProvider';

interface MotorcycleModalProps {
  motorcycle: Motorcycle;
  onClose: () => void;
  onPhoneCall: () => void;
  onWhatsApp: () => void;
}

/** 🔁 mismo mapeo que en Catalog */
const FEATURE_KEY_BY_ES: Record<string, string> = {
  'Motor eléctrico': 'feature.motor',
  'Ligero y ágil': 'feature.lightAgile',
  'Batería de alta capacidad': 'feature.batteryHigh',
  'Motor eléctrico de alta potencia': 'feature.motorHighPower',
  'Pantalla táctil': 'feature.touchscreen',
  'Conectividad Bluetooth': 'feature.bluetooth',
  'Sistema de navegación GPS': 'feature.gps',
};

const MotorcycleModal: React.FC<MotorcycleModalProps> = ({
  motorcycle,
  onClose,
  onPhoneCall,
  onWhatsApp,
}) => {
  const { t, lang, fmtMoney } = useI18n();

  const tr = (key: string, fallback?: string) => {
    const val = (t as any)(key);
    return val === key ? (fallback ?? key) : val;
  };

  const handleFinancing = () => {
    const msgEs = `¡Hola! Me interesa información sobre financiamiento para la ${motorcycle.name} ${motorcycle.year}. ¿Qué opciones tienen disponibles?`;
    const msgEn = `Hi! I'm interested in financing options for the ${motorcycle.name} ${motorcycle.year}. Could you share what's available?`;
    const message = encodeURIComponent(lang === 'es' ? msgEs : msgEn);
    const whatsappUrl = `https://wa.me/+17869681621?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const condLabel =
    motorcycle.condition === 'Nueva'
      ? t('product.condition.new')
      : t('product.condition.used');

  const pid = String(motorcycle.id);
  const desc = tr(`product.${pid}.desc`, motorcycle.description);

  const feat = (motorcycle.features ?? []).map((f, i) => {
    const kByIndex = `product.${pid}.feature.${i}`;
    const viaIndex = tr(kByIndex, '__MISS__');
    if (viaIndex !== '__MISS__') return viaIndex;

    const k = FEATURE_KEY_BY_ES[f];
    return k ? t(k as any) : f;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">
            {motorcycle.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label={t('modal.close')}
            title={t('modal.close')}
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative">
              <img
                src={motorcycle.image}
                alt={motorcycle.name}
                className="w-full h-72 md:h-80 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute top-4 left-4">
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow ${
                    motorcycle.condition === 'Nueva'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {condLabel}
                </span>
              </div>
              {motorcycle.featured && (
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-300 text-purple-900 px-3 py-1.5 rounded-full text-xs font-bold shadow">
                    {t('product.badge.featured')}
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                  {motorcycle.brand} {motorcycle.model}
                </h3>
                {desc && (
                  <p className="text-gray-700 text-base md:text-lg">
                    {desc}
                  </p>
                )}
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">{t('modal.year')}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {motorcycle.year}
                    </p>
                  </div>
                </div>

                {motorcycle.engine && (
                  <div className="flex items-center gap-3">
                    <Fuel className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">{t('modal.engine')}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {motorcycle.engine}
                      </p>
                    </div>
                  </div>
                )}

                {motorcycle.mileage && (
                  <div className="flex items-center gap-3 col-span-2">
                    <Gauge className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">{t('modal.mileage')}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {motorcycle.mileage.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Features */}
              {feat.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {t('modal.features')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {feat.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full
                                   bg-purple-50 text-purple-800 text-xs font-semibold border border-purple-100"
                      >
                        <Star className="w-3 h-3" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Actions */}
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 space-y-4">
                {Number(motorcycle.price) > 0 && (
                  <p className="text-3xl font-black text-purple-700">
                    {fmtMoney(Number(motorcycle.price))}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={onPhoneCall}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                               bg-white text-purple-700 font-bold border border-purple-200
                               hover:bg-purple-50 transition-colors"
                    aria-label={t('modal.contact')}
                    title={t('modal.contact')}
                  >
                    <Phone className="w-4 h-4" />
                    {t('modal.contact')}
                  </button>

                  <button
                    onClick={handleFinancing}
                    className="inline-flex items-center justify-center px-4 py-3 rounded-xl
                               bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
                  >
                    {t('modal.financing')}
                  </button>
                </div>

                <button
                  onClick={onWhatsApp}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                             bg-green-500 text-white font-bold hover:bg-green-600 transition-colors"
                  aria-label={t('modal.whatsapp')}
                  title={t('modal.whatsapp')}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                  </svg>
                  {t('modal.whatsapp')}
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-4 text-center pt-2">
                <div className="text-gray-700">
                  <Shield className="w-7 h-7 mx-auto mb-1 text-purple-600" />
                  <p className="text-xs font-semibold">{t('guarantee.warranty')}</p>
                </div>
                <div className="text-gray-700">
                  <Wrench className="w-7 h-7 mx-auto mb-1 text-purple-600" />
                  <p className="text-xs font-semibold">{t('guarantee.service')}</p>
                </div>
                <div className="text-gray-700">
                  <Star className="w-7 h-7 mx-auto mb-1 text-purple-600" />
                  <p className="text-xs font-semibold">{t('guarantee.quality')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default MotorcycleModal;
